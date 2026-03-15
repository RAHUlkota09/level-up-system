// =============================================
// APP.JS - Main Application Entry
// =============================================
// Sets up routing and global providers

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './hooks/useAuth';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import MissionsPage from './pages/MissionsPage';
import NutritionPage from './pages/NutritionPage';
import StatsPage from './pages/StatsPage';
import ProfileSetupPage from './pages/ProfileSetupPage';

// Layout
import MainLayout from './components/ui/MainLayout';

import './styles/index.css';

// ---- PROTECTED ROUTE ----
// Redirects to login if not authenticated
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-system-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-system-cyan font-mono text-sm tracking-widest mb-4">
            INITIALIZING SYSTEM...
          </div>
          <div className="w-48 h-1 bg-system-panel mx-auto overflow-hidden">
            <div className="h-full bg-system-cyan animate-pulse" style={{ width: '60%' }} />
          </div>
        </div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
};

// ---- APP ROUTES ----
const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />

      {/* Protected routes wrapped in MainLayout (nav sidebar) */}
      <Route path="/" element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="missions" element={<MissionsPage />} />
        <Route path="nutrition" element={<NutritionPage />} />
        <Route path="stats" element={<StatsPage />} />
        <Route path="profile" element={<ProfileSetupPage />} />
      </Route>

      {/* Catch all - redirect to dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="scanlines">
          <AppRoutes />

          {/* Global toast notifications - styled for system theme */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#0d0d2b',
                color: '#e0e0ff',
                border: '1px solid #1a1a4e',
                fontFamily: 'Share Tech Mono, monospace',
                fontSize: '0.75rem',
                letterSpacing: '1px',
              },
              success: {
                iconTheme: { primary: '#00ff88', secondary: '#0d0d2b' }
              },
              error: {
                iconTheme: { primary: '#ff3333', secondary: '#0d0d2b' }
              }
            }}
          />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
