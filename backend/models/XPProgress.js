// =============================================
// XP PROGRESS MODEL
// =============================================
// Tracks XP history and level up events

const mongoose = require('mongoose');

const XPProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // XP earned in this event
  xpEarned: { type: Number, required: true },

  // What caused this XP gain/loss
  source: {
    type: String,
    enum: ['mission_complete', 'streak_bonus', 'level_up_bonus', 'nutrition_goal', 'penalty'],
    required: true
  },

  // Human readable description
  description: { type: String, default: '' },

  // Level at time of this event
  levelAtTime: { type: Number, default: 1 },

  // Did this cause a level up?
  causedLevelUp: { type: Boolean, default: false },

  date: { type: Date, default: Date.now }
});

XPProgressSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('XPProgress', XPProgressSchema);
