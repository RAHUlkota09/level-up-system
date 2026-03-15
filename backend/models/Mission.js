// =============================================
// MISSION MODEL
// =============================================
// Stores daily missions assigned to users

const mongoose = require('mongoose');

const MissionSchema = new mongoose.Schema({
  // Which user this mission belongs to
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Mission details
  title: { type: String, required: true },
  description: { type: String, default: '' },
  
  // Mission category
  type: {
    type: String,
    enum: ['workout', 'nutrition', 'hydration', 'sleep', 'cardio', 'discipline'],
    required: true
  },

  // Difficulty affects XP reward
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'extreme'],
    default: 'medium'
  },

  // XP rewarded on completion
  xpReward: { type: Number, default: 50 },

  // Mission status
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'skipped'],
    default: 'pending'
  },

  // Target value (e.g., 3 for "drink 3L water", 8000 for "walk 8000 steps")
  target: { type: Number, default: 1 },
  unit: { type: String, default: '' },
  
  // Current progress toward target
  progress: { type: Number, default: 0 },

  // Is this a penalty mission (from failing other missions)?
  isPenalty: { type: Boolean, default: false },

  // The date this mission is for
  date: { type: Date, required: true },

  // When mission was completed
  completedAt: { type: Date, default: null },

  createdAt: { type: Date, default: Date.now }
});

// Index for fast querying by user + date
MissionSchema.index({ userId: 1, date: 1 });

module.exports = mongoose.model('Mission', MissionSchema);
