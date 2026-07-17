/**
 * tests/animal.test.js — Integration tests for Animal API endpoints
 * Tests CRUD operations on animal records with authentication and authorization.
 * Uses MongoDB Memory Server for isolated database testing without external dependencies.
 * Focuses on security boundaries: ensuring proper role-based access control
 * and auditing of sensitive operations.
 */

// Mock console.log before requiring the app
jest.spyOn(console, 'log').mockImplementation(() => {});

const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = require('../app');
const Animal = require('../models/Animal');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

let mongoServer;
let token;

// Setup in-memory database and test environment before all tests
beforeAll(async () => {
    process.env.JWT_SECRET = 'testsecret';

    mongoServer = await MongoMemoryServer.create();
    
    // Check if already connected before connecting
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(mongoServer.getUri());
    }
});

// Reset database state before each test for consistent test isolation
beforeEach(async () => {
    // Clear all collections to ensure clean test state
    await Animal.deleteMany({});
    await User.deleteMany({});
    await AuditLog.deleteMany({});

    // Create a test employee user for authenticated test cases
    const user = await User.create({
        username: 'employee',
        password: 'hash',
        role: 'employee'
    });

    // Generate a valid JWT token for the employee user
    token = jwt.sign(
        {
            id: user._id,
            username: user.username,
            role: user.role
        },
        process.env.JWT_SECRET
    );
});

// Clean up database connection and memory server after all tests complete
afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

// *** Animal CRUD Operations ***

describe('Animal API', () => {
    test('GET animals returns paginated data', async () => {
        // Create a test animal record to verify retrieval
        await Animal.create({
            animal_id: 'A001',
            name: 'Buddy',
            breed: 'Dog',
            animal_type: 'Dog'
        });

        const response = await request(app)
            .get('/api/animals');

        expect(response.statusCode).toBe(200);
        expect(response.body.animals.length).toBe(1);
    });

    test('employee can create animal', async () => {
        const response = await request(app)
            .post('/api/animals')
            .set('Authorization', `Bearer ${token}`)
            .send({
                animal_id: 'A002',
                name: 'Max',
                breed: 'Labrador',
                animal_type: 'Dog'
            });

        expect(response.statusCode).toBe(201);
        expect(response.body.name).toBe('Max');

        // Verify that animal creation was logged in audit trail
        const log = await AuditLog.findOne({
            action: 'CREATE_ANIMAL'
        });

        expect(log).not.toBeNull();
    });

    test('public user cannot create animal', async () => {
        // Generate token for public user with limited permissions
        const publicToken = jwt.sign(
            {
                username: 'public',
                role: 'public'
            },
            process.env.JWT_SECRET
        );

        const response = await request(app)
            .post('/api/animals')
            .set('Authorization', `Bearer ${publicToken}`)
            .send({
                animal_id: 'A003',
                name: 'Test',
                breed: 'Mixed',
                animal_type: 'Dog'
            });

        // Expect 403 Forbidden for non-employee users
        expect(response.statusCode).toBe(403);
    });

    test('updates animal record', async () => {
        // Fix: Add all required fields
        const animal = await Animal.create({
            animal_id: 'A004',
            name: 'Old Name',
            breed: 'Golden Retriever',
            animal_type: 'Dog'
        });

        const response = await request(app)
            .put(`/api/animals/${animal._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'New Name'
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.name).toBe('New Name');
    });

    test('deletes animal record', async () => {
        // Fix: Add all required fields
        const animal = await Animal.create({
            animal_id: 'A005',
            name: 'Delete Me',
            breed: 'Poodle',
            animal_type: 'Dog'
        });

        const response = await request(app)
            .delete(`/api/animals/${animal._id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(response.statusCode).toBe(200);

        // Verify that the animal was actually deleted from database
        const found = await Animal.findById(animal._id);
        expect(found).toBeNull();
    });
});