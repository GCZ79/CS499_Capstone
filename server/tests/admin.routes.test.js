/**
 * tests/admin.test.js — Integration tests for Admin API endpoints
 * Tests authentication, authorization, and functionality of admin routes.
 * Uses MongoDB Memory Server for isolated database testing without external dependencies.
 * Focuses on security boundaries: ensuring non-admin users cannot access admin features
 * and that proper authentication is enforced.
 */

// Mock console.log before requiring the app
jest.spyOn(console, 'log').mockImplementation(() => {});

const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = require('../app');
const AuditLog = require('../models/AuditLog');

let mongoServer;
let adminToken;

// Setup in-memory database and test environment before all tests
beforeAll(async () => {
    process.env.JWT_SECRET = 'testsecret';

    mongoServer = await MongoMemoryServer.create();
    
    // Check if already connected before connecting
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(mongoServer.getUri());
    }
});

// Reset state before each test for consistent test isolation
beforeEach(async () => {
    // Clear the audit log before each test
    await AuditLog.deleteMany({});
    
    // Generate a valid admin token for authenticated test cases
    adminToken = jwt.sign(
        {
            username: 'admin',
            role: 'admin'
        },
        process.env.JWT_SECRET
    );
});

// Clean up database connection and memory server after all tests complete
afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

// *** Authentication & Authorization ***

describe('Admin API', () => {
    test('denies backup without token', async () => {
        const response = await request(app)
            .post('/api/admin/backup');

        expect(response.statusCode).toBe(401);
    });

    test('denies audit access for non-admin', async () => {
        const token = jwt.sign(
            {
                username: 'employee',
                role: 'employee'
            },
            process.env.JWT_SECRET
        );

        const response = await request(app)
            .get('/api/admin/audit')
            .set('Authorization', `Bearer ${token}`);

        expect(response.statusCode).toBe(403);
    });

    test('allows admin audit access', async () => {
        // Clear any existing logs first
        await AuditLog.deleteMany({});
        
        // Create exactly ONE audit log
        await AuditLog.create({
            username: 'admin',
            role: 'admin',
            action: 'TEST',
            details: 'Testing audit'
        });

        const response = await request(app)
            .get('/api/admin/audit')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.statusCode).toBe(200);
        
        // Check that we have at least our test log
        expect(response.body.length).toBeGreaterThanOrEqual(1);
        
        // Check that our TEST log exists in the response
        const testLog = response.body.find(log => log.action === 'TEST');
        expect(testLog).toBeDefined();
        expect(testLog.details).toBe('Testing audit');
    });
});