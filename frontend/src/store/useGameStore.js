import { create } from 'zustand';

export const useGameStore = create((set) => ({
  racers: [],
  selectedRacer: null,
  balance: 0,
  
  setRacers: (racers) => set({ racers }),
  
  addRacer: (racer) => set((state) => ({
    racers: [racer, ...state.racers]
  })),
  
  updateRacer: (racerId, updates) => set((state) => ({
    racers: state.racers.map(racer => 
      racer.id === racerId ? { ...racer, ...updates } : racer
    )
  })),
  
  selectRacer: (racer) => set({ selectedRacer: racer }),
  
  setBalance: (balance) => set({ balance }),
  
  reset: () => set({ racers: [], selectedRacer: null, balance: 0 })
}));

