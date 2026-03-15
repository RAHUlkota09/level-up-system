// =============================================
// AI DECISION ENGINE
// =============================================
// Rule-based AI that evaluates user performance
// and generates missions, penalties, and rewards
// Inspired by the Solo Leveling System AI

// ---- MISSION TEMPLATES ----
// Pool of possible daily missions by category

const missionTemplates = {
  workout: [
    { title: 'Complete Upper Body Workout', description: 'Chest, shoulders, triceps, biceps', difficulty: 'medium', xpReward: 100, target: 1, unit: 'session' },
    { title: 'Complete Lower Body Workout', description: 'Squats, lunges, deadlifts', difficulty: 'medium', xpReward: 100, target: 1, unit: 'session' },
    { title: 'Full Body Workout', description: 'Compound movements, 45+ minutes', difficulty: 'hard', xpReward: 150, target: 45, unit: 'minutes' },
    { title: 'Do 100 Push-ups', description: 'Can be split into sets throughout the day', difficulty: 'medium', xpReward: 80, target: 100, unit: 'reps' },
    { title: 'Do 50 Squats', description: 'Bodyweight or weighted', difficulty: 'easy', xpReward: 60, target: 50, unit: 'reps' },
  ],
  nutrition: [
    { title: 'Hit Protein Target', description: 'Consume your daily protein goal', difficulty: 'medium', xpReward: 100, target: 100, unit: '%' },
    { title: 'No Junk Food Today', description: 'Avoid chips, sugary drinks, fast food', difficulty: 'medium', xpReward: 80, target: 1, unit: 'day' },
    { title: 'Eat 3 Proper Meals', description: 'Breakfast, lunch, and dinner with protein', difficulty: 'easy', xpReward: 60, target: 3, unit: 'meals' },
    { title: 'Log All Meals', description: 'Track everything you eat today', difficulty: 'easy', xpReward: 50, target: 3, unit: 'entries' },
  ],
  hydration: [
    { title: 'Drink 3L of Water', description: 'Stay hydrated throughout the day', difficulty: 'easy', xpReward: 50, target: 3, unit: 'litres' },
    { title: 'Drink 4L of Water', description: 'Maximum hydration protocol', difficulty: 'medium', xpReward: 70, target: 4, unit: 'litres' },
  ],
  cardio: [
    { title: 'Walk 8,000 Steps', description: 'Track with your phone or watch', difficulty: 'easy', xpReward: 60, target: 8000, unit: 'steps' },
    { title: 'Walk 10,000 Steps', description: 'Advanced step target', difficulty: 'medium', xpReward: 80, target: 10000, unit: 'steps' },
    { title: '20 Minute Morning Jog', description: 'Fasted cardio for fat burning', difficulty: 'medium', xpReward: 90, target: 20, unit: 'minutes' },
    { title: '30 Minute HIIT Cardio', description: 'High intensity interval training', difficulty: 'hard', xpReward: 120, target: 30, unit: 'minutes' },
  ],
  sleep: [
    { title: 'Sleep Before 11 PM', description: 'Discipline your sleep schedule', difficulty: 'medium', xpReward: 70, target: 23, unit: 'hour' },
    { title: 'Get 8 Hours of Sleep', description: 'Recovery is part of training', difficulty: 'medium', xpReward: 80, target: 8, unit: 'hours' },
    { title: 'Wake Up Before 6 AM', description: 'Early riser protocol', difficulty: 'hard', xpReward: 100, target: 6, unit: 'hour' },
  ],
  discipline: [
    { title: 'No Phone for 2 Hours', description: 'Digital detox - improve focus', difficulty: 'medium', xpReward: 70, target: 2, unit: 'hours' },
    { title: 'Meditate for 10 Minutes', description: 'Mental clarity and discipline', difficulty: 'easy', xpReward: 50, target: 10, unit: 'minutes' },
    { title: 'Read for 30 Minutes', description: 'Feed your mind, not just your body', difficulty: 'easy', xpReward: 50, target: 30, unit: 'minutes' },
    { title: 'Cold Shower', description: 'Mental toughness training', difficulty: 'hard', xpReward: 90, target: 1, unit: 'shower' },
  ]
};

