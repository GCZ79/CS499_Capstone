/**
 * models/Animal.js - Mongoose schema for the animal collection
 * Defines the structure and validation rules for animal records from the shelter
 * database.
 * Maps directly to the MongoDB collection used by the original Python dashboard.
 * Uses strict: false to accommodate flexible fields from the legacy data source.
 */

const mongoose = require('mongoose');

const animalSchema = new mongoose.Schema({
  // animal_id not required or unique because some records may have missing IDs
  animal_id:                 { type: String },
  animal_type:               { type: String, required: true },
  breed:                     { type: String, required: true },
  color:                     { type: String },
  name:                      { type: String },
  outcome_type:              { type: String },
  outcome_subtype:           { type: String },
  sex_upon_outcome: {
    type: String,
    enum: ['Intact Male', 'Intact Female',
           'Neutered Male', 'Spayed Female', 'Unknown']
  },
  age_upon_outcome:          { type: String },
  age_upon_outcome_in_weeks: { type: Number, min: 0 },
  date_of_birth:             { type: String },
  datetime:                  { type: String },
  monthyear:                 { type: String },
  location_lat:              { type: Number, min: -90,  max: 90  },
  location_long:             { type: Number, min: -180, max: 180 }
}, {
  collection: 'animals',
  strict: false
});

// Compound index

/**
 * Compound index for optimizing rescue type filter queries.
 * Covers the most common filter combinations used in
 * water, mountain, and disaster rescue queries.
 * Fields ordered by selectivity: type > breed > sex > age
 */

animalSchema.index({
  animal_type:               1,
  breed:                     1,
  sex_upon_outcome:          1,
  age_upon_outcome_in_weeks: 1
}, { name: 'rescue_filter_index' });

module.exports = mongoose.model('Animal', animalSchema);