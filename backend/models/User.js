// =============================================
// USER MODEL
// =============================================
// Stores all user profile data, stats, and progress

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  // ---- Basic Auth ----
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },

  // ---- Physical Profile ----
  profile: {
    name: { type: String, default: '' },
    age: { type: Number, default: 0 },
    gender: { type: String, enum: ['male', 'female', 'other'], default: 'male' },
    height: { type: Number, default: 170 },       // in cm
    weight: { type: Number, default: 70 },         // in kg
    activityLevel: {
      type: String,
      enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'],
      default: 'moderate'
    },
    goal: {
      type: String,
      enum: ['fat_loss', 'muscle_gain', 'maintenance'],
      default: 'muscle_gain'
    }
  },

  // ---- Calculated Nutrition Targets ----
  // These are recalculated whenever profile changes
  targets: {
    calories: { type: Number, default: 2000 },
    protein: { type: Number, default: 150 },   // grams
    carbs: { type: Number, default: 250 },     // grams
    fats: { type: Number, default: 65 }        // grams
  },

  // ---- Solo Leveling Style Stats ----
  // Each stat is 0-100 scale
  stats: {
    strength: { type: Number, default: 1 },
    endurance: { type: Number, default: 1 },
    discipline: { type: Number, default: 1 },
    consistency: { type: Number, default: 1 },
    nutrition: { type: Number, default: 1 }
  },

  // ---- XP and Leveling ----
  level: { type: Number, default: 1 },
  currentXP: { type: Number, default: 0 },
  totalXP: { type: Number, default: 0 },        // lifetime XP earned

  // ---- Streak Tracking ----
  streak: {
    current: { type: Number, default: 0 },
    longest: { type: Number, default: 0 },
    lastActiveDate: { type: Date, default: null }
  },

  // ---- System Rank (Solo Leveling style) ----
  rank: {
    type: String,
    enum: ['E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS'],
    default: 'E'
  },

  // ---- Timestamps ----
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// ---- PRE-SAVE HOOK: Hash password before saving ----
UserSchema.pre('save', async function(next) {
  // Only hash password if it was modified
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// ---- METHOD: Compare entered password with stored hash ----
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ---- METHOD: Calculate XP needed for next level ----
// XP formula: level * 100 + (level-1) * 50
UserSchema.methods.xpForNextLevel = function() {
  return this.level * 100 + (this.level - 1) * 50;
};

// ---- METHOD: Calculate rank based on level ----
UserSchema.methods.calculateRank = function() {
  if (this.level >= 50) return 'SSS';
  if (this.level >= 40) return 'SS';
  if (this.level >= 30) return 'S';
  if (this.level >= 20) return 'A';
  if (this.level >= 15) return 'B';
  if (this.level >= 10) return 'C';
  if (this.level >= 5) return 'D';
  return 'E';
};

module.exports = mongoose.model('User', UserSchema);
