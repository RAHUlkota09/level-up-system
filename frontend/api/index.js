// =============================================
// VERCEL SERVERLESS FUNCTION HANDLER
// =============================================
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// ---- CORS ----
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

// ---- DATABASE CONNECTION ----
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/levelupsystem';

async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB Atlas connection error:', err.message);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const memUri = mongod.getUri();
      await mongoose.connect(memUri);
      console.log('In-memory MongoDB started on serverless fallback');
    } catch (memErr) {
      console.error('In-memory MongoDB fallback failed:', memErr.message);
    }
  }
}

// DB Middleware
app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('DB middleware connection error:', err);
  }
  next();
});

// Import backend routes
const path = require('path');
const fs = require('fs');

let backendRoutesDir = path.join(__dirname, '../backend/routes');
if (!fs.existsSync(backendRoutesDir)) {
  backendRoutesDir = path.join(__dirname, '../../backend/routes');
}

app.use('/api/auth', require(path.join(backendRoutesDir, 'auth')));
app.use('/api/user', require(path.join(backendRoutesDir, 'user')));
app.use('/api/missions', require(path.join(backendRoutesDir, 'missions')));
app.use('/api/nutrition', require(path.join(backendRoutesDir, 'nutrition')));
app.use('/api/stats', require(path.join(backendRoutesDir, 'stats')));
app.use('/api/xp', require(path.join(backendRoutesDir, 'xp')));

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
