// =============================================
// WEIGHT LOG MODEL
// =============================================
// Tracks body weight over time for progress charts

const mongoose = require('mongoose');

const WeightLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  weight: { type: Number, required: true },   // in kg
  bodyFat: { type: Number, default: null },   // optional % body fat
  notes: { type: String, default: '' },

  date: { type: Date, default: Date.now }
});

WeightLogSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('WeightLog', WeightLogSchema);
