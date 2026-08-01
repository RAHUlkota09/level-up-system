// =============================================
// AUTH CONTROLLER
// =============================================
// Handles user registration and login

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { calculateNutritionTargets } = require('../config/aiEngine');

// ---- REGISTER NEW USER ----
const register = async (req, res) => {
  try {
    const { username, email, password, profile } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        message: 'Username or email already registered' 
      });
    }

    // Calculate nutrition targets from profile
    let targets = {};
    if (profile && profile.age && profile.weight && profile.height) {
      targets = calculateNutritionTargets(profile);
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      profile: profile || {},
      targets: {
        calories: targets.calories || 2000,
        protein: targets.protein || 150,
        carbs: targets.carbs || 250,
        fats: targets.fats || 65
      }
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '30d' }
    );

    res.status(201).json({
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

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

// ---- LOGIN ----
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '30d' }
    );

    res.json({
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
