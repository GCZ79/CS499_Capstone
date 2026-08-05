/**
 * models/Training.js
 * Mongoose model for animal training records.
 * Implements one-to-many relationship:
 * One animal -> Many training records
 */

const mongoose = require('mongoose');

const trainingSchema = new mongoose.Schema(
    {
        animal_id: {
            type: String,
            required: true,
            index: true
        },

        rescue_type: {
            type: String,
            required: true,
            enum: [
                'Water Rescue',
                'Mountain Rescue',
                'Disaster Rescue',
                'Other'
            ]
        },

        training_status: {
            type: String,
            required: true,
            enum: [
                'Scheduled',
                'In Progress',
                'Completed',
                'Failed',
                'Cancelled'
            ]
        },

        training_level: {
            type: String,
            required: true,
            enum: [
                'Beginner',
                'Intermediate',
                'Advanced',
                'Expert',
                'N/A'
            ]
        },

        trainer_id: {
            type: String,
            required: true,
            index: true
        },

        trainer_name: {
            type: String,
            required: true
        },

        start_date: {
            type: Date,
            required: true
        },

        completion_date: {
            type: Date
        },

        score: {
            type: Number,
            min: 0,
            max: 100
        },

        notes: {
            type: String
        }
    },
    {
        collection: 'training_records',
        timestamps: true
    }
);


// Compound index to support animal training history queries
trainingSchema.index({
    animal_id: 1,
    training_status: 1
});


module.exports = mongoose.model('Training', trainingSchema);