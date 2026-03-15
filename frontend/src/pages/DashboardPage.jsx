// =============================================
// DASHBOARD PAGE
// =============================================
// Main hub showing level, stats, missions overview, and notifications

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { statsAPI, missionsAPI, nutritionAPI } from '../services/api';

// ---- STAT BAR COMPONENT ----
const StatBar = ({ label, value, color, icon }) => (
  <div>
    <div className="flex justify-between items-center mb-1">
      <span className="font-mono text-xs text-slate-400 tracking-widest">{icon} {label}</span>
      <span className="font-mono text-xs" style={{ color }}>{value}</span>
    </div>
    <div className="stat-bar">
      <motion.div
        className="stat-bar-fill"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1.2, delay: 0.3 }}
      />
    </div>
  </div>
);

// ---- SYSTEM NOTIFICATION ----
const SystemNotif = ({ type, title, body }) => {
  const colors = {
    success: 'text-system-green',
    warning: 'text-orange-400',
    danger: 'text-red-400',
    info: 'text-system-cyan',
    legendary: 'text-system-gold'
  };

  return (
    <div className={`system-notification ${type} mb-2`}>
      <div className={`font-mono text-xs tracking-widest font-bold ${colors[type]} mb-1`}>
        {title}
      </div>
      <div className="text-slate-300 text-xs leading-relaxed">{body}</div>
    </div>
  );
};

// ---- LEVEL UP OVERLAY ----
const LevelUpOverlay = ({ level, onDone }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
    onClick={onDone}
  >
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 1.2, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 200 }}
      className="text-center"
    >
      <div className="font-mono text-system-cyan text-sm tracking-widest mb-4 opacity-60">
        ◈◈◈ SYSTEM MESSAGE ◈◈◈
      </div>
      <div className="font-mono text-6xl font-bold text-white mb-4 text-glow-cyan">
        LEVEL UP!
      </div>
      <div className="font-mono text-3xl text-system-gold text-glow-gold">
        LEVEL {level}
      </div>
      <div className="font-mono text-slate-400 text-sm mt-6 tracking-widest">
        [ CLICK TO CONTINUE ]
      </div>
    </motion.div>
  </motion.div>
);

