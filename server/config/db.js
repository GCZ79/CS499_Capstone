/**
 * config/db.js — MongoDB connection
 * Called once at startup. Exits the process if the connection fails
 * to prevent the server from running without a database.
 */

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1); // no point running without a database
  }
};

module.exports = connectDB;