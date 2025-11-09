import { create } from 'zustand'

const useGameStore = create((set, get) => ({
  // Game state
  gameState: 'idle', // idle, matchmaking, battle, results
  matchId: null,
  opponentId: null,
  
  // Player state
  playerElixir: 5,
  playerTowers: { left: 100, right: 100, king: 100 },
  playerUnits: [],
  
  // Opponent state
  opponentElixir: 5,
  opponentTowers: { left: 100, right: 100, king: 100 },
  opponentUnits: [],
  
  // Match state
  matchTime: 180, // 3 minutes
  isOvertimeActive: false,
  
  // Selected deck
  selectedDeck: null,
  handCards: [],
  
  // Actions
  setGameState: (state) => set({ gameState: state }),
  
  setMatchId: (id) => set({ matchId: id }),
  
  setOpponent: (opponentId) => set({ opponentId }),
  
  updatePlayerElixir: (amount) => set((state) => ({
    playerElixir: Math.min(10, Math.max(0, state.playerElixir + amount))
  })),
  
  updateOpponentElixir: (amount) => set((state) => ({
    opponentElixir: Math.min(10, Math.max(0, state.opponentElixir + amount))
  })),
  
  updateTowerHealth: (side, tower, health) => {
    set((state) => ({
      [side === 'player' ? 'playerTowers' : 'opponentTowers']: {
        ...state[side === 'player' ? 'playerTowers' : 'opponentTowers'],
        [tower]: health
      }
    }))
  },
  
  addUnit: (side, unit) => {
    set((state) => ({
      [side === 'player' ? 'playerUnits' : 'opponentUnits']: [
        ...state[side === 'player' ? 'playerUnits' : 'opponentUnits'],
        unit
      ]
    }))
  },
  
  removeUnit: (side, unitId) => {
    set((state) => ({
      [side === 'player' ? 'playerUnits' : 'opponentUnits']: 
        state[side === 'player' ? 'playerUnits' : 'opponentUnits'].filter(u => u.id !== unitId)
    }))
  },
  
  updateUnit: (side, unitId, updates) => {
    set((state) => ({
      [side === 'player' ? 'playerUnits' : 'opponentUnits']: 
        state[side === 'player' ? 'playerUnits' : 'opponentUnits'].map(u => 
          u.id === unitId ? { ...u, ...updates } : u
        )
    }))
  },
  
  setSelectedDeck: (deck) => set({ selectedDeck: deck }),
  
  setHandCards: (cards) => set({ handCards: cards }),
  
  updateMatchTime: (time) => set({ matchTime: time }),
  
  setOvertimeActive: (active) => set({ isOvertimeActive: active }),
  
  resetBattle: () => set({
    playerElixir: 5,
    playerTowers: { left: 100, right: 100, king: 100 },
    playerUnits: [],
    opponentElixir: 5,
    opponentTowers: { left: 100, right: 100, king: 100 },
    opponentUnits: [],
    matchTime: 180,
    isOvertimeActive: false,
    handCards: [],
  }),
}))

export default useGameStore

