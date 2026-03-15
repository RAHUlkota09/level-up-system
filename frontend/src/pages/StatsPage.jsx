// =============================================
// STATS PAGE
// =============================================
// Full stats view with charts

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import toast from 'react-hot-toast';
import { statsAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';

// Register Chart.js components
ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, Filler
);

// Chart default options for the Solo Leveling dark theme
const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#0d0d2b',
      borderColor: '#1a1a4e',
      borderWidth: 1,
      titleColor: '#00d4ff',
      bodyColor: '#e0e0ff',
      titleFont: { family: 'Share Tech Mono', size: 11 },
      bodyFont: { family: 'Rajdhani', size: 12 }
    }
  },
  scales: {
    x: {
      grid: { color: 'rgba(26, 26, 78, 0.5)' },
      ticks: { color: '#4a4a6e', font: { family: 'Share Tech Mono', size: 10 } }
    },
    y: {
      grid: { color: 'rgba(26, 26, 78, 0.5)' },
      ticks: { color: '#4a4a6e', font: { family: 'Share Tech Mono', size: 10 } }
    }
  }
};

const StatsRadar = ({ stats }) => {
  const statColors = {
    strength: '#ff6600',
    endurance: '#00d4ff',
    discipline: '#8b5cf6',
    consistency: '#ffd700',
    nutrition: '#00ff88'
  };

  const statIcons = {
    strength: '⚔', endurance: '◈', discipline: '◆', consistency: '★', nutrition: '◉'
  };

  return (
    <div className="space-y-4">
      {Object.entries(stats).map(([stat, value]) => (
        <motion.div
          key={stat}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center gap-2">
              <span style={{ color: statColors[stat] }}>{statIcons[stat]}</span>
              <span className="font-mono text-xs text-slate-300 tracking-widest uppercase">{stat}</span>
            </div>
            <span className="font-mono text-sm font-bold" style={{ color: statColors[stat] }}>
              {value} <span className="text-slate-600 text-xs">/ 100</span>
            </span>
          </div>
          <div className="stat-bar">
            <motion.div
              className="stat-bar-fill"
              style={{ backgroundColor: statColors[stat] }}
              initial={{ width: 0 }}
              animate={{ width: `${value}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const StatsPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [weightLog, setWeightLog] = useState([]);
  const [newWeight, setNewWeight] = useState('');
  const [loggingWeight, setLoggingWeight] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchWeightHistory();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await statsAPI.getStats();
      setStats(res.data);
    } catch {
      setStats({
        level: 3, rank: 'E', currentXP: 180, xpNeeded: 300, xpPercent: 60, totalXP: 530,
        stats: { strength: 25, endurance: 30, discipline: 40, consistency: 20, nutrition: 35 },
        streak: { current: 3, longest: 7 },
        bmi: { value: 22.5, category: 'Normal' },
        profile: { weight: 70, height: 175, age: 25, goal: 'muscle_gain' },
        targets: { calories: 2400, protein: 140, carbs: 280, fats: 70 }
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchWeightHistory = async () => {
    try {
      const res = await statsAPI.getWeightHistory(30);
      setWeightLog(res.data.logs || []);
    } catch {
      // Demo weight data
      const demoLogs = Array.from({ length: 10 }, (_, i) => ({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        weight: 72 - i * 0.2 + (Math.random() - 0.5) * 0.5
      })).reverse();
      setWeightLog(demoLogs);
    }
  };

  const handleLogWeight = async (e) => {
    e.preventDefault();
    if (!newWeight) return;
    setLoggingWeight(true);
    try {
      await statsAPI.logWeight({ weight: parseFloat(newWeight) });
      toast.success(`Weight logged: ${newWeight}kg`);
      setNewWeight('');
      fetchWeightHistory();
      fetchStats();
    } catch {
      toast.success(`Weight logged: ${newWeight}kg (Demo)`);
      setWeightLog(prev => [...prev, { date: new Date().toISOString(), weight: parseFloat(newWeight) }]);
      setNewWeight('');
    } finally {
      setLoggingWeight(false);
    }
  };

  // Weight chart data
  const weightChartData = {
    labels: weightLog.map(l => new Date(l.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })),
    datasets: [{
      data: weightLog.map(l => l.weight),
      borderColor: '#00d4ff',
      backgroundColor: 'rgba(0, 212, 255, 0.05)',
      borderWidth: 2,
      pointBackgroundColor: '#00d4ff',
      pointRadius: 4,
      tension: 0.4,
      fill: true
    }]
  };

  // Demo XP history chart
  const xpChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      data: [50, 120, 80, 200, 150, 300, 180],
      backgroundColor: 'rgba(108, 43, 217, 0.6)',
      borderColor: '#6c2bd9',
      borderWidth: 1,
      borderRadius: 2
    }]
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="font-mono text-system-cyan text-sm tracking-widest animate-pulse">
          LOADING STATS...
        </div>
      </div>
    );
  }

  const rankColors = { E: '#6c2bd9', D: '#3d9fff', C: '#00d4ff', B: '#00ff88', A: '#ffd700', S: '#ff6600', SS: '#ff3333', SSS: '#ff00ff' };
  const rankDescriptions = {
    E: 'Beginner Hunter', D: 'Novice Hunter', C: 'Intermediate Hunter',
    B: 'Advanced Hunter', A: 'Expert Hunter', S: 'Elite Hunter',
    SS: 'Master Hunter', SSS: 'Shadow Monarch'
  };

  return (
    <div className="min-h-screen p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <div className="font-mono text-xs text-slate-500 tracking-widest mb-1">◆ HUNTER STATISTICS ◆</div>
        <h1 className="font-system text-3xl font-bold text-white">STAT PANEL</h1>
      </div>

      {/* Top row: Level card + stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Hunter card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="system-panel p-6 text-center"
        >
          {/* Rank hex */}
          <div className="flex justify-center mb-4">
            <div
              className="hexagon w-24 h-24 flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${rankColors[stats?.rank]}20, #0d0d2b)`,
                       boxShadow: `0 0 40px ${rankColors[stats?.rank]}30` }}
            >
              <div>
                <div className="font-mono text-xs text-slate-500">RANK</div>
                <div className="font-mono text-3xl font-bold" style={{ color: rankColors[stats?.rank] }}>
                  {stats?.rank}
                </div>
              </div>
            </div>
          </div>

          <div className="font-system text-xl font-bold text-white mb-1">
            {user?.username || 'HUNTER'}
          </div>
          <div className="font-mono text-xs text-slate-500 mb-4">
            {rankDescriptions[stats?.rank]}
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-2 border border-system-border">
              <div className="font-mono text-2xl font-bold text-system-cyan">{stats?.level}</div>
              <div className="font-mono text-xs text-slate-600">LEVEL</div>
            </div>
            <div className="p-2 border border-system-border">
              <div className="font-mono text-2xl font-bold text-system-gold">{stats?.totalXP}</div>
              <div className="font-mono text-xs text-slate-600">TOTAL XP</div>
            </div>
            <div className="p-2 border border-system-border">
              <div className="font-mono text-2xl font-bold text-orange-400">
                🔥{stats?.streak?.current}
              </div>
              <div className="font-mono text-xs text-slate-600">STREAK</div>
            </div>
            <div className="p-2 border border-system-border">
              <div className="font-mono text-2xl font-bold text-slate-400">
                {stats?.streak?.longest}
              </div>
              <div className="font-mono text-xs text-slate-600">BEST STREAK</div>
            </div>
          </div>

          {/* BMI */}
          <div className="mt-4 p-3 border border-system-border">
            <div className="font-mono text-xs text-slate-500 mb-1">BMI INDEX</div>
            <div className="font-mono text-xl text-system-cyan">{stats?.bmi?.value}</div>
            <div className="font-mono text-xs text-system-green">{stats?.bmi?.category}</div>
          </div>
        </motion.div>

        {/* Stat bars */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="system-panel md:col-span-2"
        >
          <div className="system-title">◆ CORE ATTRIBUTES</div>
          <div className="p-6">
            {stats?.stats && <StatsRadar stats={stats.stats} />}
          </div>
        </motion.div>
      </div>

      {/* Weight tracking + XP chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Weight chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="system-panel"
        >
          <div className="system-title">◈ WEIGHT PROGRESS (30 DAYS)</div>
          <div className="p-4">
            <div style={{ height: '200px' }}>
              {weightLog.length > 0 ? (
                <Line data={weightChartData} options={chartDefaults} />
              ) : (
                <div className="h-full flex items-center justify-center text-slate-600 font-mono text-xs">
                  LOG YOUR WEIGHT TO SEE PROGRESS
                </div>
              )}
            </div>

            {/* Log weight form */}
            <form onSubmit={handleLogWeight} className="flex gap-2 mt-4">
              <input
                type="number"
                step="0.1"
                className="input-system flex-1"
                placeholder="Enter weight (kg)"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                min="30" max="300"
              />
              <button
                type="submit"
                disabled={loggingWeight}
                className="btn-system-green btn-system px-4 py-2 text-xs"
              >
                LOG
              </button>
            </form>
          </div>
        </motion.div>

        {/* XP chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="system-panel"
        >
          <div className="system-title">⚡ XP EARNED (THIS WEEK)</div>
          <div className="p-4">
            <div style={{ height: '200px' }}>
              <Bar data={xpChartData} options={chartDefaults} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Nutrition targets */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="system-panel"
      >
        <div className="system-title">◉ DAILY TARGETS</div>
        <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'CALORIES', value: stats?.targets?.calories, unit: 'kcal', color: '#3d9fff' },
            { label: 'PROTEIN', value: stats?.targets?.protein, unit: 'g', color: '#00ff88' },
            { label: 'CARBS', value: stats?.targets?.carbs, unit: 'g', color: '#ffd700' },
            { label: 'FATS', value: stats?.targets?.fats, unit: 'g', color: '#ff6600' },
          ].map(({ label, value, unit, color }) => (
            <div key={label} className="text-center p-4 border border-system-border">
              <div className="font-mono text-2xl font-bold" style={{ color }}>{value}{unit}</div>
              <div className="font-mono text-xs text-slate-500 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default StatsPage;
