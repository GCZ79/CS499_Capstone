/**
 * app.js — Express entry point
 * Initializes middleware, security controls, and API routes.
 */

require('dotenv').config(); // load .env variables first, before anything else
const express           = require('express');
const cors              = require('cors');
const helmet            = require('helmet');
const rateLimit         = require('express-rate-limit');
const connectDB         = require('./config/db');
const authRoutes        = require('./routes/auth');
const adminRoutes       = require('./routes/admin');
const animalsRoute      = require('./routes/animals');
const trainingRoute     = require('./routes/training');
const { validateQuery } = require('./middleware/validate');
const app = express();

// Apply security middleware
app.use(helmet());
// Allow requests from Angular dev server
app.use(cors({ origin: 'http://localhost:4200' }));
// Parse incoming JSON request bodies
app.use(express.json());
// Perform authentication
app.use('/api/auth', authRoutes);
// Admin route
app.use('/api/admin', adminRoutes);
// Rate limit all /api routes
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                 // max 100 requests per window per IP
  message: { error: 'Too many requests, please slow down' }
}));
// Mount the animals router
// validateQuery runs first, then the route handler
app.use('/api/animals', validateQuery, animalsRoute);
// Mount the training router
app.use('/api/training', trainingRoute);
// Health check endpoint - useful to quickly verify the server is running
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});
const PORT = process.env.PORT || 3000;
//app.listen(PORT, () => {
// console.log(`Server running on http://localhost:${PORT}`);
//});
if (require.main === module) {
  // Connect to MongoDB - only when running as an actual server, not when
  // this module is required by tests.
  connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
module.exports = app;