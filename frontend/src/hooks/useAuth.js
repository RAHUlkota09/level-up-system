// =============================================
// AUTH CONTEXT
// =============================================
// Global state management for authentication
// Wrap your app in this provider to access user data anywhere

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // True while checking stored token

  // ---- CHECK FOR STORED TOKEN ON APP START ----
  useEffect(() => {
    const checkStoredAuth = async () => {
      const token = localStorage.getItem('levelup_token');
      const storedUser = localStorage.getItem('levelup_user');

      if (token && storedUser) {
        try {
          // Verify token is still valid by fetching current user
          const response = await authAPI.getMe();
          setUser(response.data.user);
        } catch (error) {
          // Token invalid - clear storage
          localStorage.removeItem('levelup_token');
          localStorage.removeItem('levelup_user');
        }
      }
      setLoading(false);
    };

    checkStoredAuth();
  }, []);

  // ---- LOGIN ----
  const login = async (email, password) => {
    const response = await authAPI.login({ email, password });
    const { token, user: userData } = response.data;

    localStorage.setItem('levelup_token', token);
    localStorage.setItem('levelup_user', JSON.stringify(userData));
    setUser(userData);

    return response.data;
  };

  // ---- REGISTER ----
  const register = async (userData) => {
    const response = await authAPI.register(userData);
    const { token, user: newUser } = response.data;

    localStorage.setItem('levelup_token', token);
    localStorage.setItem('levelup_user', JSON.stringify(newUser));
    setUser(newUser);

    return response.data;
  };

  // ---- LOGOUT ----
  const logout = () => {
    localStorage.removeItem('levelup_token');
    localStorage.removeItem('levelup_user');
    setUser(null);
  };

  // ---- UPDATE USER DATA ----
  // Call this after profile updates to sync state
  const updateUser = (updatedData) => {
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    localStorage.setItem('levelup_user', JSON.stringify(newUser));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for easy access
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
