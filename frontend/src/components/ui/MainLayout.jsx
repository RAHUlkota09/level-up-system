// =============================================
// MAIN LAYOUT - Sidebar + Content Area
// =============================================
// The shell that wraps all protected pages

import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';

// Nav item component
const NavItem = ({ to, icon, label, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-3 transition-all duration-200 border-l-2 group ${
        isActive
          ? 'border-system-cyan bg-system-cyan bg-opacity-5 text-system-cyan'
          : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-system-purple hover:bg-system-purple hover:bg-opacity-5'
      }`
    }
  >
    <span className="text-lg">{icon}</span>
    <span className="font-mono text-xs tracking-widest uppercase">{label}</span>
  </NavLink>
);

const MainLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', icon: '⬡', label: 'Dashboard' },
    { to: '/missions', icon: '⚔', label: 'Missions' },
    { to: '/nutrition', icon: '◈', label: 'Nutrition' },
    { to: '/stats', icon: '◆', label: 'Stats' },
    { to: '/profile', icon: '◉', label: 'Profile' },
  ];

  return (
    <div className="min-h-screen bg-system-black bg-grid flex">

      {/* ---- SIDEBAR (desktop) ---- */}
      <aside className="hidden md:flex flex-col w-60 bg-system-dark border-r border-system-border flex-shrink-0">

        {/* Logo / Title area */}
        <div className="p-6 border-b border-system-border">
          <div className="font-mono text-xs text-system-cyan tracking-widest opacity-60 mb-1">
            SYSTEM ONLINE
          </div>
          <h1 className="font-mono text-lg text-white tracking-wider font-bold">
            LEVEL<span className="text-system-cyan">UP</span>
          </h1>
          <div className="text-xs text-slate-500 font-system tracking-widest mt-0.5">
            SOLO FITNESS SYSTEM
          </div>
        </div>

        {/* User info */}
        <div className="px-4 py-3 border-b border-system-border">
          <div className="flex items-center gap-3">
            {/* Rank hex badge */}
            <div className="hexagon w-10 h-10 bg-system-panel border border-system-purple flex items-center justify-center">
              <span className="font-mono text-system-cyan text-sm font-bold">
                {user?.rank || 'E'}
              </span>
            </div>
            <div>
              <div className="text-white font-system font-semibold text-sm">
                {user?.username || 'HUNTER'}
              </div>
              <div className="text-system-purple text-xs font-mono">
                LVL {user?.level || 1}
              </div>
            </div>
          </div>
          {/* Mini XP bar */}
          <div className="mt-2">
            <div className="xp-bar">
              <div
                className="xp-bar-fill"
                style={{ width: `${Math.min(100, ((user?.currentXP || 0) / ((user?.level || 1) * 100 + (user?.level - 1 || 0) * 50)) * 100)}%` }}
              />
            </div>
            <div className="text-slate-600 text-xs font-mono mt-1">
              {user?.currentXP || 0} XP
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4">
          {navItems.map(item => (
            <NavItem key={item.to} {...item} />
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-system-border">
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 font-mono text-xs tracking-widest text-slate-500 hover:text-red-400 transition-colors border border-transparent hover:border-red-900 uppercase"
          >
            ⏻ LOGOUT
          </button>
        </div>
      </aside>

      {/* ---- MOBILE HEADER ---- */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-system-dark border-b border-system-border px-4 py-3 flex items-center justify-between">
        <div className="font-mono text-white font-bold tracking-wider">
          LEVEL<span className="text-system-cyan">UP</span>
          <span className="text-system-purple text-xs ml-2">LVL {user?.level || 1}</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-system-cyan text-xl"
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* ---- MOBILE MENU OVERLAY ---- */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.25 }}
            className="md:hidden fixed inset-0 z-40 bg-system-dark pt-16"
          >
            <nav className="py-4">
              {navItems.map(item => (
                <NavItem
                  key={item.to}
                  {...item}
                  onClick={() => setMobileMenuOpen(false)}
                />
              ))}
            </nav>
            <div className="p-4">
              <button
                onClick={handleLogout}
                className="text-red-400 font-mono text-xs tracking-widest"
              >
                ⏻ LOGOUT
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---- MAIN CONTENT ---- */}
      <main className="flex-1 overflow-auto md:pt-0 pt-14">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
