// =============================================
// MISSIONS PAGE
// =============================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { missionsAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';

const difficultyColors = {
  easy: '#00ff88',
  medium: '#3d9fff',
  hard: '#ff6600',
  extreme: '#ff3333'
};

const typeIcons = {
  workout: '⚔',
  nutrition: '◉',
  hydration: '◈',
  cardio: '◆',
  sleep: '◉',
  discipline: '★'
};

const MissionCard = ({ mission, onComplete, onAnalyze }) => {
  const isCompleted = mission.status === 'completed';
  const isFailed = mission.status === 'failed';
  const isPenalty = mission.isPenalty;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`mission-card p-4 ${isCompleted ? 'completed' : ''} ${isPenalty ? 'penalty' : ''}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          {/* Status indicator */}
          <div className={`mt-1 w-5 h-5 border-2 flex items-center justify-center flex-shrink-0 ${
            isCompleted ? 'border-system-green text-system-green' : 'border-slate-600'
          }`}>
            {isCompleted && <span className="text-xs">✓</span>}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-slate-400 text-sm">{typeIcons[mission.type] || '◈'}</span>
              <h3 className={`font-system font-semibold ${
                isCompleted ? 'text-slate-500 line-through' : isPenalty ? 'text-red-300' : 'text-white'
              }`}>
                {isPenalty && '⚠ '}{mission.title}
              </h3>
            </div>

            {mission.description && (
              <p className="text-slate-500 text-sm font-system mb-2">{mission.description}</p>
            )}

            <div className="flex items-center gap-3 flex-wrap">
              <span
                className="font-mono text-xs px-2 py-0.5 border"
                style={{
                  color: difficultyColors[mission.difficulty],
                  borderColor: difficultyColors[mission.difficulty] + '40'
                }}
              >
                {mission.difficulty?.toUpperCase()}
              </span>
              <span className="font-mono text-xs text-system-cyan">+{mission.xpReward} XP</span>
              {mission.target > 1 && (
                <span className="font-mono text-xs text-slate-600">
                  TARGET: {mission.target} {mission.unit}
                </span>
              )}
              {isPenalty && (
                <span className="font-mono text-xs text-red-400 border border-red-900 px-2 py-0.5">
                  PENALTY
                </span>
              )}
            </div>

            {/* Progress bar if in progress */}
            {mission.progress > 0 && mission.progress < mission.target && (
              <div className="mt-2">
                <div className="stat-bar">
                  <div
                    className="stat-bar-fill bg-system-blue"
                    style={{ width: `${(mission.progress / mission.target) * 100}%` }}
                  />
                </div>
                <div className="font-mono text-xs text-slate-600 mt-1">
                  {mission.progress} / {mission.target} {mission.unit}
                </div>
              </div>
            )}
          </div>
        </div>

        {!isCompleted && !isFailed && (
          <button
            onClick={() => onComplete(mission._id, mission.title)}
            className="btn-system-green btn-system text-xs px-4 py-2 flex-shrink-0"
          >
            COMPLETE
          </button>
        )}

        {isCompleted && (
          <div className="font-mono text-xs text-system-green opacity-60 flex-shrink-0">
            ✓ DONE
          </div>
        )}
      </div>
    </motion.div>
  );
};

const MissionsPage = () => {
  const { updateUser } = useAuth();
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  useEffect(() => {
    fetchMissions();
  }, []);

  const fetchMissions = async () => {
    try {
      const res = await missionsAPI.getToday();
      setMissions(res.data.missions || []);
    } catch (error) {
      // Demo data
      setMissions([
        { _id: '1', title: 'Complete Upper Body Workout', type: 'workout', xpReward: 100, status: 'completed', difficulty: 'medium', target: 1, unit: 'session', description: 'Chest, shoulders, triceps, biceps' },
        { _id: '2', title: 'Drink 3L of Water', type: 'hydration', xpReward: 50, status: 'pending', difficulty: 'easy', target: 3, unit: 'litres', description: 'Stay hydrated throughout the day' },
        { _id: '3', title: 'Hit Protein Target', type: 'nutrition', xpReward: 100, status: 'pending', difficulty: 'medium', target: 100, unit: '%', description: 'Consume your daily protein goal' },
        { _id: '4', title: 'Walk 8,000 Steps', type: 'cardio', xpReward: 60, status: 'pending', difficulty: 'easy', target: 8000, unit: 'steps' },
        { _id: '5', title: 'Sleep Before 11 PM', type: 'sleep', xpReward: 70, status: 'pending', difficulty: 'medium', target: 1, unit: 'day' },
        { _id: 'p1', title: 'PENALTY: 50 Push-ups', type: 'workout', xpReward: 30, status: 'pending', difficulty: 'hard', target: 50, unit: 'reps', isPenalty: true, description: 'System penalty for yesterday\'s failures' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (missionId, title) => {
    try {
      const res = await missionsAPI.complete(missionId);
      const { leveledUp, newLevel, currentXP, xpEarned } = res.data;

      setMissions(prev =>
        prev.map(m => m._id === missionId ? { ...m, status: 'completed' } : m)
      );

      toast.success(`⚡ QUEST COMPLETE! +${xpEarned} XP`);
      if (leveledUp) {
        toast.success(`🎉 LEVEL UP! You are now Level ${newLevel}!`, { duration: 5000 });
        updateUser({ level: newLevel, currentXP });
      }
    } catch (error) {
      // Demo mode: just mark completed
      setMissions(prev =>
        prev.map(m => m._id === missionId ? { ...m, status: 'completed' } : m)
      );
      toast.success(`⚡ QUEST COMPLETE! (Demo Mode)`);
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const res = await missionsAPI.analyze();
      setAnalysisResult(res.data.analysis);
    } catch (error) {
      toast.error('Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const completedMissions = missions.filter(m => m.status === 'completed');
  const pendingMissions = missions.filter(m => m.status === 'pending' && !m.isPenalty);
  const penaltyMissions = missions.filter(m => m.isPenalty && m.status !== 'completed');
  const totalXP = completedMissions.reduce((sum, m) => sum + (m.xpReward || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="font-mono text-system-cyan text-sm tracking-widest animate-pulse">
          LOADING MISSIONS...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="font-mono text-xs text-slate-500 tracking-widest mb-1">◈ MISSION BOARD ◈</div>
        <h1 className="font-system text-3xl font-bold text-white">TODAY'S QUESTS</h1>
        <div className="flex items-center gap-4 mt-2">
          <span className="font-mono text-xs text-system-cyan">
            {completedMissions.length}/{missions.length} COMPLETED
          </span>
          <span className="font-mono text-xs text-system-gold">
            +{totalXP} XP EARNED
          </span>
        </div>
      </div>

      {/* Analyze button */}
      <div className="mb-6">
        <button
          onClick={handleAnalyze}
          disabled={analyzing}
          className="btn-system py-2 px-6"
        >
          {analyzing ? 'ANALYZING...' : '⚡ RUN AI ANALYSIS'}
        </button>
        <span className="font-mono text-xs text-slate-600 ml-3">
          Evaluate yesterday's performance
        </span>
      </div>

      {/* Analysis result */}
      <AnimatePresence>
        {analysisResult && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 system-panel"
          >
            <div className="system-title">⚡ AI ANALYSIS RESULT</div>
            <div className="p-4 space-y-2">
              {analysisResult.messages?.map((msg, i) => (
                <div key={i} className={`system-notification ${msg.type}`}>
                  <div className="font-mono text-xs font-bold mb-1">{msg.title}</div>
                  <div className="text-slate-300 text-xs">{msg.body}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Penalty missions (shown first, dramatically) */}
      {penaltyMissions.length > 0 && (
        <div className="mb-6">
          <div className="system-title mb-3 text-red-400" style={{ borderColor: '#ff333340' }}>
            🚨 PENALTY MISSIONS — FAILURE CONSEQUENCES
          </div>
          <div className="space-y-2">
            {penaltyMissions.map(m => (
              <MissionCard key={m._id} mission={m} onComplete={handleComplete} />
            ))}
          </div>
        </div>
      )}

      {/* Pending missions */}
      {pendingMissions.length > 0 && (
        <div className="mb-6">
          <div className="system-title mb-3">⚔ ACTIVE MISSIONS</div>
          <div className="space-y-2">
            <AnimatePresence>
              {pendingMissions.map(m => (
                <MissionCard key={m._id} mission={m} onComplete={handleComplete} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Completed missions */}
      {completedMissions.length > 0 && (
        <div>
          <div className="system-title mb-3 text-system-green" style={{ color: '#00ff88' }}>
            ✓ COMPLETED MISSIONS
          </div>
          <div className="space-y-2 opacity-70">
            {completedMissions.map(m => (
              <MissionCard key={m._id} mission={m} onComplete={handleComplete} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MissionsPage;
