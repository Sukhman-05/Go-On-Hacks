import { create } from 'zustand'
import api from '../services/api'

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const response = await api.post('/auth/login', { email, password })
      const { token, user } = response.data
      localStorage.setItem('token', token)
      set({ user, token, isAuthenticated: true, loading: false })
      return true
    } catch (error) {
      set({ error: error.response?.data?.message || 'Login failed', loading: false })
      return false
    }
  },

  register: async (username, email, password) => {
    set({ loading: true, error: null })
    try {
      const response = await api.post('/auth/register', { username, email, password })
      const { token, user } = response.data
      localStorage.setItem('token', token)
      set({ user, token, isAuthenticated: true, loading: false })
      return true
    } catch (error) {
      set({ error: error.response?.data?.message || 'Registration failed', loading: false })
      return false
    }
  },

  logout: () => {
    localStorage.removeItem('token')
    set({ user: null, token: null, isAuthenticated: false })
  },

  fetchUser: async () => {
    try {
      const response = await api.get('/auth/me')
      set({ user: response.data })
    } catch (error) {
      console.error('Failed to fetch user', error)
      set({ user: null, token: null, isAuthenticated: false })
      localStorage.removeItem('token')
    }
  },
}))

export default useAuthStore

