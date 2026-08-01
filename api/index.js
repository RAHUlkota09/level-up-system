// =============================================
// VERCEL SERVERLESS ENTRY POINT
// =============================================
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// ---- CORS CONFIGURATION ----
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://level-up-system9.vercel.app'
];

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

app.use(express.json());

// ---- DATABASE CONNECTION ----
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/levelupsystem';

async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  try {
    await mongoose.connect(MONGODB_URI);
  } catch (err) {
    console.error('MongoDB Atlas connection error:', err.message);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const memUri = mongod.getUri();
      await mongoose.connect(memUri);
    } catch (memErr) {
      console.error('Failed to start in-memory MongoDB fallback:', memErr.message);
    }
  }
}

// Ensure DB connection on each request
app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('DB middleware error:', err);
  }
  next();
});

// ---- ROUTES ----
app.use('/api/auth', require('../backend/routes/auth'));
app.use('/api/user', require('../backend/routes/user'));
app.use('/api/missions', require('../backend/routes/missions'));
app.use('/api/nutrition', require('../backend/routes/nutrition'));
app.use('/api/stats', require('../backend/routes/stats'));
app.use('/api/xp', require('../backend/routes/xp'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'SYSTEM ONLINE',
    message: 'Level Up System Backend Active',
    dbStatus: mongoose.connection.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED',
    timestamp: new Date().toISOString()
  });
});

module.exports = app;