const DashboardPage = () => {
  const { user, updateUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [missions, setMissions] = useState([]);
  const [nutrition, setNutrition] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [levelUpShow, setLevelUpShow] = useState(false);
  const [newLevel, setNewLevel] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, missionsRes, nutritionRes] = await Promise.all([
        statsAPI.getStats(),
        missionsAPI.getToday(),
        nutritionAPI.getToday()
      ]);

      setStats(statsRes.data);
      setMissions(missionsRes.data.missions || []);
      setNutrition(nutritionRes.data);

      // Build notifications from nutrition alerts
      if (nutritionRes.data.systemAlert) {
        setNotifications([nutritionRes.data.systemAlert]);
      }
    } catch (error) {
      console.error('Dashboard load error:', error);
      // Use demo data if backend not available
      setStats(demoStats);
      setMissions(demoMissions);
      setNutrition(demoNutrition);
    } finally {
      setLoading(false);
    }
  };

  // Complete a mission from dashboard
  const handleCompleteMission = async (missionId, missionTitle) => {
    try {
      const res = await missionsAPI.complete(missionId);
      const { leveledUp, newLevel: lvl, currentXP, xpEarned } = res.data;

      setMissions(prev =>
        prev.map(m => m._id === missionId ? { ...m, status: 'completed' } : m)
      );

      toast.success(`✓ ${missionTitle} | +${xpEarned} XP`);

      if (leveledUp) {
        setNewLevel(lvl);
        setLevelUpShow(true);
        updateUser({ level: lvl, currentXP });
      } else {
        updateUser({ currentXP });
      }

      // Refresh stats
      const statsRes = await statsAPI.getStats();
      setStats(statsRes.data);
    } catch (error) {
      toast.error('Error completing mission');
    }
  };

  // --- DEMO DATA (shown when backend is offline) ---
  const demoStats = {
    level: 3, rank: 'E', currentXP: 180, xpNeeded: 300, xpPercent: 60,
    stats: { strength: 25, endurance: 30, discipline: 40, consistency: 20, nutrition: 35 },
    streak: { current: 3, longest: 5 },
    bmi: { value: 22.5, category: 'Normal' },
    targets: { calories: 2400, protein: 140, carbs: 280, fats: 70 }
  };
  const demoMissions = [
    { _id: '1', title: 'Complete Upper Body Workout', type: 'workout', xpReward: 100, status: 'completed', difficulty: 'medium' },
    { _id: '2', title: 'Drink 3L of Water', type: 'hydration', xpReward: 50, status: 'pending', difficulty: 'easy' },
    { _id: '3', title: 'Hit Protein Target', type: 'nutrition', xpReward: 100, status: 'pending', difficulty: 'medium' },
    { _id: '4', title: 'Walk 8,000 Steps', type: 'cardio', xpReward: 60, status: 'pending', difficulty: 'easy' },
  ];
  const demoNutrition = {
    totals: { protein: 68, carbs: 180, fats: 45, calories: 1420 },
    targets: { protein: 140, carbs: 280, fats: 70, calories: 2400 },
    percentages: { protein: 49, calories: 59 },
    systemAlert: { type: 'danger', title: '⚠ PROTEIN DEFICIT DETECTED', message: 'You\'ve only consumed 68g protein. Target: 140g. Eat: Paneer, Eggs, or Soya Chunks.' }
  };

  const displayStats = stats || demoStats;
  const displayMissions = missions.length > 0 ? missions : demoMissions;
  const displayNutrition = nutrition || demoNutrition;

  const completedMissions = displayMissions.filter(m => m.status === 'completed').length;
  const totalMissions = displayMissions.length;
  const completionPct = totalMissions > 0 ? Math.round((completedMissions / totalMissions) * 100) : 0;

  const rankColors = { E: '#6c2bd9', D: '#3d9fff', C: '#00d4ff', B: '#00ff88', A: '#ffd700', S: '#ff6600', SS: '#ff3333', SSS: '#ff00ff' };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="font-mono text-system-cyan text-sm tracking-widest animate-pulse">
          LOADING SYSTEM DATA...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 space-y-4">

      {/* Level Up overlay */}
      <AnimatePresence>
        {levelUpShow && (
          <LevelUpOverlay level={newLevel} onDone={() => setLevelUpShow(false)} />
        )}
      </AnimatePresence>

      {/* ---- TOP: Level + XP ---- */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="system-panel p-6"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">

          {/* Level hex + rank */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="hexagon w-20 h-20 bg-system-panel flex items-center justify-center"
                style={{ boxShadow: `0 0 30px ${rankColors[displayStats.rank] || '#6c2bd9'}40` }}
              >
                <div className="text-center">
                  <div className="font-mono text-xs text-slate-500">LVL</div>
                  <div className="font-mono text-2xl font-bold text-white text-glow-cyan">
                    {displayStats.level}
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-2xl font-bold text-white">
                  {user?.username || 'HUNTER'}
                </span>
                <span
                  className="rank-badge text-sm"
                  style={{ color: rankColors[displayStats.rank], borderColor: rankColors[displayStats.rank] }}
                >
                  RANK {displayStats.rank}
                </span>
              </div>
              <div className="text-slate-500 font-system text-sm">
                {displayStats.streak?.current > 0 && (
                  <span className="text-orange-400">🔥 {displayStats.streak.current} DAY STREAK</span>
                )}
              </div>
            </div>
          </div>

          {/* XP bar */}
          <div className="flex-1 w-full">
            <div className="flex justify-between items-center mb-2">
              <span className="font-mono text-xs text-slate-400 tracking-widest">EXPERIENCE POINTS</span>
              <span className="font-mono text-xs text-system-cyan">
                {displayStats.currentXP} / {displayStats.xpNeeded} XP
              </span>
            </div>
            <div className="xp-bar">
              <motion.div
                className="xp-bar-fill"
                initial={{ width: 0 }}
                animate={{ width: `${displayStats.xpPercent}%` }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="font-mono text-xs text-slate-600">LEVEL {displayStats.level}</span>
              <span className="font-mono text-xs text-slate-600">LEVEL {displayStats.level + 1}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ---- MAIN GRID ---- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* ---- LEFT: Stats Panel ---- */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="system-panel"
        >
          <div className="system-title">◆ HUNTER STATS</div>
          <div className="p-4 space-y-4">
            <StatBar label="STRENGTH" value={displayStats.stats.strength} color="#ff6600" icon="⚔" />
            <StatBar label="ENDURANCE" value={displayStats.stats.endurance} color="#00d4ff" icon="◈" />
            <StatBar label="DISCIPLINE" value={displayStats.stats.discipline} color="#6c2bd9" icon="◆" />
            <StatBar label="CONSISTENCY" value={displayStats.stats.consistency} color="#ffd700" icon="★" />
            <StatBar label="NUTRITION" value={displayStats.stats.nutrition} color="#00ff88" icon="◉" />
          </div>
          <div className="px-4 pb-4">
            <Link to="/stats" className="btn-system text-center w-full block text-xs py-2">
              VIEW FULL STATS →
            </Link>
          </div>
        </motion.div>

        {/* ---- CENTER: Today's Missions ---- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="system-panel md:col-span-2"
        >
          <div className="system-title flex items-center justify-between">
            <span>⚔ TODAY'S MISSIONS</span>
            <span className="text-system-cyan">{completedMissions}/{totalMissions} — {completionPct}%</span>
          </div>

          {/* Mission completion progress */}
          <div className="px-4 pt-3">
            <div className="xp-bar">
              <motion.div
                className="xp-bar-fill"
                style={{ background: completionPct === 100 ? '#00ff88' : undefined }}
                initial={{ width: 0 }}
                animate={{ width: `${completionPct}%` }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
          </div>

          <div className="p-4 space-y-2">
            {displayMissions.slice(0, 5).map((mission, i) => (
              <motion.div
                key={mission._id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i }}
                className={`mission-card p-3 flex items-center justify-between ${
                  mission.status === 'completed' ? 'completed' : ''
                } ${mission.isPenalty ? 'penalty' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 border flex items-center justify-center text-xs ${
                    mission.status === 'completed'
                      ? 'border-system-green text-system-green'
                      : 'border-slate-600'
                  }`}>
                    {mission.status === 'completed' ? '✓' : ''}
                  </div>
                  <div>
                    <div className={`font-system text-sm ${
                      mission.status === 'completed' ? 'text-slate-500 line-through' : 'text-white'
                    } ${mission.isPenalty ? 'text-red-400' : ''}`}>
                      {mission.isPenalty && '⚠ '}{mission.title}
                    </div>
                    <div className="text-slate-600 font-mono text-xs">
                      {mission.type?.toUpperCase()} · +{mission.xpReward} XP
                    </div>
                  </div>
                </div>

                {mission.status !== 'completed' && (
                  <button
                    onClick={() => handleCompleteMission(mission._id, mission.title)}
                    className="btn-system-green btn-system text-xs px-3 py-1 flex-shrink-0"
                  >
                    DONE
                  </button>
                )}
              </motion.div>
            ))}
          </div>

          <div className="px-4 pb-4">
            <Link to="/missions" className="btn-system text-center w-full block text-xs py-2">
              ALL MISSIONS →
            </Link>
          </div>
        </motion.div>
      </div>

      {/* ---- BOTTOM: Nutrition + Notifications ---- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Protein bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="system-panel"
        >
          <div className="system-title">◉ TODAY'S NUTRITION</div>
          <div className="p-4 space-y-3">
            {[
              { label: 'PROTEIN', current: displayNutrition?.totals?.protein || 0, target: displayNutrition?.targets?.protein || 140, unit: 'g', color: '#00ff88' },
              { label: 'CALORIES', current: displayNutrition?.totals?.calories || 0, target: displayNutrition?.targets?.calories || 2000, unit: 'kcal', color: '#3d9fff' },
              { label: 'CARBS', current: displayNutrition?.totals?.carbs || 0, target: displayNutrition?.targets?.carbs || 250, unit: 'g', color: '#ffd700' },
              { label: 'FATS', current: displayNutrition?.totals?.fats || 0, target: displayNutrition?.targets?.fats || 70, unit: 'g', color: '#ff6600' },
            ].map(({ label, current, target, unit, color }) => {
              const pct = Math.min(100, Math.round((current / target) * 100));
              return (
                <div key={label}>
                  <div className="flex justify-between mb-1">
                    <span className="font-mono text-xs text-slate-400">{label}</span>
                    <span className="font-mono text-xs" style={{ color }}>
                      {Math.round(current)}{unit} / {target}{unit}
                    </span>
                  </div>
                  <div className="stat-bar">
                    <motion.div
                      className="stat-bar-fill"
                      style={{ backgroundColor: color, width: `${pct}%` }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="px-4 pb-4">
            <Link to="/nutrition" className="btn-system text-center w-full block text-xs py-2">
              LOG FOOD →
            </Link>
          </div>
        </motion.div>

        {/* System notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="system-panel"
        >
          <div className="system-title">◈ SYSTEM NOTIFICATIONS</div>
          <div className="p-4 space-y-2">
            {displayNutrition?.systemAlert && (
              <SystemNotif
                type={displayNutrition.systemAlert.type}
                title={displayNutrition.systemAlert.title}
                body={displayNutrition.systemAlert.message}
              />
            )}
            {displayStats.streak?.current >= 3 && (
              <SystemNotif
                type="success"
                title="🔥 STREAK ACTIVE"
                body={`${displayStats.streak.current} day streak! Keep going for bonus XP.`}
              />
            )}
            <SystemNotif
              type="info"
              title="SYSTEM MESSAGE"
              body={`Today's missions loaded. Complete all ${totalMissions} missions to maximize XP gain.`}
            />
            {displayStats.bmi && (
              <SystemNotif
                type="info"
                title="BMI STATUS"
                body={`Current BMI: ${displayStats.bmi.value} — ${displayStats.bmi.category}`}
              />
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;
