// =============================================
// NUTRITION PAGE
// =============================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { nutritionAPI } from '../services/api';

const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack', 'pre_workout', 'post_workout'];

// Quick-select Indian foods for fast logging
const quickFoods = [
  { name: 'Eggs (Whole)', quantity: 100, emoji: '🥚' },
  { name: 'Paneer (Cottage Cheese)', quantity: 100, emoji: '🧀' },
  { name: 'Chicken Breast (Boneless)', quantity: 100, emoji: '🍗' },
  { name: 'Dal (Toor/Arhar)', quantity: 100, emoji: '🫘' },
  { name: 'Soya Chunks (TVP)', quantity: 50, emoji: '⬡' },
  { name: 'Milk (Full Fat)', quantity: 250, emoji: '🥛' },
  { name: 'Curd/Yogurt (Plain)', quantity: 200, emoji: '🍶' },
  { name: 'White Rice (Cooked)', quantity: 185, emoji: '🍚' },
  { name: 'Chapati/Roti (Wheat)', quantity: 40, emoji: '🫓' },
  { name: 'Oats (Rolled)', quantity: 40, emoji: '🌾' },
  { name: 'Banana', quantity: 120, emoji: '🍌' },
  { name: 'Peanut Butter', quantity: 32, emoji: '🥜' },
];

const MacroBar = ({ label, current, target, unit, color }) => {
  const pct = Math.min(100, Math.round((current / target) * 100));
  return (
    <div className="system-panel p-4">
      <div className="flex justify-between mb-2">
        <span className="font-mono text-xs text-slate-400 tracking-widest">{label}</span>
        <span className="font-mono text-xs" style={{ color }}>
          {Math.round(current)}{unit} <span className="text-slate-600">/ {target}{unit}</span>
        </span>
      </div>
      <div className="stat-bar">
        <motion.div
          className="stat-bar-fill"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1 }}
        />
      </div>
      <div className="font-mono text-xs mt-1" style={{ color: pct >= 100 ? color : '#4a4a6e' }}>
        {pct}% {pct >= 100 ? '✓ TARGET HIT' : `— ${Math.round(target - current)}${unit} remaining`}
      </div>
    </div>
  );
};

