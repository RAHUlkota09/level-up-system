// =============================================
// FOOD LOG MODEL
// =============================================
// Stores daily food intake entries for nutrition tracking

const mongoose = require('mongoose');

const FoodLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Food item details
  foodName: { type: String, required: true },
  quantity: { type: Number, required: true },    // in grams
  
  // Macronutrients (per logged quantity)
  protein: { type: Number, default: 0 },         // grams
  carbs: { type: Number, default: 0 },           // grams
  fats: { type: Number, default: 0 },            // grams
  calories: { type: Number, default: 0 },

  // Meal type
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack', 'pre_workout', 'post_workout'],
    default: 'lunch'
  },

  // Date of consumption (stored as date only, no time for daily grouping)
  date: { type: Date, required: true },

  createdAt: { type: Date, default: Date.now }
});

// Index for fast daily lookup
FoodLogSchema.index({ userId: 1, date: 1 });

module.exports = mongoose.model('FoodLog', FoodLogSchema);
