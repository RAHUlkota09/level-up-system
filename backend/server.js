// =============================================
// LEVEL UP SYSTEM - Main Server Entry Point
// =============================================
// This file starts the Express server and connects to MongoDB

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const app = express();

// ---- MIDDLEWARE ----
// Allow requests from our React frontend (running on port 3000)
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Parse incoming JSON request bodies
app.use(express.json());

// ---- ROUTES ----
// Each route file handles a specific feature area
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/missions', require('./routes/missions'));
app.use('/api/nutrition', require('./routes/nutrition'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/xp', require('./routes/xp'));

// Health check endpoint - visit http://localhost:5000/api/health to verify server is running
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'SYSTEM ONLINE', 
    message: 'Level Up System Backend Active',
    timestamp: new Date().toISOString()
  });
});

// ---- DATABASE CONNECTION ----
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/levelupsystem';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('');
    console.log('╔══════════════════════════════════════╗');
    console.log('║      LEVEL UP SYSTEM - BACKEND       ║');
    console.log('╠══════════════════════════════════════╣');
    console.log('║  ✓ MongoDB Connected Successfully    ║');
    console.log(`║  ✓ Server running on port ${process.env.PORT || 5000}       ║`);
    console.log('║  ✓ System Status: ONLINE             ║');
    console.log('╚══════════════════════════════════════╝');
    console.log('');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    console.error('Make sure MongoDB is running! Run: mongod');
    process.exit(1);
  });

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

module.exports = app;
