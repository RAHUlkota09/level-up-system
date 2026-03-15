// =============================================
// STATS CONTROLLER
// =============================================
// Handles user stats, profile updates, and weight logging

const User = require('../models/User');
const WeightLog = require('../models/WeightLog');
const XPProgress = require('../models/XPProgress');
const { calculateNutritionTargets, calculateBMI, xpForLevel } = require('../config/aiEngine');

// ---- GET USER STATS ----
const getUserStats = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    const bmi = calculateBMI(user.profile.weight, user.profile.height);
    const xpNeeded = xpForLevel(user.level);
    const xpPercent = Math.round((user.currentXP / xpNeeded) * 100);

    res.json({
      level: user.level,
      rank: user.rank,
      currentXP: user.currentXP,
      xpNeeded,
      xpPercent,
      totalXP: user.totalXP,
      stats: user.stats,
      streak: user.streak,
      profile: user.profile,
      targets: user.targets,
      bmi
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats' });
  }
};

// ---- UPDATE USER PROFILE ----
const updateProfile = async (req, res) => {
  try {
    const { profile } = req.body;
    
    const user = await User.findById(req.user._id);
    
    // Update profile fields
    Object.assign(user.profile, profile);
    
    // Recalculate nutrition targets based on new profile
    if (profile.age || profile.weight || profile.height || profile.activityLevel || profile.goal) {
      const newTargets = calculateNutritionTargets(user.profile);
      user.targets = {
        calories: newTargets.calories,
        protein: newTargets.protein,
        carbs: newTargets.carbs,
        fats: newTargets.fats
      };
    }
    
    user.updatedAt = new Date();
    await user.save();

    res.json({ 
      message: 'Profile updated. Targets recalculated.',
      profile: user.profile,
      targets: user.targets
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile' });
  }
};

// ---- LOG BODY WEIGHT ----
const logWeight = async (req, res) => {
  try {
    const { weight, bodyFat, notes } = req.body;

    const weightLog = await WeightLog.create({
      userId: req.user._id,
      weight,
      bodyFat: bodyFat || null,
      notes: notes || ''
    });

    // Update user's current weight
    const user = await User.findById(req.user._id);
    user.profile.weight = weight;
    
    // Recalculate targets with new weight
    const newTargets = calculateNutritionTargets(user.profile);
    user.targets = newTargets;
    
    await user.save();

    res.status(201).json({ 
      message: 'Weight logged',
      weightLog,
      newTargets: user.targets
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging weight' });
  }
};

// ---- GET WEIGHT HISTORY ----
const getWeightHistory = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const logs = await WeightLog.find({
      userId: req.user._id,
      date: { $gte: startDate }
    }).sort({ date: 1 });

    res.json({ logs });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching weight history' });
  }
};

// ---- GET XP HISTORY ----
const getXPHistory = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const xpHistory = await XPProgress.find({
      userId: req.user._id,
      date: { $gte: startDate }
    }).sort({ date: -1 }).limit(20);

    res.json({ xpHistory });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching XP history' });
  }
};

module.exports = { getUserStats, updateProfile, logWeight, getWeightHistory, getXPHistory };
