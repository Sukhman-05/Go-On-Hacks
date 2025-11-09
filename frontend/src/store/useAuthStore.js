import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      
      setAuth: (user, token) => set({ user, token }),
      
      updateBalance: (balance) => set((state) => ({
        user: state.user ? { ...state.user, wallet_balance: balance } : null
      })),
      
      logout: () => set({ user: null, token: null })
    }),
    {
      name: 'auth-storage'
    }
  )
);

