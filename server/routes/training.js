/**
 * routes/training.js
 * CRUD routes for animal training records.
 * Implements one-to-many relationship:
 * One animal -> Many training records
 */

const express = require('express');
const router = express.Router();
const Animal = require('../models/Animal');
const Training = require('../models/Training');
const AuditLog = require('../models/AuditLog');
const authenticateToken = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

// GET /api/training
// Return all training records
router.get('/',
    authenticateToken,
    requireRole('admin', 'employee'),
    async (req, res) => {

        try {

            const records = await Training.aggregate([
                {
                    $lookup: {
                        from: 'animals',
                        localField: 'animal_id',
                        foreignField: 'animal_id',
                        as: 'animal'
                    }
                },
                {
                    $unwind: {
                        path: '$animal',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $project: {
                        animal_id: 1,
                        rescue_type: 1,
                        training_status: 1,
                        training_level: 1,
                        trainer_id: 1,
                        trainer_name: 1,
                        start_date: 1,
                        completion_date: 1,
                        score: 1,
                        notes: 1,
                        createdAt: 1,

                        animal_name: '$animal.name',
                        breed: '$animal.breed',
                        animal_type: '$animal.animal_type'
                    }
                }
            ]);

            res.status(200).json(records);

        } catch (error) {

            console.error(error);

            res.status(500)
                .json({ error: 'Failed to retrieve training records' });
        }
    });

// GET /api/training/id/:id
// Return one training record by MongoDB ID
router.get('/id/:id',
    authenticateToken,
    requireRole('admin', 'employee'),
    async (req, res) => {

        try {
            const training = await Training.findById(
                req.params.id
            );

            if (!training) {
                return res.status(404).json({
                    error: 'Training record not found'
                });
            }

            res.status(200).json(training);

        } catch (error) {
            res.status(400).json({error: error.message});
        }
    });

// GET /api/training/details
// Return training records with animal information joined
router.get('/details',
    authenticateToken,
    requireRole('admin', 'employee'),
    async (req, res) => {

        try {
            const records = await Training.aggregate([
                {
                    $lookup: {
                        from: 'animals',
                        localField: 'animal_id',
                        foreignField: 'animal_id',
                        as: 'animal'
                    }
                },
                {
                    $unwind: {
                        path: '$animal',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $project: {
                        animal_id: 1,
                        rescue_type: 1,

                        training_status: 1,
                        training_level: 1,

                        trainer_id: 1,
                        trainer_name: 1,

                        start_date: 1,
                        completion_date: 1,
                        score: 1,
                        notes: 1,

                        createdAt: 1,

                        animal_name: '$animal.name',
                        breed: '$animal.breed',
                        animal_type: '$animal.animal_type'
                    }
                }
            ]);

            res.status(200).json(records);

        } catch (error) {
            res.status(500).json({
                error: 'Failed to retrieve training details'
            });
        }
    });

// GET /api/training/:animal_id
// Return training history for one animal
router.get('/:animal_id',
    authenticateToken,
    requireRole('admin', 'employee'),
    async (req, res) => {

    try {
        const records = await Training.find({
            animal_id: req.params.animal_id
        });
        res.status(200).json(records);

    } catch (error) {
        res.status(500).json({error: 'Failed to retrieve animal training history'});
    }
});

// POST /api/training
// Create new training record
router.post('/',
    authenticateToken,
    requireRole('admin', 'employee'),
    async (req, res) => {

    try {
        const training = new Training(req.body);
        const savedTraining = await training.save();

        await AuditLog.create({
            username: req.user.username,
            role: req.user.role,
            action: 'TRAINING_CREATE',
            details: `Created training record for animal ${savedTraining.animal_id}`
        });

        res.status(201).json(savedTraining);

    } catch (error) {
        res.status(400).json({error: error.message});
    }
});

// PUT /api/training/:id
// Update training record
router.put('/:id',
    authenticateToken,
    requireRole('admin', 'employee'),
    async (req, res) => {

    try {
        const updatedTraining = await Training.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                returnDocument: 'after',
                runValidators: true
            }
        );

        if (!updatedTraining) {
            return res.status(404).json({error: 'Training record not found'});
        }

        await AuditLog.create({
            username: req.user.username,
            role: req.user.role,
            action: 'TRAINING_UPDATE',
            details: `Updated training record ${updatedTraining._id}`
        });

        res.status(200).json(updatedTraining);

    } catch (error) {
        res.status(400).json({error: error.message});
    }
});

// DELETE /api/training/:id
// Delete training record
router.delete('/:id',
    authenticateToken,
    requireRole('admin'),
    async (req, res) => {

    try {
        const deletedTraining = await Training.findByIdAndDelete(
            req.params.id
        );

        if (!deletedTraining) {
            return res.status(404).json({error: 'Training record not found'});
        }

        await AuditLog.create({
            username: req.user.username,
            role: req.user.role,
            action: 'TRAINING_DELETE',
            details: `Deleted training record ${deletedTraining._id}`
        });

        res.status(200).json({
            message: 'Training record deleted successfully'
        });

    } catch (error) {

        res.status(400).json({error: error.message});
    }
});

module.exports = router;