const NutritionPage = () => {
  const [todayData, setTodayData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [quantity, setQuantity] = useState(100);
  const [mealType, setMealType] = useState('lunch');
  const [logging, setLogging] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchTodaysData();
  }, []);

  const fetchTodaysData = async () => {
    try {
      const res = await nutritionAPI.getToday();
      setTodayData(res.data);
    } catch (error) {
      // Demo data
      setTodayData({
        logs: [
          { _id: '1', foodName: 'Eggs (Whole)', quantity: 150, protein: 19.5, carbs: 1.7, fats: 16.5, calories: 233, mealType: 'breakfast' },
          { _id: '2', foodName: 'Oats (Rolled)', quantity: 80, protein: 13.6, carbs: 52.8, fats: 5.6, calories: 311, mealType: 'breakfast' },
          { _id: '3', foodName: 'Dal (Toor/Arhar)', quantity: 200, protein: 44, carbs: 114, fats: 3.4, calories: 670, mealType: 'lunch' },
        ],
        totals: { protein: 77.1, carbs: 168.5, fats: 25.5, calories: 1214 },
        targets: { protein: 140, carbs: 280, fats: 70, calories: 2400 },
        percentages: { protein: 55, calories: 51 },
        systemAlert: {
          type: 'warning',
          title: '⚠ PROTEIN DEFICIT',
          message: 'Need 62.9g more protein. Recommended: Paneer (18g/100g), Chicken (31g/100g), Soya Chunks (52g/100g).'
        }
      });
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await nutritionAPI.searchFoods(query);
      setSearchResults(res.data.foods || []);
    } catch (error) {
      // Demo search from quick foods
      const filtered = quickFoods.filter(f =>
        f.name.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered.map(f => ({ name: f.name, per100g: { protein: 15, carbs: 10, fats: 5, calories: 150 } })));
    } finally {
      setSearching(false);
    }
  };

  const selectFood = (food) => {
    setSelectedFood(food);
    setSearchQuery(food.name);
    setSearchResults([]);
  };

  const handleQuickLog = async (quickFood) => {
    try {
      await nutritionAPI.logFood({
        foodName: quickFood.name,
        quantity: quickFood.quantity,
        mealType
      });
      toast.success(`${quickFood.emoji} ${quickFood.name} logged!`);
      fetchTodaysData();
    } catch (error) {
      toast.success(`${quickFood.emoji} ${quickFood.name} logged! (Demo)`);
    }
  };

  const handleLogFood = async (e) => {
    e.preventDefault();
    if (!selectedFood && !searchQuery) return;

    setLogging(true);
    try {
      await nutritionAPI.logFood({
        foodName: selectedFood?.name || searchQuery,
        quantity: parseInt(quantity),
        mealType
      });
      toast.success('Food logged successfully!');
      setSelectedFood(null);
      setSearchQuery('');
      setQuantity(100);
      setShowAddForm(false);
      fetchTodaysData();
    } catch (error) {
      toast.error('Failed to log food');
    } finally {
      setLogging(false);
    }
  };

  const handleDelete = async (logId) => {
    try {
      await nutritionAPI.deleteLog(logId);
      toast.success('Entry removed');
      fetchTodaysData();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const data = todayData;
  const totals = data?.totals || { protein: 0, carbs: 0, fats: 0, calories: 0 };
  const targets = data?.targets || { protein: 140, carbs: 280, fats: 70, calories: 2400 };

  return (
    <div className="min-h-screen p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="font-mono text-xs text-slate-500 tracking-widest mb-1">◉ NUTRITION TRACKER ◉</div>
        <h1 className="font-system text-3xl font-bold text-white">MACRO CONTROL</h1>
      </div>

      {/* System alert */}
      {data?.systemAlert && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`system-notification ${data.systemAlert.type} mb-6`}
        >
          <div className="font-mono text-xs font-bold mb-1">{data.systemAlert.title}</div>
          <div className="text-slate-300 text-xs">{data.systemAlert.message}</div>
        </motion.div>
      )}

      {/* Macro bars grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <MacroBar label="PROTEIN" current={totals.protein} target={targets.protein} unit="g" color="#00ff88" />
        <MacroBar label="CALORIES" current={totals.calories} target={targets.calories} unit="" color="#3d9fff" />
        <MacroBar label="CARBS" current={totals.carbs} target={targets.carbs} unit="g" color="#ffd700" />
        <MacroBar label="FATS" current={totals.fats} target={targets.fats} unit="g" color="#ff6600" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* ---- LOG FOOD ---- */}
        <div>
          <div className="system-panel mb-4">
            <div className="system-title flex items-center justify-between">
              <span>+ LOG FOOD</span>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="text-system-cyan text-xs font-mono"
              >
                {showAddForm ? 'COLLAPSE' : 'EXPAND'}
              </button>
            </div>

            <AnimatePresence>
              {showAddForm && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="p-4"
                >
                  <form onSubmit={handleLogFood} className="space-y-3">
                    {/* Search */}
                    <div className="relative">
                      <label className="block text-xs font-mono text-slate-400 tracking-widest mb-1">SEARCH FOOD</label>
                      <input
                        type="text"
                        className="input-system"
                        placeholder="e.g. Paneer, Eggs, Dal..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                      />
                      {/* Search results dropdown */}
                      {searchResults.length > 0 && (
                        <div className="absolute z-10 w-full bg-system-dark border border-system-border mt-1 max-h-48 overflow-y-auto">
                          {searchResults.map((food, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => selectFood(food)}
                              className="w-full text-left px-3 py-2 font-system text-sm text-white hover:bg-system-purple hover:bg-opacity-20 transition-colors"
                            >
                              {food.name}
                              {food.per100g && (
                                <span className="text-slate-500 text-xs ml-2">
                                  {food.per100g.protein}g P / {food.per100g.calories} kcal per 100g
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-mono text-slate-400 tracking-widest mb-1">QUANTITY (g)</label>
                        <input
                          type="number"
                          className="input-system"
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                          min="1" max="2000"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono text-slate-400 tracking-widest mb-1">MEAL TYPE</label>
                        <select
                          className="input-system"
                          value={mealType}
                          onChange={(e) => setMealType(e.target.value)}
                        >
                          {mealTypes.map(t => (
                            <option key={t} value={t}>{t.replace('_', ' ').toUpperCase()}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={logging || !searchQuery}
                      className="btn-system-green btn-system w-full py-2"
                    >
                      {logging ? 'LOGGING...' : '+ LOG FOOD ITEM'}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quick log buttons */}
          <div className="system-panel">
            <div className="system-title">⚡ QUICK LOG — COMMON FOODS</div>
            <div className="p-4 grid grid-cols-2 gap-2">
              {quickFoods.map((food, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickLog(food)}
                  className="text-left p-2 border border-system-border hover:border-system-purple transition-colors font-system text-sm text-white hover:text-system-cyan"
                >
                  <span className="mr-1">{food.emoji}</span>
                  <span className="text-xs">{food.name.split(' ')[0]}</span>
                  <div className="font-mono text-xs text-slate-600">{food.quantity}g</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ---- TODAY'S LOG ---- */}
        <div className="system-panel">
          <div className="system-title">◈ TODAY'S FOOD LOG</div>
          <div className="p-4">
            {data?.logs?.length === 0 ? (
              <div className="text-slate-600 font-mono text-xs text-center py-8">
                NO FOOD LOGGED YET
              </div>
            ) : (
              <div className="space-y-2">
                {data?.logs?.map((log) => (
                  <motion.div
                    key={log._id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-between p-3 border border-system-border hover:border-system-purple transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-system text-sm text-white">{log.foodName}</div>
                      <div className="font-mono text-xs text-slate-600">
                        {log.quantity}g · {log.mealType?.toUpperCase()}
                      </div>
                      <div className="font-mono text-xs mt-1">
                        <span className="text-system-green">P:{Math.round(log.protein)}g</span>
                        <span className="text-yellow-500 ml-2">C:{Math.round(log.carbs)}g</span>
                        <span className="text-orange-400 ml-2">F:{Math.round(log.fats)}g</span>
                        <span className="text-system-blue ml-2">{Math.round(log.calories)}kcal</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(log._id)}
                      className="text-slate-600 hover:text-red-400 transition-colors font-mono text-xs ml-2"
                    >
                      ✕
                    </button>
                  </motion.div>
                ))}

                {/* Totals row */}
                <div className="border-t border-system-border pt-3 mt-3">
                  <div className="font-mono text-xs">
                    <div className="text-slate-400 mb-1 tracking-widest">DAILY TOTALS</div>
                    <span className="text-system-green">P:{Math.round(totals.protein)}g</span>
                    <span className="text-yellow-500 ml-3">C:{Math.round(totals.carbs)}g</span>
                    <span className="text-orange-400 ml-3">F:{Math.round(totals.fats)}g</span>
                    <span className="text-system-blue ml-3">{Math.round(totals.calories)}kcal</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Protein food recommendations */}
      <div className="mt-6 system-panel">
        <div className="system-title">💡 HIGH PROTEIN INDIAN FOODS</div>
        <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { name: 'Soya Chunks', protein: '52g/100g', color: '#00ff88' },
            { name: 'Chicken Breast', protein: '31g/100g', color: '#3d9fff' },
            { name: 'Paneer', protein: '18g/100g', color: '#ffd700' },
            { name: 'Eggs', protein: '13g/100g', color: '#ff6600' },
            { name: 'Dal (Moong)', protein: '24g/100g', color: '#00d4ff' },
            { name: 'Curd', protein: '11g/100g', color: '#8b5cf6' },
            { name: 'Peanuts', protein: '26g/100g', color: '#ff6600' },
            { name: 'Whey Protein', protein: '75g/100g', color: '#00ff88' },
          ].map((food, i) => (
            <div key={i} className="p-3 border border-system-border text-center">
              <div className="font-system text-sm text-white">{food.name}</div>
              <div className="font-mono text-xs mt-1" style={{ color: food.color }}>
                {food.protein} PROTEIN
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NutritionPage;
