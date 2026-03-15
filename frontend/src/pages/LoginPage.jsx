// =============================================
// LOGIN PAGE
// =============================================

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(formData.email, formData.password);
      toast.success('SYSTEM ACCESS GRANTED');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-system-black bg-grid flex items-center justify-center p-4">
      {/* Background glow effect */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-system-purple opacity-5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="font-mono text-system-cyan text-xs tracking-widest mb-2 opacity-60">
              ◈ SOLO FITNESS SYSTEM ◈
            </div>
            <h1 className="font-mono text-4xl font-bold text-white tracking-wider">
              LEVEL<span className="text-system-cyan text-glow-cyan">UP</span>
            </h1>
            <div className="font-mono text-slate-500 text-xs tracking-widest mt-1">
              HUNTER AUTHENTICATION REQUIRED
            </div>
          </motion.div>
        </div>

        {/* Login form panel */}
        <div className="system-panel p-8">
          <div className="system-title mb-6">SYSTEM LOGIN</div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 tracking-widest mb-1">
                EMAIL ADDRESS
              </label>
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
              <label className="block text-xs font-mono text-slate-400 tracking-widest mb-1">
                PASSWORD
              </label>
              <input
                type="password"
                className="input-system"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="btn-system w-full py-3 text-center"
              >
                {loading ? 'AUTHENTICATING...' : '⚡ ACCESS SYSTEM'}
              </button>
            </div>
          </form>

          <div className="divider-system mt-6" />

          <div className="text-center">
            <span className="text-slate-500 font-mono text-xs">NEW HUNTER? </span>
            <Link to="/register" className="text-system-cyan font-mono text-xs hover:text-glow-cyan transition-all">
              REGISTER →
            </Link>
          </div>
        </div>

        {/* Demo credentials hint */}
        <div className="mt-4 text-center">
          <div className="system-notification text-slate-500">
            <span className="text-system-cyan">TIP:</span> Start your journey by registering a new account
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
