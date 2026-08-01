// =============================================
// AUTH CONTROLLER
// =============================================
// Handles user registration and login with DB & in-memory fallback

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');
const { calculateNutritionTargets } = require('../config/aiEngine');

// In-memory fallback storage when DB is offline/unconfigured
const memUsers = new Map();

// Helper to check if DB is connected
const isDBConnected = () => mongoose.connection.readyState === 1;

// ---- REGISTER NEW USER ----
const register = async (req, res) => {
  try {
    const { username, email, password, profile } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required' });
    }

    let targets = {};
    if (profile && profile.age && profile.weight && profile.height) {
      targets = calculateNutritionTargets(profile);
    }

    const defaultTargets = {
      calories: targets.calories || 2000,
      protein: targets.protein || 150,
      carbs: targets.carbs || 250,
      fats: targets.fats || 65
    };

    const defaultStats = {
      strength: 1,
      endurance: 1,
      discipline: 1,
      consistency: 1,
      nutrition: 1
    };

    if (isDBConnected()) {
      const existingUser = await User.findOne({
        $or: [{ email: email.toLowerCase() }, { username }]
      });

      if (existingUser) {
        return res.status(400).json({
          message: 'Username or email already registered'
        });
      }

      const user = new User({
        username,
        email: email.toLowerCase(),
        password,
        profile: profile || {},
        targets: defaultTargets
      });

      await user.save();

      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '30d' }
      );

      return res.status(201).json({
        message: 'HUNTER REGISTERED. WELCOME TO THE SYSTEM.',
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          level: user.level,
          currentXP: user.currentXP,
          rank: user.rank,
          profile: user.profile,
          targets: user.targets,
          stats: user.stats
        }
      });
    } else {
      // In-Memory Fallback
      const normalizedEmail = email.toLowerCase();
      if (memUsers.has(normalizedEmail)) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const userId = 'mem_' + Date.now();

      const newUser = {
        id: userId,
        username,
        email: normalizedEmail,
        password: hashedPassword,
        level: 1,
        currentXP: 0,
        rank: 'E',
        profile: profile || { height: 170, weight: 70, age: 25, goal: 'muscle_gain' },
        targets: defaultTargets,
        stats: defaultStats,
        streak: { current: 1, longest: 1 }
      };

      memUsers.set(normalizedEmail, newUser);

      const token = jwt.sign(
        { userId },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '30d' }
      );

      return res.status(201).json({
        message: 'HUNTER REGISTERED. WELCOME TO THE SYSTEM.',
        token,
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          level: newUser.level,
          currentXP: newUser.currentXP,
          rank: newUser.rank,
          profile: newUser.profile,
          targets: newUser.targets,
          stats: newUser.stats
        }
      });
    }

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

// ---- LOGIN ----
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const normalizedEmail = email.toLowerCase();

    if (isDBConnected()) {
      const user = await User.findOne({ email: normalizedEmail });
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '30d' }
      );

      return res.json({
        message: 'SYSTEM ACCESS GRANTED. WELCOME BACK, HUNTER.',
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          level: user.level,
          currentXP: user.currentXP,
          rank: user.rank,
          profile: user.profile,
          targets: user.targets,
          stats: user.stats,
          streak: user.streak
        }
      });
    } else {
      // In-Memory Fallback
      const memUser = memUsers.get(normalizedEmail);
      if (memUser) {
        const isMatch = await bcrypt.compare(password, memUser.password);
        if (!isMatch) {
          return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign(
          { userId: memUser.id },
          process.env.JWT_SECRET || 'fallback_secret',
          { expiresIn: '30d' }
        );

        return res.json({
          message: 'SYSTEM ACCESS GRANTED. WELCOME BACK, HUNTER.',
          token,
          user: {
            id: memUser.id,
            username: memUser.username,
            email: memUser.email,
            level: memUser.level,
            currentXP: memUser.currentXP,
            rank: memUser.rank,
            profile: memUser.profile,
            targets: memUser.targets,
            stats: memUser.stats,
            streak: memUser.streak
          }
        });
      } else {
        // Auto-create demo user for login testing if memory store empty
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const userId = 'mem_' + Date.now();
        const username = normalizedEmail.split('@')[0] || 'Hunter';

        const demoUser = {
          id: userId,
          username,
          email: normalizedEmail,
          password: hashedPassword,
          level: 1,
          currentXP: 0,
          rank: 'E',
          profile: { height: 170, weight: 70, age: 25, goal: 'muscle_gain' },
          targets: { calories: 2000, protein: 150, carbs: 250, fats: 65 },
          stats: { strength: 1, endurance: 1, discipline: 1, consistency: 1, nutrition: 1 },
          streak: { current: 1, longest: 1 }
        };

        memUsers.set(normalizedEmail, demoUser);

        const token = jwt.sign(
          { userId },
          process.env.JWT_SECRET || 'fallback_secret',
          { expiresIn: '30d' }
        );

        return res.json({
          message: 'SYSTEM ACCESS GRANTED. WELCOME BACK, HUNTER.',
          token,
          user: {
            id: demoUser.id,
            username: demoUser.username,
            email: demoUser.email,
            level: demoUser.level,
            currentXP: demoUser.currentXP,
            rank: demoUser.rank,
            profile: demoUser.profile,
            targets: demoUser.targets,
            stats: demoUser.stats,
            streak: demoUser.streak
          }
        });
      }
    }

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

// ---- GET CURRENT USER ----
const getMe = async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user data' });
  }
};

module.exports = { register, login, getMe };
