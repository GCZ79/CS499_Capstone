const express = require('express');
const router  = express.Router();
const Animal  = require('../models/Animal');
const queries = require('../config/rescueQueries');

// GET /api/animals
// Returns a paginated list of animals, optionally filtered by rescue type
// This replaces the filter_data() callback from the Python dashboard
router.get('/', async (req, res) => {
  try {
    const rescueType = req.query.rescueType || 'reset';
    const page       = parseInt(req.query.page)     || 0;
    const pageSize   = parseInt(req.query.pageSize) || 10;

    const query = queries[rescueType] || {};
    const skip  = page * pageSize;

    // Run the count and the data fetch at the same time
    // Promise.all() is like running two tasks in parallel
    const [animals, total] = await Promise.all([
      Animal.find(query)
            .select('-__v')    // exclude the Mongoose internal version field
            .skip(skip)
            .limit(pageSize)
            .lean(),           // return plain objects instead of Mongoose documents
      Animal.countDocuments(query)
    ]);

    res.json({ animals, total, page, pageSize });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/animals/breeds
// Returns breed distribution for pie chart
// This replaces the update_pie_chart() callback from the Python dashboard
router.get('/breeds', async (req, res) => {
  try {
    const rescueType = req.query.rescueType || 'reset';
    const query      = queries[rescueType]  || {};

    const breeds = await Animal.aggregate([
      { $match:   query },
      { $group:   { _id: '$breed', count: { $sum: 1 } } },
      { $sort:    { count: -1 } },
      { $project: { _id: 0, breed: '$_id', count: 1 } }
    ]);

    res.json(breeds);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/animals/:id
// Returns a single animal - used when a row is selected on the map
router.get('/:id', async (req, res) => {
  try {
    const animal = await Animal.findById(req.params.id).lean();
    if (!animal) return res.status(404).json({ error: 'Not found' });
    res.json(animal);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;