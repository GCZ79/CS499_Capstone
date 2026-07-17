/**
 * tests/admin.test.js — Integration tests for Administrative API endpoints
 *
 * Tests:
 * - Admin-only route protection
 * - Backup management
 * - Restore validation
 * - Audit log access
 *
 * Uses MongoDB Memory Server for isolated testing.
 *
 * Demonstrates:
 * - JWT authentication
 * - Role Based Access Control (RBAC)
 * - Security boundaries
 * - Administrative functionality
 */

// Mock console.log before requiring the app to suppress dotenv and connection logs
jest.spyOn(console, 'log').mockImplementation(() => {});

const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = require('../app');

const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

let mongoServer;

// Helper function to generate JWT tokens for testing different roles
function createToken(role) {
    return jwt.sign(
        {
            id: new mongoose.Types.ObjectId(),
            username: 'testuser',
            role
        },
        process.env.JWT_SECRET || 'testsecret',
        {
            expiresIn: '1h'
        }
    );
}

// Setup in-memory database and test environment before all tests
beforeAll(async () => {
    process.env.JWT_SECRET = 'testsecret';

    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(uri);
    }
});

// Clean up database after every test for test isolation
afterEach(async () => {
    await User.deleteMany({});
    await AuditLog.deleteMany({});
});

// Clean up database connection and memory server after all tests complete
afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

// *** Admin API Authentication & Authorization ***

describe('Admin API', () => {
    test('rejects admin routes without JWT token', async () => {
        const response = await request(app)
            .get('/api/admin/audit');

        expect(response.statusCode).toBe(401);
        expect(response.body.error).toBe('Authentication token required');
    });

    test('rejects non-admin users from admin routes', async () => {
        // Generate token for employee (non-admin) user
        const token = createToken('employee');

        const response = await request(app)
            .get('/api/admin/audit')
            .set('Authorization', `Bearer ${token}`);

        expect(response.statusCode).toBe(403);
        expect(response.body.error).toBe('Access denied');
    });

    // *** Audit Log Access ***

    test('allows admin users to view audit logs', async () => {
        // Create a test audit log entry
        await AuditLog.create({
            username: 'admin',
            role: 'admin',
            action: 'TEST_ACTION',
            details: 'Test audit record'
        });

        const token = createToken('admin');

        const response = await request(app)
            .get('/api/admin/audit')
            .set('Authorization', `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(1);
        expect(response.body[0].action).toBe('TEST_ACTION');
    });

    // *** Backup Operations ***

    test('requires admin role for backup creation', async () => {
        // Attempt backup with employee role (should be rejected)
        const token = createToken('employee');

        const response = await request(app)
            .post('/api/admin/backup')
            .set('Authorization', `Bearer ${token}`);

        expect(response.statusCode).toBe(403);
        expect(response.body.error).toBe('Access denied');
    });

    test('requires filename when restoring database', async () => {
        // Attempt restore without filename (should be rejected)
        const token = createToken('admin');

        const response = await request(app)
            .post('/api/admin/import')
            .set('Authorization', `Bearer ${token}`)
            .send({});

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('Backup filename required');
    });

    test('allows admin users to retrieve backup list', async () => {
        const token = createToken('admin');

        const response = await request(app)
            .get('/api/admin/backups')
            .set('Authorization', `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });
});