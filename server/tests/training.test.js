/**
 * tests/training.test.js — Integration tests for Training API endpoints
 *
 * Tests CRUD operations, JWT authentication,
 * role-based authorization, and animal training relationships.
 *
 * Uses MongoDB Memory Server for isolated database testing.
 */

// Mock console.log before requiring the app to suppress dotenv and connection logs
jest.spyOn(console, 'log').mockImplementation(() => { });


const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const bcrypt = require('bcrypt');

const app = require('../app');

const User = require('../models/User');
const Training = require('../models/Training');

let mongoServer;

let employeeToken;
let adminToken;
let publicToken;

// *** Setup / Teardown ***

beforeAll(async () => {

    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(uri);
    }

    // Create test users

    await User.create([
        {
            username: 'employee',
            password: await bcrypt.hash('password123', 10),
            role: 'employee'
        },
        {
            username: 'admin',
            password: await bcrypt.hash('password123', 10),
            role: 'admin'
        },
        {
            username: 'public',
            password: await bcrypt.hash('password123', 10),
            role: 'public'
        }
    ]);

    // Login and store JWT tokens

    const employeeLogin = await request(app)
        .post('/api/auth/login')
        .send({
            username: 'employee',
            password: 'password123'
        });

    employeeToken = employeeLogin.body.token;

    const adminLogin = await request(app)
        .post('/api/auth/login')
        .send({
            username: 'admin',
            password: 'password123'
        });

    adminToken = adminLogin.body.token;

    const publicLogin = await request(app)
        .post('/api/auth/login')
        .send({
            username: 'public',
            password: 'password123'
        });

    publicToken = publicLogin.body.token;
});

beforeEach(async () => {
    await Training.deleteMany({});
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

// *** Authorization Tests ***

describe('Training Authorization', () => {

    test('rejects request without authentication token', async () => {

        const response = await request(app)
            .get('/api/training');

        expect(response.statusCode).toBe(401);
        expect(response.body.error)
            .toBe('Authentication token required');
    });

    test('rejects public users from accessing training records', async () => {

        const response = await request(app)
            .get('/api/training')
            .set('Authorization', `Bearer ${publicToken}`);

        expect(response.statusCode).toBe(403);
        expect(response.body.error)
            .toBe('Access denied');
    });
});

// *** Training CRUD Tests ***

describe('Training API CRUD', () => {

    test('employee can create a training record', async () => {

        const response = await request(app)
            .post('/api/training')
            .set('Authorization', `Bearer ${employeeToken}`)
            .send({
                animal_id: 'A001',
                rescue_type: 'Water Rescue',
                training_status: 'Completed',
                training_level: 'Advanced',
                trainer_id: 'T001',
                trainer_name: 'John Smith',
                start_date: '2026-07-01',
                completion_date: '2026-07-20',
                score: 95,
                notes: 'Excellent performance'
            });

        expect(response.statusCode).toBe(201);
        expect(response.body.animal_id)
            .toBe('A001');
    });

    test('employee can retrieve training records', async () => {

        await Training.create({
            animal_id: 'A001',
            rescue_type: 'Water Rescue',
            training_status: 'Completed',
            training_level: 'Advanced',
            trainer_id: 'T001',
            trainer_name: 'John Smith',
            start_date: new Date(),
            score: 95
        });

        const response = await request(app)
            .get('/api/training')
            .set('Authorization', `Bearer ${employeeToken}`);

        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body))
            .toBe(true);
    });

    test('employee can retrieve specific animal training history', async () => {

        await Training.create({
            animal_id: 'A001',
            rescue_type: 'Water Rescue',
            training_status: 'Completed',
            training_level: 'Advanced',
            trainer_id: 'T001',
            trainer_name: 'John Smith',
            start_date: new Date()
        });

        const response = await request(app)
            .get('/api/training/A001')
            .set('Authorization', `Bearer ${employeeToken}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.length)
            .toBe(1);

        expect(response.body[0].animal_id)
            .toBe('A001');
    });

    test('employee can update training records', async () => {

        const training = await Training.create({
            animal_id: 'A001',
            rescue_type: 'Water Rescue',
            training_status: 'Scheduled',
            training_level: 'Beginner',
            trainer_id: 'T001',
            trainer_name: 'John Smith',
            start_date: new Date()
        });

        const response = await request(app)
            .put(`/api/training/${training._id}`)
            .set('Authorization', `Bearer ${employeeToken}`)
            .send({
                training_status: 'Completed'
            });

        expect(response.statusCode)
            .toBe(200);

        expect(response.body.training_status)
            .toBe('Completed');
    });

    test('employee cannot delete training records', async () => {

        const training = await Training.create({
            animal_id: 'A001',
            rescue_type: 'Water Rescue',
            training_status: 'Completed',
            training_level: 'Advanced',
            trainer_id: 'T001',
            trainer_name: 'John Smith',
            start_date: new Date()
        });

        const response = await request(app)
            .delete(`/api/training/${training._id}`)
            .set('Authorization', `Bearer ${employeeToken}`);

        expect(response.statusCode)
            .toBe(403);
    });

    test('admin can delete training records', async () => {

        const training = await Training.create({
            animal_id: 'A001',
            rescue_type: 'Water Rescue',
            training_status: 'Completed',
            training_level: 'Advanced',
            trainer_id: 'T001',
            trainer_name: 'John Smith',
            start_date: new Date()
        });

        const response = await request(app)
            .delete(`/api/training/${training._id}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.statusCode)
            .toBe(200);
    });

    test('joins training records with matching animal data', async () => {

        const Animal = require('../models/Animal');

        await Animal.create({
            animal_id: 'A001',
            name: 'Buddy',
            breed: 'Labrador Mix',
            animal_type: 'Dog'
        });

        await Training.create({
            animal_id: 'A001',
            rescue_type: 'Water Rescue',
            training_status: 'Completed',
            training_level: 'Advanced',
            trainer_id: 'T001',
            trainer_name: 'John Smith',
            start_date: new Date(),
            score: 95,
            notes: 'Good performance'
        });

        const response = await request(app)
            .get('/api/training')
            .set('Authorization', `Bearer ${employeeToken}`);

        expect(response.statusCode)
            .toBe(200);

        expect(response.body[0].animal_name)
            .toBe('Buddy');

        expect(response.body[0].breed)
            .toBe('Labrador Mix');

        expect(response.body[0].animal_type)
            .toBe('Dog');
    });
});