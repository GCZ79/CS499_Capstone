/**
 * routes/animals.js - API routes for animal management and analytics
 * Provides authentication, CRUD operations (Create, Read, Update, Delete)
 * for animal records, along with breed distribution analytics used by the
 * Grazioso Salvare dashboard. Replaces the filter_data() and update_pie_chart()
 * callbacks from the original Python dashboard while extending the application
 * with full RESTful functionality. All routes return JSON responses consumable
 * by the Angular frontend.
 */

const authenticateToken = require('../middleware/auth');
const requireRole       = require('../middleware/requireRole');
const express           = require('express');
const router            = express.Router();
const mongoose          = require('mongoose');
const Animal            = require('../models/Animal');
const AuditLog          = require('../models/AuditLog');
const queries           = require('../config/rescueQueries');
const { performance }   = require('perf_hooks');
const LRUCache          = require('../cache/LRUCache');

const animalCache       = new LRUCache(8);

// GET /api/animals
// Returns a paginated list of animals, optionally filtered by rescue type
// Replaces the filter_data() callback from the original Python dashboard
router.get('/', async (req, res) => {
  try {
    const startTime = performance.now();
    const rescueType = req.query.rescueType || 'reset';
    const page = parseInt(req.query.page) || 0;
    const pageSize = parseInt(req.query.pageSize) || 10;

    /**
    * Build a unique cache key using the current rescue
    * filter and pagination settings.
    * Each rescue type/page combination is cached separately.
    */
    const cacheKey = JSON.stringify({
      rescueType,
      page,
      pageSize
    });

    // Get the MongoDB filter from the rescueQueries config
    // Falls back to an empty query if the rescue type is invalid
    const query = queries[rescueType] || {};

    /**
    * Check whether the requested data already exists
    * in the LRU cache.
    */
    const cachedResponse = animalCache.get(cacheKey);
    if (cachedResponse) {
      // Return a copy so the cached object
      // is never modified.
      const response = structuredClone(cachedResponse);
      response.performance = {
        source: 'cache',
        executionTime: Number(
          (performance.now() - startTime).toFixed(2)
        )
      };
         return res.json(response);
    }

    const skip = page * pageSize;

    // Execute the count and data retrieval concurrently
    const [animals, total] = await Promise.all([
      Animal.find(query)
        .select('-__v')      // Exclude the internal Mongoose version field
        .skip(skip)          // Pagination offset
        .limit(pageSize)     // Number of records per page
        .lean(),             // Return plain JavaScript objects
      Animal.countDocuments(query)
    ]);

    // Calculate execution time for performance monitoring
    const executionTime = Number((performance.now() - startTime).toFixed(2));

    /**
    * Build the response object.
    * This response is stored in the cache so
    * repeated requests avoid unnecessary
    * database queries.
    */
    const response = {
      animals,
      total,
      page,
      pageSize,
      performance: {
        source: "database",
        executionTime
      }
    };

    // Save the response in the cache.
    animalCache.set(cacheKey, response);

    res.json(response);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/animals/breeds
// Returns breed distribution data for the dashboard pie chart
// Replaces the update_pie_chart() callback from the original Python dashboard
router.get('/breeds', async (req, res) => {
  try {
    const rescueType = req.query.rescueType || 'reset';
    const query = queries[rescueType] || {};

    /**
     * MongoDB aggregation pipeline:
     * 1. Apply rescue type filter.
     * 2. Group animals by breed.
     * 3. Count animals in each breed.
     * 4. Sort by descending count.
     * 5. Format the response for the frontend chart.
     */
    const breeds = await Animal.aggregate([
      { $match: query },
      { $group: { _id: '$breed', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { _id: 0, breed: '$_id', count: 1 } }
    ]);

    res.json(breeds);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/animals
// Creates a new animal record
router.post(
    '/',
    authenticateToken,
    requireRole('employee','admin'),

    async(req,res)=>{

  try {

    const animal = new Animal(req.body);

    await animal.save();

    // Clear cached query results because the underlying data changed
    animalCache.clear();

    console.log('JWT user:', req.user);

    // Create audit record
    try {

      await AuditLog.create({
        username: req.user.username,
        role: req.user.role,
        action: 'CREATE_ANIMAL',
        details: `Created animal ${animal.animal_id}`
      });
    }
    catch(err){
      console.error('Audit logging failed:', err);
    }

    res.status(201).json(
      animal.toObject({ versionKey: false })
    );

  } catch (err) {

    console.error(err);
    res.status(400).json({ error: err.message });

  }
});

// GET /api/animals/search
// Searches animals using optional fields
router.get('/search', async (req, res) => {

  try {
    const query = {};

    const textFields = [
      'animal_id',
      'name',
      'breed',
      'color',
      'sex_upon_outcome',
      'outcome_type',
      'outcome_subtype'
    ];

    // Partial text search
    textFields.forEach(field => {

      if (req.query[field]) {
        query[field] = {
          $regex: req.query[field],
          $options: 'i'
        };
      }
    });

    // Exact dropdown searches
    if (req.query.animal_type) {
      query.animal_type = req.query.animal_type;
    }

    const animals = await Animal.find(query)
      .select('-__v')
      .limit(100)
      .lean();

    res.json({
      animals,
      total: animals.length,
      page: 0,
      pageSize: animals.length
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({error: 'Server error'});
  }
});

// GET /api/animals/:id
// Returns a single animal by its MongoDB ObjectId
// Used when a row is selected to update the map
router.get('/:id', async (req, res) => {
  try {

    // Validate MongoDB ObjectId format before querying
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        error: 'Invalid animal ID'
      });
    }

    const animal = await Animal.findById(req.params.id).lean();

    if (!animal) {
      return res.status(404).json({
        error: 'Animal not found'
      });
    }

    res.json(animal);

  } catch (err) {

    console.error(err);
    res.status(500).json({
      error: 'Server error'
    });

  }
});

// PUT /api/animals/:id
// Updates an existing animal record
router.put(
    '/:id',
    authenticateToken,
    requireRole('employee','admin'),

    async(req,res)=>{

  try {

    // Validate MongoDB ObjectId format before querying
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        error: 'Invalid animal ID'
      });
    }

    const animal = await Animal.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        returnDocument: 'after',
        runValidators: true
      }
    );

    if (!animal) {
      return res.status(404).json({
        error: 'Animal not found'
      });
    }

    // Clear cached query results because an existing record was updated
    animalCache.clear();

    try {

      await AuditLog.create({
        username: req.user.username,
        role: req.user.role,
        action: 'UPDATE_ANIMAL',
        details: `Updated animal ${animal.animal_id}`
      });
    }
    catch(err){
      console.error('Audit logging failed:', err);
    }

    res.json(
      animal.toObject({ versionKey: false })
    );

  } catch (err) {

    console.error(err);
    res.status(400).json({
      error: err.message
    });

  }
});

// DELETE /api/animals/:id
// Deletes an animal record from the database
router.delete(
    '/:id',
    authenticateToken,
    requireRole('employee','admin'),

    async(req,res)=>{
        
    try {

    // Validate MongoDB ObjectId format before querying
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        error: 'Invalid animal ID'
      });
    }

    const animal = await Animal.findById(req.params.id);

    if (!animal) {
      return res.status(404).json({
        error: 'Animal not found'
      });
    }

    await animal.deleteOne();

    // Clear cached query results because the underlying data changed
    animalCache.clear();

    try {

      await AuditLog.create({
        username: req.user.username,
        role: req.user.role,
        action: 'DELETE_ANIMAL',
        details: `Deleted animal ${animal.animal_id}`
      });
    }
    catch(err){
      console.error('Audit logging failed:', err);
    }

    res.json({
      message: 'Animal deleted successfully'
    });

  } catch (err) {

    console.error(err);
    res.status(500).json({
      error: 'Server error'
    });

  }
});

module.exports = router;
module.exports.animalCache = animalCache;