// ---- PENALTY MISSIONS ----
// These are assigned when the user fails regular missions
const penaltyMissions = [
  { title: 'PENALTY: 50 Push-ups', description: 'System penalty for mission failure', difficulty: 'hard', xpReward: 30, target: 50, unit: 'reps', type: 'workout' },
  { title: 'PENALTY: 100 Squats', description: 'System penalty for skipping workout', difficulty: 'hard', xpReward: 30, target: 100, unit: 'reps', type: 'workout' },
  { title: 'PENALTY: 30 Min Plank Challenge', description: 'Cumulative plank time - can split', difficulty: 'extreme', xpReward: 40, target: 30, unit: 'minutes', type: 'workout' },
  { title: 'PENALTY: Extra 5,000 Steps', description: 'Make up for lack of movement', difficulty: 'medium', xpReward: 20, target: 5000, unit: 'steps', type: 'cardio' },
  { title: 'PENALTY: 200 Jumping Jacks', description: 'System disciplinary measure', difficulty: 'hard', xpReward: 25, target: 200, unit: 'reps', type: 'workout' },
];

// ====================================================
// MAIN AI DECISION ENGINE FUNCTION
// ====================================================
// Analyzes user performance data and returns decisions

const analyzeUserPerformance = (data) => {
  const {
    missionCompletionRate,    // 0-1 (e.g., 0.7 = 70% missions completed)
    proteinPercent,           // 0-100 (% of protein target hit)
    streakDays,               // number of consecutive days active
    level,                    // current user level
    stats                     // user's current stats object
  } = data;

  const decisions = {
    messages: [],             // System messages to show user
    penalties: [],            // Penalty missions to assign
    rewards: [],              // XP bonuses or rewards
    missionDifficulty: 'medium',  // What difficulty to use for tomorrow's missions
    statChanges: {},          // How stats should change
    warningLevel: 'none'      // 'none', 'warning', 'critical'
  };

  // ---- ANALYZE MISSION COMPLETION ----
  if (missionCompletionRate >= 1.0) {
    // Perfect day!
    decisions.messages.push({
      type: 'success',
      title: 'SYSTEM MESSAGE',
      body: 'ALL MISSIONS COMPLETED. HUNTER PERFORMANCE: EXCEPTIONAL. +50 BONUS XP AWARDED.'
    });
    decisions.rewards.push({ xp: 50, reason: 'Perfect mission completion bonus' });
    decisions.statChanges.discipline = 2;
    decisions.statChanges.consistency = 1;
    
  } else if (missionCompletionRate >= 0.7) {
    // Good performance
    decisions.messages.push({
      type: 'info',
      title: 'SYSTEM MESSAGE',
      body: `MISSION COMPLETION RATE: ${Math.round(missionCompletionRate * 100)}%. ACCEPTABLE PERFORMANCE. CONTINUE IMPROVING.`
    });
    decisions.statChanges.discipline = 1;
    
  } else if (missionCompletionRate >= 0.5) {
    // Below average - warning
    decisions.warningLevel = 'warning';
    decisions.messages.push({
      type: 'warning',
      title: '⚠ SYSTEM WARNING',
      body: `MISSION FAILURE RATE EXCEEDS ACCEPTABLE THRESHOLD. COMPLETION: ${Math.round(missionCompletionRate * 100)}%. DISCIPLINE PENALTY INCOMING.`
    });
    // Add one penalty mission
    const randomPenalty = penaltyMissions[Math.floor(Math.random() * penaltyMissions.length)];
    decisions.penalties.push(randomPenalty);
    decisions.statChanges.discipline = -1;
    
  } else {
    // Critical failure
    decisions.warningLevel = 'critical';
    decisions.messages.push({
      type: 'danger',
      title: '🚨 CRITICAL SYSTEM ALERT',
      body: `HUNTER, YOU HAVE FAILED. MISSION COMPLETION: ${Math.round(missionCompletionRate * 100)}%. THE SYSTEM WILL NOT TOLERATE WEAKNESS. DUAL PENALTY ACTIVATED.`
    });
    // Add two penalty missions
    const shuffled = [...penaltyMissions].sort(() => Math.random() - 0.5);
    decisions.penalties.push(shuffled[0], shuffled[1]);
    decisions.statChanges.discipline = -2;
    decisions.statChanges.consistency = -1;
  }

  // ---- ANALYZE PROTEIN INTAKE ----
  if (proteinPercent < 50) {
    decisions.warningLevel = decisions.warningLevel === 'none' ? 'warning' : decisions.warningLevel;
    decisions.messages.push({
      type: 'danger',
      title: '⚠ PROTEIN DEFICIT DETECTED',
      body: `CRITICAL: You consumed only ${Math.round(proteinPercent)}% of your protein target. Muscle recovery is COMPROMISED. Recommended foods: Paneer, Eggs, Chicken, Soya Chunks, Dal.`
    });
    decisions.statChanges.nutrition = -2;
    
  } else if (proteinPercent < 80) {
    decisions.messages.push({
      type: 'warning',
      title: 'NUTRITION WARNING',
      body: `Protein intake at ${Math.round(proteinPercent)}% of daily target. Increase intake with: Curd, Eggs, Paneer, or Soya.`
    });
    decisions.statChanges.nutrition = -1;
    
  } else if (proteinPercent >= 100) {
    decisions.messages.push({
      type: 'success',
      title: 'NUTRITION GOAL ACHIEVED',
      body: `Protein target exceeded: ${Math.round(proteinPercent)}%. Muscle synthesis optimized. +25 XP.`
    });
    decisions.rewards.push({ xp: 25, reason: 'Protein target achieved' });
    decisions.statChanges.nutrition = 2;
  }

  // ---- ANALYZE STREAK ----
  if (streakDays >= 30) {
    decisions.messages.push({
      type: 'legendary',
      title: '🔥 LEGENDARY STREAK',
      body: `${streakDays} DAY STREAK ACHIEVED. HUNTER STATUS: LEGENDARY. THE SYSTEM RECOGNIZES YOUR DEDICATION. +200 XP BONUS.`
    });
    decisions.rewards.push({ xp: 200, reason: `${streakDays} day legendary streak` });
  } else if (streakDays >= 7) {
    decisions.messages.push({
      type: 'success',
      title: '🔥 STREAK BONUS',
      body: `${streakDays} DAY STREAK! Consistency is power. +${streakDays * 5} BONUS XP.`
    });
    decisions.rewards.push({ xp: streakDays * 5, reason: `${streakDays} day streak bonus` });
    decisions.statChanges.consistency = 3;
  }

  // ---- DETERMINE TOMORROW'S MISSION DIFFICULTY ----
  // Scale difficulty with level and recent performance
  if (level >= 20 && missionCompletionRate >= 0.8) {
    decisions.missionDifficulty = 'hard';
  } else if (level >= 10 && missionCompletionRate >= 0.7) {
    decisions.missionDifficulty = 'medium';
  } else if (missionCompletionRate < 0.5) {
    decisions.missionDifficulty = 'easy';  // Lower difficulty after failures to rebuild
  } else {
    decisions.missionDifficulty = 'medium';
  }

  return decisions;
};

