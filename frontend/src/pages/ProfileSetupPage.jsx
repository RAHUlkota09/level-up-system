// =============================================
// PROFILE SETUP PAGE
// =============================================

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { statsAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';

const ProfileSetupPage = () => {
  const { user, updateUser } = useAuth();
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState({
    name: user?.profile?.name || '',
    age: user?.profile?.age || '',
    gender: user?.profile?.gender || 'male',
    height: user?.profile?.height || '',
    weight: user?.profile?.weight || '',
    activityLevel: user?.profile?.activityLevel || 'moderate',
    goal: user?.profile?.goal || 'muscle_gain',
  });

  const handleChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await statsAPI.updateProfile({
        ...profile,
        age: parseInt(profile.age),
        height: parseFloat(profile.height),
        weight: parseFloat(profile.weight),
      });

      updateUser({ profile: res.data.profile, targets: res.data.targets });
      toast.success('PROFILE UPDATED. TARGETS RECALCULATED.');
    } catch (error) {
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="mb-6">
        <div className="font-mono text-xs text-slate-500 tracking-widest mb-1">◉ HUNTER PROFILE ◉</div>
        <h1 className="font-system text-3xl font-bold text-white">PROFILE SETTINGS</h1>
      </div>

      <div className="max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="system-panel"
        >
          <div className="system-title">◆ PHYSICAL PARAMETERS</div>
          <form onSubmit={handleSave} className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>
                <label className="block text-xs font-mono text-slate-400 tracking-widest mb-1">FULL NAME</label>
                <input
                  type="text"
                  className="input-system"
                  value={profile.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 tracking-widest mb-1">AGE (years)</label>
                <input
                  type="number"
                  className="input-system"
                  value={profile.age}
                  onChange={(e) => handleChange('age', e.target.value)}
                  min="15" max="80"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 tracking-widest mb-1">HEIGHT (cm)</label>
                <input
                  type="number"
                  className="input-system"
                  value={profile.height}
                  onChange={(e) => handleChange('height', e.target.value)}
                  min="100" max="250"
                  placeholder="175"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 tracking-widest mb-1">CURRENT WEIGHT (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  className="input-system"
                  value={profile.weight}
                  onChange={(e) => handleChange('weight', e.target.value)}
                  min="30" max="300"
                  placeholder="70"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 tracking-widest mb-1">GENDER</label>
                <select
                  className="input-system"
                  value={profile.gender}
                  onChange={(e) => handleChange('gender', e.target.value)}
                >
                  <option value="male">MALE</option>
                  <option value="female">FEMALE</option>
                  <option value="other">OTHER</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 tracking-widest mb-1">ACTIVITY LEVEL</label>
                <select
                  className="input-system"
                  value={profile.activityLevel}
                  onChange={(e) => handleChange('activityLevel', e.target.value)}
                >
                  <option value="sedentary">SEDENTARY — Desk job, no exercise</option>
                  <option value="light">LIGHT — 1-3 days/week</option>
                  <option value="moderate">MODERATE — 3-5 days/week</option>
                  <option value="active">ACTIVE — 6-7 days/week</option>
                  <option value="very_active">VERY ACTIVE — Athlete/Physical job</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 tracking-widest mb-2">PRIMARY GOAL</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'fat_loss', label: 'FAT LOSS', desc: '-500 kcal deficit', color: '#ff3333' },
                  { value: 'muscle_gain', label: 'MUSCLE GAIN', desc: '+300 kcal surplus', color: '#00ff88' },
                  { value: 'maintenance', label: 'MAINTENANCE', desc: 'TDEE calories', color: '#3d9fff' },
                ].map(({ value, label, desc, color }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleChange('goal', value)}
                    className={`p-3 border transition-all text-left ${
                      profile.goal === value
                        ? 'border-opacity-100 bg-opacity-10'
                        : 'border-system-border'
                    }`}
                    style={{
                      borderColor: profile.goal === value ? color : undefined,
                      backgroundColor: profile.goal === value ? `${color}15` : undefined
                    }}
                  >
                    <div className="font-mono text-xs font-bold" style={{ color: profile.goal === value ? color : '#e0e0ff' }}>
                      {label}
                    </div>
                    <div className="font-mono text-xs text-slate-500 mt-1">{desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="btn-system-green btn-system w-full py-3 mt-2"
            >
              {saving ? 'SAVING...' : '⚡ SAVE PROFILE & RECALCULATE TARGETS'}
            </button>
          </form>
        </motion.div>

        {/* Info about what gets recalculated */}
        <div className="mt-4 system-notification info">
          <div className="font-mono text-xs font-bold text-system-cyan mb-1">SYSTEM INFO</div>
          <div className="text-slate-400 text-xs">
            When you update your profile, the system automatically recalculates your daily calorie needs
            (BMR × Activity), protein target (2g/kg bodyweight), and all macro targets.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetupPage;
