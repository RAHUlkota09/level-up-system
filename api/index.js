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
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 3000 });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.log('MongoDB Atlas connection not available, operating in resilient mode:', err.message);
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
const path = require('path');
const fs = require('fs');

let backendRoutesDir = path.join(__dirname, '../backend/routes');
if (!fs.existsSync(backendRoutesDir)) {
  backendRoutesDir = path.join(__dirname, '../frontend/backend/routes');
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
    dbStatus: mongoose.connection.readyState === 1 ? 'CONNECTED' : 'IN_MEMORY_MODE',
    timestamp: new Date().toISOString()
  });
});

module.exports = app;