// ====================================================
// GENERATE DAILY MISSIONS
// ====================================================
// Creates a personalized set of missions for the day

const generateDailyMissions = (user) => {
  const { level, stats, profile } = user;
  const missions = [];

  // Always include these core mission types
  const requiredTypes = ['workout', 'nutrition', 'hydration', 'cardio'];
  const optionalTypes = ['sleep', 'discipline'];

  // Pick missions based on level (higher level = more missions)
  const missionCount = Math.min(3 + Math.floor(level / 5), 7);

  // Filter mission pool by difficulty appropriate for the level
  const getDifficultyForLevel = (lvl) => {
    if (lvl >= 20) return ['medium', 'hard'];
    if (lvl >= 10) return ['easy', 'medium'];
    return ['easy'];
  };

  const allowedDifficulties = getDifficultyForLevel(level);

  // Pick one mission from each required type
  requiredTypes.forEach(type => {
    const pool = missionTemplates[type].filter(m => 
      allowedDifficulties.includes(m.difficulty)
    );
    if (pool.length > 0) {
      const mission = pool[Math.floor(Math.random() * pool.length)];
      missions.push({ ...mission, type });
    }
  });

  // Fill remaining slots with optional type missions
  let remainingSlots = missionCount - missions.length;
  optionalTypes.forEach(type => {
    if (remainingSlots <= 0) return;
    const pool = missionTemplates[type].filter(m => 
      allowedDifficulties.includes(m.difficulty)
    );
    if (pool.length > 0) {
      const mission = pool[Math.floor(Math.random() * pool.length)];
      missions.push({ ...mission, type });
      remainingSlots--;
    }
  });

  return missions;
};

