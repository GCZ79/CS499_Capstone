/**
 * tests/animal_validation.test.js - MongoDB JSON Schema validation tests
 * Tests database-level validation rules for the animals collection.
 * Tests cover required fields, geographic coordinate ranges,
 * and acceptance of valid animal records.
 */

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Animal = require('../models/Animal');

let mongoServer;

// *** Setup / Teardown ***

beforeAll(async () => {

    // Spin up an isolated in-memory MongoDB instance for this test file.
    mongoServer = await MongoMemoryServer.create();

    await mongoose.connect(mongoServer.getUri());

    // Apply MongoDB JSON Schema validation rules
    await mongoose.connection.db.createCollection('animals');

    await mongoose.connection.db.command({
        collMod: 'animals',
        validator: {
            $jsonSchema: {
                bsonType: 'object',
                required: ['animal_type', 'breed'],
                properties: {
                    animal_id: {
                        bsonType: 'string'
                    },
                    animal_type: {
                        bsonType: 'string'
                    },
                    breed: {
                        bsonType: 'string'
                    },
                    location_lat: {
                        bsonType: ['double', 'int', 'long'],
                        minimum: -90,
                        maximum: 90
                    },
                    location_long: {
                        bsonType: ['double', 'int', 'long'],
                        minimum: -180,
                        maximum: 180
                    }
                }
            }
        },
        validationLevel: 'strict',
        validationAction: 'error'
    });

});

beforeEach(async () => {

    // Clear test data before each test
    await Animal.deleteMany({});

});

afterAll(async () => {

    await mongoose.disconnect();
    await mongoServer.stop();

});


// *** MongoDB JSON Schema Validation Tests ***

describe('Animal Collection JSON Schema Validation', () => {


    test('allows valid animal records with valid coordinates', async () => {

        const animal = await Animal.create({
            animal_id: 'V001',
            name: 'Buddy',
            breed: 'Labrador',
            animal_type: 'Dog',
            location_lat: 30,
            location_long: -97
        });

        expect(animal.animal_type).toBe('Dog');
        expect(animal.breed).toBe('Labrador');

    });


    test('rejects records missing required animal_type field', async () => {

        await expect(
            Animal.create({
                animal_id: 'V002',
                name: 'Missing Type',
                breed: 'Mixed'
            })
        ).rejects.toThrow();

    });


    test('rejects records missing required breed field', async () => {

        await expect(
            Animal.create({
                animal_id: 'V003',
                name: 'Missing Breed',
                animal_type: 'Dog'
            })
        ).rejects.toThrow();

    });


    test('rejects latitude values above maximum allowed range', async () => {

        await expect(
            Animal.create({
                animal_id: 'V004',
                name: 'Invalid Latitude',
                breed: 'Mixed',
                animal_type: 'Dog',
                location_lat: 100,
                location_long: -97
            })
        ).rejects.toThrow();

    });


    test('rejects latitude values below minimum allowed range', async () => {

        await expect(
            Animal.create({
                animal_id: 'V005',
                name: 'Invalid Latitude',
                breed: 'Mixed',
                animal_type: 'Dog',
                location_lat: -100,
                location_long: -97
            })
        ).rejects.toThrow();

    });


    test('rejects longitude values outside allowed range', async () => {

        await expect(
            Animal.create({
                animal_id: 'V006',
                name: 'Invalid Longitude',
                breed: 'Mixed',
                animal_type: 'Dog',
                location_lat: 30,
                location_long: 200
            })
        ).rejects.toThrow();

    });


    test('accepts integer coordinate values after schema enhancement', async () => {

        const animal = await Animal.create({
            animal_id: 'V007',
            name: 'Integer Coordinates',
            breed: 'Mixed',
            animal_type: 'Dog',
            location_lat: 30,
            location_long: -97
        });

        expect(animal.location_lat).toBe(30);
        expect(animal.location_long).toBe(-97);

    });

});