/**
 * tests/auth.test.js — Integration tests for Authentication API endpoints
 * Tests user registration and login functionality with password hashing.
 * Uses MongoDB Memory Server for isolated database testing without external dependencies.
 * Focuses on security boundaries: ensuring passwords are properly hashed,
 * invalid credentials are rejected, and valid users receive JWT tokens.
 */

// Mock console.log before requiring the app to suppress dotenv and connection logs
jest.spyOn(console, 'log').mockImplementation(() => {});

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const bcrypt = require('bcrypt');

const app = require('../app');
const User = require('../models/User');

let mongoServer;

// Setup in-memory database before all tests
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    
    // Check if already connected before connecting
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(uri);
    }
});

// Clean up database after each test for test isolation
afterEach(async () => {
    await User.deleteMany({});
});

// Clean up database connection and memory server after all tests complete
afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

// *** Authentication Endpoints ***

describe('Authentication API', () => {
    test('registers a new user', async () => {
        const response = await request(app)
            .post('/api/auth/register')
            .send({
                username: 'testuser',
                password: 'password123'
            });

        // Log response for debugging if test fails
        if (response.statusCode !== 201) {
            console.log('Registration response:', response.body);
        }

        expect(response.statusCode).toBe(201);
        expect(response.body.message).toBe('User created');

        // Verify user was saved to database with hashed password
        const user = await User.findOne({ username: 'testuser' });
        expect(user).not.toBeNull();
        expect(user.password).not.toBe('password123'); // Password should be hashed
    });

    test('logs in with valid credentials', async () => {
        // Create a test user with hashed password
        const password = await bcrypt.hash('password123', 10);
        
        await User.create({
            username: 'admin',
            password,
            role: 'admin'
        });

        const response = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'admin',
                password: 'password123'
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.token).toBeDefined(); // Should receive JWT token
        expect(response.body.role).toBe('admin'); // Role should match
    });

    test('rejects invalid password', async () => {
        // Create a test user with valid credentials
        await User.create({
            username: 'admin',
            password: await bcrypt.hash('password123', 10),
            role: 'admin'
        });

        const response = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'admin',
                password: 'wrong' // Invalid password
            });

        expect(response.statusCode).toBe(401);
        expect(response.body.error).toBe('Invalid credentials');
    });
});