// ====================================================
// CALCULATE NUTRITION TARGETS
// ====================================================
// Uses Harris-Benedict BMR formula

const calculateNutritionTargets = (profile) => {
  const { age, gender, height, weight, activityLevel, goal } = profile;

  // Calculate BMR using Harris-Benedict Equation
  let bmr;
  if (gender === 'male') {
    bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
  } else {
    bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
  }

  // Activity multipliers
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9
  };

  const multiplier = activityMultipliers[activityLevel] || 1.55;
  let tdee = bmr * multiplier;  // Total Daily Energy Expenditure

  // Adjust for goal
  let calories;
  if (goal === 'fat_loss') {
    calories = Math.round(tdee - 500);       // 500 calorie deficit
  } else if (goal === 'muscle_gain') {
    calories = Math.round(tdee + 300);       // 300 calorie surplus
  } else {
    calories = Math.round(tdee);             // Maintenance
  }

  // Protein: 2g per kg bodyweight (Indian bodybuilding standard, good for muscle gain)
  const protein = Math.round(weight * 2);
  
  // Fats: 25% of calories
  const fats = Math.round((calories * 0.25) / 9);
  
  // Carbs: remaining calories
  const carbs = Math.round((calories - (protein * 4) - (fats * 9)) / 4);

  return {
    calories,
    protein,
    carbs: Math.max(carbs, 50),  // minimum 50g carbs
    fats,
    bmr: Math.round(bmr),
    tdee: Math.round(tdee)
  };
};

// ====================================================
// CALCULATE BMI
// ====================================================
const calculateBMI = (weight, height) => {
  const heightInM = height / 100;
  const bmi = weight / (heightInM * heightInM);
  
  let category;
  if (bmi < 18.5) category = 'Underweight';
  else if (bmi < 25) category = 'Normal';
  else if (bmi < 30) category = 'Overweight';
  else category = 'Obese';

  return { value: Math.round(bmi * 10) / 10, category };
};

// ====================================================
// CALCULATE XP FOR NEXT LEVEL
// ====================================================
const xpForLevel = (level) => {
  // Increasing XP requirement: Level 1→2 needs 100 XP, each level needs more
  return level * 100 + (level - 1) * 50;
};

module.exports = {
  analyzeUserPerformance,
  generateDailyMissions,
  calculateNutritionTargets,
  calculateBMI,
  xpForLevel,
  indianFoodDatabase: require('./foodDatabase')
};
