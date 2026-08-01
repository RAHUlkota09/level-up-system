// =============================================
// API SERVICE
// =============================================
// Central place for all backend API calls
// Uses axios with automatic JWT token attachment

import axios from 'axios';

// Base URL for all API calls
// Use environment variable if available (for production), otherwise fallback to local development
const API_BASE = process.env.REACT_APP_API_URL || '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

// ---- REQUEST INTERCEPTOR ----
// Automatically attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('levelup_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ---- RESPONSE INTERCEPTOR ----
// Handle 401 errors globally (token expired)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired - clear storage and redirect to login
      localStorage.removeItem('levelup_token');
      localStorage.removeItem('levelup_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// =============================================
// AUTH API
// =============================================
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// =============================================
// MISSIONS API
// =============================================
export const missionsAPI = {
  getToday: () => api.get('/missions/today'),
  complete: (missionId) => api.put(`/missions/${missionId}/complete`),
  updateProgress: (missionId, progress) => api.put(`/missions/${missionId}/progress`, { progress }),
  getHistory: (days = 7) => api.get(`/missions/history?days=${days}`),
  analyze: () => api.post('/missions/analyze'),
};

// =============================================
// NUTRITION API
// =============================================
export const nutritionAPI = {
  searchFoods: (query) => api.get(`/nutrition/foods/search?query=${query}`),
  logFood: (data) => api.post('/nutrition/log', data),
  getToday: () => api.get('/nutrition/today'),
  deleteLog: (logId) => api.delete(`/nutrition/log/${logId}`),
  getHistory: (days = 7) => api.get(`/nutrition/history?days=${days}`),
};

// =============================================
// STATS API
// =============================================
export const statsAPI = {
  getStats: () => api.get('/stats'),
  updateProfile: (profile) => api.put('/stats/profile', { profile }),
  logWeight: (data) => api.post('/stats/weight', data),
  getWeightHistory: (days = 30) => api.get(`/stats/weight/history?days=${days}`),
};

// =============================================
// XP API
// =============================================
export const xpAPI = {
  getHistory: (days = 7) => api.get(`/xp/history?days=${days}`),
};

export default api;
