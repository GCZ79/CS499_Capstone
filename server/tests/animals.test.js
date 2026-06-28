/**
 * tests/animals.test.js - Integration tests for /api/animals routes
 * Uses supertest to make HTTP requests without starting a real server.
 * Tests cover response structure, pagination, rescue type filtering,
 * and error handling.
 */

const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const { validateQuery } = require('../middleware/validate');
const animalsRoute = require('../routes/animals');

// Build a minimal Express app for testing - mirrors app.js without
// helmet, cors, and rate limiting which are not relevant to route logic
const app = express();
app.use(express.json());
app.use('/api/animals', validateQuery, animalsRoute);

// *** Setup / Teardown ***

beforeAll(async () => {
    // Connect to the same local MongoDB used in development
    // In a CI environment this should point to a dedicated test database
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/aac');
});

afterAll(async () => {
    await mongoose.disconnect();
});

// *** GET /api/animals ***

describe('GET /api/animals', () => {

    test('returns 200 with expected response shape', async () => {
        const res = await request(app).get('/api/animals');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('animals');
        expect(res.body).toHaveProperty('total');
        expect(res.body).toHaveProperty('page');
        expect(res.body).toHaveProperty('pageSize');
        expect(Array.isArray(res.body.animals)).toBe(true);
    });

    test('respects pageSize parameter', async () => {
        const res = await request(app).get('/api/animals?pageSize=5');
        expect(res.status).toBe(200);
        expect(res.body.animals.length).toBeLessThanOrEqual(5);
    });

    test('respects page parameter', async () => {
        const page0 = await request(app).get('/api/animals?page=0&pageSize=5');
        const page1 = await request(app).get('/api/animals?page=1&pageSize=5');
        expect(page0.status).toBe(200);
        expect(page1.status).toBe(200);
        // First animal on page 1 should differ from first animal on page 0
        if (page0.body.animals.length > 0 && page1.body.animals.length > 0) {
            expect(page0.body.animals[0]._id).not.toBe(page1.body.animals[0]._id);
        }
    });

    test('filters by water rescue type', async () => {
        const res = await request(app).get('/api/animals?rescueType=water&pageSize=20');
        expect(res.status).toBe(200);
        // All returned animals should be dogs
        res.body.animals.forEach(a => {
            expect(a.animal_type).toBe('Dog');
        });
    });

    test('returns 400 for invalid rescue type', async () => {
        const res = await request(app).get('/api/animals?rescueType=invalid');
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
    });

    test('returns 400 for negative page number', async () => {
        const res = await request(app).get('/api/animals?page=-1');
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
    });

    test('returns 400 when pageSize exceeds 100', async () => {
        const res = await request(app).get('/api/animals?pageSize=200');
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
    });

});

// *** GET /api/animals/breeds ***

describe('GET /api/animals/breeds', () => {

    test('returns 200 with array of breed counts', async () => {
        const res = await request(app).get('/api/animals/breeds?rescueType=water');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test('each breed entry has breed and count fields', async () => {
        const res = await request(app).get('/api/animals/breeds?rescueType=water');
        expect(res.status).toBe(200);
        if (res.body.length > 0) {
            expect(res.body[0]).toHaveProperty('breed');
            expect(res.body[0]).toHaveProperty('count');
            expect(typeof res.body[0].count).toBe('number');
        }
    });

    test('results are sorted by count descending', async () => {
        const res = await request(app).get('/api/animals/breeds?rescueType=water');
        expect(res.status).toBe(200);
        for (let i = 1; i < res.body.length; i++) {
            expect(res.body[i - 1].count).toBeGreaterThanOrEqual(res.body[i].count);
        }
    });

});

// *** GET /api/animals/:id ***

describe('GET /api/animals/:id', () => {

    test('returns 404 for a non-existent id', async () => {
        const fakeId = '000000000000000000000000'; // valid ObjectId format, no match
        const res = await request(app).get(`/api/animals/${fakeId}`);
        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty('error');
    });

    test('returns 500 for a malformed id', async () => {
        const res = await request(app).get('/api/animals/not-a-valid-id');
        expect(res.status).toBe(500);
    });

});