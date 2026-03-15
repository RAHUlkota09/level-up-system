// =============================================
// NUTRITION CONTROLLER
// =============================================
// Handles food logging and nutrition tracking

const FoodLog = require('../models/FoodLog');
const User = require('../models/User');
const indianFoodDatabase = require('../config/foodDatabase');

// Helper: Get today's date (midnight)
const getToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

// ---- SEARCH FOOD DATABASE ----
const searchFoods = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      // Return all foods if no query
      return res.json({ foods: indianFoodDatabase });
    }

    // Case-insensitive search in food name
    const results = indianFoodDatabase.filter(food =>
      food.name.toLowerCase().includes(query.toLowerCase())
    );

    res.json({ foods: results });
  } catch (error) {
    res.status(500).json({ message: 'Error searching foods' });
  }
};

// ---- LOG A FOOD ITEM ----
const logFood = async (req, res) => {
  try {
    const { foodName, quantity, mealType, date } = req.body;

    // Find the food in our database to get nutritional values
    const foodItem = indianFoodDatabase.find(f => 
      f.name.toLowerCase() === foodName.toLowerCase()
    );

    let protein = req.body.protein || 0;
    let carbs = req.body.carbs || 0;
    let fats = req.body.fats || 0;
    let calories = req.body.calories || 0;

    // If food found in database, calculate nutrition based on quantity
    if (foodItem) {
      const ratio = quantity / 100; // database values are per 100g
      protein = Math.round(foodItem.per100g.protein * ratio * 10) / 10;
      carbs = Math.round(foodItem.per100g.carbs * ratio * 10) / 10;
      fats = Math.round(foodItem.per100g.fats * ratio * 10) / 10;
      calories = Math.round(foodItem.per100g.calories * ratio);
    }

    // Set date to today if not provided
    const logDate = date ? new Date(date) : getToday();
    logDate.setHours(0, 0, 0, 0);

    const foodLog = await FoodLog.create({
      userId: req.user._id,
      foodName,
      quantity,
      protein,
      carbs,
      fats,
      calories,
      mealType: mealType || 'lunch',
      date: logDate
    });

    res.status(201).json({ 
      message: 'Food logged successfully',
      foodLog 
    });
  } catch (error) {
    console.error('Log food error:', error);
    res.status(500).json({ message: 'Error logging food' });
  }
};

// ---- GET TODAY'S FOOD LOGS ----
const getTodaysLogs = async (req, res) => {
  try {
    const today = getToday();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const logs = await FoodLog.find({
      userId: req.user._id,
      date: { $gte: today, $lt: tomorrow }
    }).sort({ createdAt: -1 });

    // Calculate totals
    const totals = logs.reduce((acc, log) => ({
      protein: acc.protein + log.protein,
      carbs: acc.carbs + log.carbs,
      fats: acc.fats + log.fats,
      calories: acc.calories + log.calories
    }), { protein: 0, carbs: 0, fats: 0, calories: 0 });

    // Get user targets for comparison
    const user = await User.findById(req.user._id);
    const targets = user.targets;

    // Calculate percentages
    const percentages = {
      protein: Math.round((totals.protein / targets.protein) * 100),
      carbs: Math.round((totals.carbs / targets.carbs) * 100),
      fats: Math.round((totals.fats / targets.fats) * 100),
      calories: Math.round((totals.calories / targets.calories) * 100)
    };

    // Determine system warning
    let systemAlert = null;
    if (percentages.protein < 50) {
      systemAlert = {
        type: 'danger',
        title: '⚠ PROTEIN DEFICIT DETECTED',
        message: `You've only consumed ${Math.round(totals.protein)}g protein out of your ${targets.protein}g target. Eat: Paneer, Eggs, Soya Chunks, Chicken, or Dal.`
      };
    } else if (percentages.protein < 80) {
      systemAlert = {
        type: 'warning',
        title: 'NUTRITION WARNING',
        message: `Protein at ${percentages.protein}%. Need ${Math.round(targets.protein - totals.protein)}g more protein today.`
      };
    }

    res.json({ 
      logs,
      totals: {
        protein: Math.round(totals.protein * 10) / 10,
        carbs: Math.round(totals.carbs * 10) / 10,
        fats: Math.round(totals.fats * 10) / 10,
        calories: Math.round(totals.calories)
      },
      targets,
      percentages,
      systemAlert
    });
  } catch (error) {
    console.error('Get food logs error:', error);
    res.status(500).json({ message: 'Error fetching food logs' });
  }
};

// ---- DELETE A FOOD LOG ----
const deleteFoodLog = async (req, res) => {
  try {
    const { logId } = req.params;
    
    const log = await FoodLog.findOneAndDelete({ 
      _id: logId, 
      userId: req.user._id 
    });

    if (!log) {
      return res.status(404).json({ message: 'Food log not found' });
    }

    res.json({ message: 'Food log deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting food log' });
  }
};

// ---- GET NUTRITION HISTORY (last N days) ----
const getNutritionHistory = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    startDate.setHours(0, 0, 0, 0);

    const logs = await FoodLog.find({
      userId: req.user._id,
      date: { $gte: startDate }
    });

    // Group by date
    const dailyTotals = {};
    logs.forEach(log => {
      const dateKey = log.date.toISOString().split('T')[0];
      if (!dailyTotals[dateKey]) {
        dailyTotals[dateKey] = { protein: 0, carbs: 0, fats: 0, calories: 0 };
      }
      dailyTotals[dateKey].protein += log.protein;
      dailyTotals[dateKey].carbs += log.carbs;
      dailyTotals[dateKey].fats += log.fats;
      dailyTotals[dateKey].calories += log.calories;
    });

    res.json({ history: dailyTotals });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching nutrition history' });
  }
};

module.exports = { searchFoods, logFood, getTodaysLogs, deleteFoodLog, getNutritionHistory };
