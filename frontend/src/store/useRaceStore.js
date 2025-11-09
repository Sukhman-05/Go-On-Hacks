import { create } from 'zustand';

export const useRaceStore = create((set) => ({
  currentRace: null,
  raceStatus: 'idle', // idle, waiting, countdown, racing, finished
  frames: [],
  currentFrame: 0,
  winner: null,
  rewards: null,
  
  setCurrentRace: (race) => set({ currentRace: race }),
  
  setRaceStatus: (status) => set({ raceStatus: status }),
  
  setFrames: (frames) => set({ frames, currentFrame: 0 }),
  
  advanceFrame: () => set((state) => {
    if (state.frames.length === 0) return state;
    const nextFrame = Math.min(state.currentFrame + 1, state.frames.length - 1);
    return { currentFrame: nextFrame };
  }),
  
  setWinner: (winner) => set({ winner }),
  
  setRewards: (rewards) => set({ rewards }),
  
  reset: () => set({
    currentRace: null,
    raceStatus: 'idle',
    frames: [],
    currentFrame: 0,
    winner: null,
    rewards: null
  })
}));

