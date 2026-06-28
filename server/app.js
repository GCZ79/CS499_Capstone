/**
 * app.js — Express entry point
 * Initializes middleware, security controls, and API routes.
 */

require('dotenv').config();   // load .env variables first, before anything else

const express           = require('express');
const cors              = require('cors');
const helmet            = require('helmet');
const rateLimit         = require('express-rate-limit');
const connectDB         = require('./config/db');
const animalsRoute      = require('./routes/animals');
const { validateQuery } = require('./middleware/validate');

const app = express();

// Connect to MongoDB
connectDB();

// Apply security middleware
app.use(helmet());

// Allow requests from Angular dev server
app.use(cors({ origin: 'http://localhost:4200' }));

// Parse incoming JSON request bodies
app.use(express.json());

// Rate limit all /api routes
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                 // max 100 requests per window per IP
  message: { error: 'Too many requests, please slow down' }
}));

// Mount the animals router
// validateQuery runs first, then the route handler
app.use('/api/animals', validateQuery, animalsRoute);

// Health check endpoint - useful to quickly verify the server is running
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});