import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const register = async (username, email, password) => {
  const response = await api.post('/auth/register', { username, email, password });
  return response.data;
};

// User APIs
export const getProfile = async () => {
  const response = await api.get('/api/user/profile');
  return response.data;
};

export const getRacers = async () => {
  const response = await api.get('/api/user/racers');
  return response.data;
};

export const getBalance = async () => {
  const response = await api.get('/api/user/balance');
  return response.data;
};

export const getTransactions = async (limit = 50) => {
  const response = await api.get(`/api/user/transactions?limit=${limit}`);
  return response.data;
};

// Summon APIs
export const summonRacer = async () => {
  const response = await api.post('/api/summon');
  return response.data;
};

export const getSummonCost = async () => {
  const response = await api.get('/api/summon/cost');
  return response.data;
};

// Race APIs
export const startPvERace = async (racerId, betAmount = 0) => {
  const response = await api.post('/api/race/pve', { racerId, betAmount });
  return response.data;
};

export const getRace = async (raceId) => {
  const response = await api.get(`/api/race/${raceId}`);
  return response.data;
};

export const getRaceHistory = async (limit = 10) => {
  const response = await api.get(`/api/race/history/me?limit=${limit}`);
  return response.data;
};

// Bet APIs
export const placeBet = async (raceId, racerId, amount) => {
  const response = await api.post('/api/bet', { raceId, racerId, amount });
  return response.data;
};

export const getBetHistory = async (limit = 20) => {
  const response = await api.get(`/api/bet/history?limit=${limit}`);
  return response.data;
};

// Evolution APIs
export const evolveRacer = async (racerId) => {
  const response = await api.post(`/api/evolve/${racerId}`);
  return response.data;
};

export const getEvolutionProgress = async (racerId) => {
  const response = await api.get(`/api/evolve/${racerId}/progress`);
  return response.data;
};

export const breedRacer = async (racerId) => {
  const response = await api.post(`/api/evolve/${racerId}/breed`);
  return response.data;
};

// Leaderboard APIs
export const getLeaderboard = async (limit = 10) => {
  const response = await api.get(`/api/leaderboard?limit=${limit}`);
  return response.data;
};

export default api;

