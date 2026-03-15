// =============================================
// REGISTER PAGE
// =============================================

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // Multi-step form: 1=account, 2=physical profile

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    profile: {
      name: '',
      age: '',
      gender: 'male',
      height: '',
      weight: '',
      activityLevel: 'moderate',
      goal: 'muscle_gain'
    }
  });

  const updateProfile = (field, value) => {
    setFormData(prev => ({
      ...prev,
      profile: { ...prev.profile, [field]: value }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register({
        ...formData,
        profile: {
          ...formData.profile,
          age: parseInt(formData.profile.age),
          height: parseFloat(formData.profile.height),
          weight: parseFloat(formData.profile.weight),
        }
      });
      toast.success('HUNTER REGISTERED. WELCOME TO THE SYSTEM.');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-system-black bg-grid flex items-center justify-center p-4">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-system-purple opacity-5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <div className="text-center mb-6">
          <div className="font-mono text-system-cyan text-xs tracking-widest mb-2 opacity-60">
            ◈ HUNTER REGISTRATION ◈
          </div>
          <h1 className="font-mono text-3xl font-bold text-white">
            LEVEL<span className="text-system-cyan">UP</span>
          </h1>
        </div>

        <div className="system-panel p-8">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            {[1, 2].map(s => (
              <React.Fragment key={s}>
                <div className={`flex items-center justify-center w-6 h-6 font-mono text-xs border ${
                  step >= s ? 'border-system-cyan text-system-cyan' : 'border-slate-700 text-slate-600'
                }`}>
                  {s}
                </div>
                {s < 2 && (
                  <div className={`flex-1 h-px ${step > s ? 'bg-system-cyan' : 'bg-slate-700'}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          <form onSubmit={step === 1 ? (e) => { e.preventDefault(); setStep(2); } : handleSubmit}>
            {step === 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="system-title mb-4">ACCOUNT CREDENTIALS</div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 tracking-widest mb-1">HUNTER NAME</label>
                  <input
                    type="text"
                    className="input-system"
                    placeholder="SungJinWoo"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 tracking-widest mb-1">EMAIL</label>
                  <input
                    type="email"
                    className="input-system"
                    placeholder="hunter@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 tracking-widest mb-1">PASSWORD</label>
                  <input
                    type="password"
                    className="input-system"
                    placeholder="Min 6 characters"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    minLength={6}
                    required
                  />
                </div>
                <button type="submit" className="btn-system w-full py-3 mt-2">
                  NEXT: PHYSICAL STATS →
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="system-title mb-4">PHYSICAL PROFILE</div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-400 tracking-widest mb-1">FULL NAME</label>
                    <input
                      type="text"
                      className="input-system"
                      placeholder="Your name"
                      value={formData.profile.name}
                      onChange={(e) => updateProfile('name', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-slate-400 tracking-widest mb-1">AGE</label>
                    <input
                      type="number"
                      className="input-system"
                      placeholder="25"
                      value={formData.profile.age}
                      onChange={(e) => updateProfile('age', e.target.value)}
                      min="15" max="80"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-slate-400 tracking-widest mb-1">HEIGHT (cm)</label>
                    <input
                      type="number"
                      className="input-system"
                      placeholder="175"
                      value={formData.profile.height}
                      onChange={(e) => updateProfile('height', e.target.value)}
                      min="100" max="250"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-slate-400 tracking-widest mb-1">WEIGHT (kg)</label>
                    <input
                      type="number"
                      className="input-system"
                      placeholder="70"
                      value={formData.profile.weight}
                      onChange={(e) => updateProfile('weight', e.target.value)}
                      min="30" max="300"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 tracking-widest mb-1">GENDER</label>
                  <select
                    className="input-system"
                    value={formData.profile.gender}
                    onChange={(e) => updateProfile('gender', e.target.value)}
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
                    value={formData.profile.activityLevel}
                    onChange={(e) => updateProfile('activityLevel', e.target.value)}
                  >
                    <option value="sedentary">SEDENTARY (Desk job, no exercise)</option>
                    <option value="light">LIGHT (1-3 days/week)</option>
                    <option value="moderate">MODERATE (3-5 days/week)</option>
                    <option value="active">ACTIVE (6-7 days/week)</option>
                    <option value="very_active">VERY ACTIVE (Athlete)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 tracking-widest mb-1">PRIMARY GOAL</label>
                  <select
                    className="input-system"
                    value={formData.profile.goal}
                    onChange={(e) => updateProfile('goal', e.target.value)}
                  >
                    <option value="muscle_gain">MUSCLE GAIN (Bulk)</option>
                    <option value="fat_loss">FAT LOSS (Cut)</option>
                    <option value="maintenance">MAINTENANCE (Recomp)</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="btn-system px-4 py-3"
                  >
                    ← BACK
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-system-green btn-system flex-1 py-3"
                  >
                    {loading ? 'REGISTERING...' : '⚡ ENTER THE SYSTEM'}
                  </button>
                </div>
              </motion.div>
            )}
          </form>

          <div className="divider-system mt-6" />
          <div className="text-center">
            <span className="text-slate-500 font-mono text-xs">ALREADY A HUNTER? </span>
            <Link to="/login" className="text-system-cyan font-mono text-xs">LOGIN →</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
