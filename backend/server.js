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

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://level-up-system9.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

// Allow requests from our React frontend
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
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

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 3000 });
    console.log('');
    console.log('╔══════════════════════════════════════╗');
    console.log('║      LEVEL UP SYSTEM - BACKEND       ║');
    console.log('╠══════════════════════════════════════╣');
    console.log('║  ✓ MongoDB Connected Successfully    ║');
    console.log(`║  ✓ Server running on port ${process.env.PORT || 5000}       ║`);
    console.log('║  ✓ System Status: ONLINE             ║');
    console.log('╚══════════════════════════════════════╝');
    console.log('');
  } catch (err) {
    console.log('Local/Atlas MongoDB not available, starting in-memory MongoDB...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    const memUri = mongod.getUri();
    await mongoose.connect(memUri);
    console.log('');
    console.log('╔══════════════════════════════════════╗');
    console.log('║      LEVEL UP SYSTEM - BACKEND       ║');
    console.log('╠══════════════════════════════════════╣');
    console.log('║  ✓ In-Memory MongoDB Started         ║');
    console.log(`║  ✓ Server running on port ${process.env.PORT || 5000}       ║`);
    console.log('║  ⚠ Data will reset on restart        ║');
    console.log('║  ✓ System Status: ONLINE             ║');
    console.log('╚══════════════════════════════════════╝');
    console.log('');
  }
}

connectDB();

// Start the server if not running in serverless environment
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

module.exports = app;
