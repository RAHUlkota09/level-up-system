// =============================================
// MISSION CONTROLLER
// =============================================
// Handles daily mission generation, completion, and penalties

const Mission = require('../models/Mission');
const User = require('../models/User');
const XPProgress = require('../models/XPProgress');
const { generateDailyMissions, analyzeUserPerformance, xpForLevel } = require('../config/aiEngine');

// Helper: Get start of today (midnight)
const getToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

// ---- GET TODAY'S MISSIONS ----
const getTodaysMissions = async (req, res) => {
  try {
    const today = getToday();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find missions for today
    let missions = await Mission.find({
      userId: req.user._id,
      date: { $gte: today, $lt: tomorrow }
    });

    // If no missions exist for today, generate them
    if (missions.length === 0) {
      const user = await User.findById(req.user._id);
      const missionTemplates = generateDailyMissions(user);
      
      // Create mission documents
      const missionDocs = missionTemplates.map(template => ({
        userId: req.user._id,
        ...template,
        date: today,
        status: 'pending'
      }));

      missions = await Mission.insertMany(missionDocs);
    }

    res.json({ missions });
  } catch (error) {
    console.error('Get missions error:', error);
    res.status(500).json({ message: 'Error fetching missions' });
  }
};

// ---- COMPLETE A MISSION ----
const completeMission = async (req, res) => {
  try {
    const { missionId } = req.params;
    
    const mission = await Mission.findOne({ 
      _id: missionId, 
      userId: req.user._id 
    });

    if (!mission) {
      return res.status(404).json({ message: 'Mission not found' });
    }

    if (mission.status === 'completed') {
      return res.status(400).json({ message: 'Mission already completed' });
    }

    // Mark mission as completed
    mission.status = 'completed';
    mission.progress = mission.target;
    mission.completedAt = new Date();
    await mission.save();

    // Award XP to user
    const user = await User.findById(req.user._id);
    const xpNeeded = xpForLevel(user.level);
    
    user.currentXP += mission.xpReward;
    user.totalXP += mission.xpReward;

    // Check for level up
    let leveledUp = false;
    let newLevel = user.level;
    
    while (user.currentXP >= xpForLevel(user.level)) {
      user.currentXP -= xpForLevel(user.level);
      user.level += 1;
      user.rank = user.calculateRank();
      leveledUp = true;
      newLevel = user.level;
    }

    // Update streak
    const today = getToday();
    const lastActive = user.streak.lastActiveDate;
    
    if (!lastActive) {
      user.streak.current = 1;
    } else {
      const daysSinceLastActive = Math.floor(
        (today - lastActive) / (1000 * 60 * 60 * 24)
      );
      
      if (daysSinceLastActive === 1) {
        // Consecutive day - extend streak
        user.streak.current += 1;
      } else if (daysSinceLastActive > 1) {
        // Streak broken
        user.streak.current = 1;
      }
      // Same day - don't change streak
    }
    
    user.streak.lastActiveDate = today;
    user.streak.longest = Math.max(user.streak.longest, user.streak.current);

    await user.save();

    // Save XP history record
    await XPProgress.create({
      userId: user._id,
      xpEarned: mission.xpReward,
      source: 'mission_complete',
      description: `Completed: ${mission.title}`,
      levelAtTime: user.level,
      causedLevelUp: leveledUp
    });

    res.json({
      message: leveledUp ? `LEVEL UP! You are now Level ${newLevel}!` : 'QUEST COMPLETE!',
      mission,
      xpEarned: mission.xpReward,
      leveledUp,
      newLevel: user.level,
      currentXP: user.currentXP,
      xpNeeded: xpForLevel(user.level)
    });

  } catch (error) {
    console.error('Complete mission error:', error);
    res.status(500).json({ message: 'Error completing mission' });
  }
};

// ---- UPDATE MISSION PROGRESS ----
const updateProgress = async (req, res) => {
  try {
    const { missionId } = req.params;
    const { progress } = req.body;

    const mission = await Mission.findOne({
      _id: missionId,
      userId: req.user._id
    });

    if (!mission) {
      return res.status(404).json({ message: 'Mission not found' });
    }

    mission.progress = Math.min(progress, mission.target);
    
    // Auto-complete if target reached
    if (mission.progress >= mission.target && mission.status === 'pending') {
      mission.status = 'completed';
      mission.completedAt = new Date();
    }

    await mission.save();
    res.json({ mission });
  } catch (error) {
    res.status(500).json({ message: 'Error updating progress' });
  }
};

// ---- GET MISSION HISTORY ----
const getMissionHistory = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    startDate.setHours(0, 0, 0, 0);

    const missions = await Mission.find({
      userId: req.user._id,
      date: { $gte: startDate }
    }).sort({ date: -1 });

    // Group by date and calculate completion rate
    const grouped = {};
    missions.forEach(m => {
      const dateKey = m.date.toISOString().split('T')[0];
      if (!grouped[dateKey]) {
        grouped[dateKey] = { total: 0, completed: 0, missions: [] };
      }
      grouped[dateKey].total++;
      if (m.status === 'completed') grouped[dateKey].completed++;
      grouped[dateKey].missions.push(m);
    });

    res.json({ history: grouped });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching mission history' });
  }
};

// ---- ANALYZE YESTERDAY AND GENERATE PENALTIES ----
const runDailyAnalysis = async (req, res) => {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const endOfYesterday = new Date(yesterday);
    endOfYesterday.setHours(23, 59, 59, 999);

    const yesterdayMissions = await Mission.find({
      userId: req.user._id,
      date: { $gte: yesterday, $lte: endOfYesterday }
    });

    if (yesterdayMissions.length === 0) {
      return res.json({ message: 'No missions found for yesterday' });
    }

    const completedCount = yesterdayMissions.filter(m => m.status === 'completed').length;
    const completionRate = completedCount / yesterdayMissions.length;

    const user = await User.findById(req.user._id);
    
    // Run AI analysis
    const analysis = analyzeUserPerformance({
      missionCompletionRate: completionRate,
      proteinPercent: 80, // Would get from food logs in full implementation
      streakDays: user.streak.current,
      level: user.level,
      stats: user.stats
    });

    // Apply stat changes from analysis
    if (analysis.statChanges) {
      Object.entries(analysis.statChanges).forEach(([stat, change]) => {
        if (user.stats[stat] !== undefined) {
          user.stats[stat] = Math.max(1, Math.min(100, user.stats[stat] + change));
        }
      });
      await user.save();
    }

    // Create penalty missions if any
    const today = getToday();
    if (analysis.penalties.length > 0) {
      const penaltyDocs = analysis.penalties.map(p => ({
        userId: req.user._id,
        ...p,
        date: today,
        isPenalty: true,
        status: 'pending'
      }));
      await Mission.insertMany(penaltyDocs);
    }

    res.json({
      analysis,
      completionRate,
      penaltiesAdded: analysis.penalties.length
    });

  } catch (error) {
    console.error('Daily analysis error:', error);
    res.status(500).json({ message: 'Error running daily analysis' });
  }
};

module.exports = {
  getTodaysMissions,
  completeMission,
  updateProgress,
  getMissionHistory,
  runDailyAnalysis
};
