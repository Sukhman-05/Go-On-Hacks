import { create } from 'zustand'
import api from '../services/api'

const useCardStore = create((set) => ({
  cards: [],
  userCards: [],
  decks: [],
  selectedDeck: null,
  loading: false,
  error: null,

  fetchCards: async () => {
    set({ loading: true, error: null })
    try {
      const response = await api.get('/cards')
      set({ cards: response.data, loading: false })
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch cards', loading: false })
    }
  },

  fetchUserCards: async () => {
    set({ loading: true, error: null })
    try {
      const response = await api.get('/cards/user')
      set({ userCards: response.data, loading: false })
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch user cards', loading: false })
    }
  },

  fetchDecks: async () => {
    set({ loading: true, error: null })
    try {
      const response = await api.get('/decks')
      set({ decks: response.data, loading: false })
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch decks', loading: false })
    }
  },

  createDeck: async (name, cardIds) => {
    set({ loading: true, error: null })
    try {
      const response = await api.post('/decks', { name, cards: cardIds })
      set((state) => ({ 
        decks: [...state.decks, response.data], 
        loading: false 
      }))
      return response.data
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to create deck', loading: false })
      return null
    }
  },

  updateDeck: async (deckId, updates) => {
    set({ loading: true, error: null })
    try {
      const response = await api.put(`/decks/${deckId}`, updates)
      set((state) => ({ 
        decks: state.decks.map(d => d.id === deckId ? response.data : d), 
        loading: false 
      }))
      return response.data
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to update deck', loading: false })
      return null
    }
  },

  deleteDeck: async (deckId) => {
    set({ loading: true, error: null })
    try {
      await api.delete(`/decks/${deckId}`)
      set((state) => ({ 
        decks: state.decks.filter(d => d.id !== deckId), 
        loading: false 
      }))
      return true
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to delete deck', loading: false })
      return false
    }
  },

  selectDeck: (deck) => set({ selectedDeck: deck }),

  upgradeCard: async (cardId) => {
    set({ loading: true, error: null })
    try {
      const response = await api.post(`/cards/${cardId}/upgrade`)
      set((state) => ({
        userCards: state.userCards.map(c => c.id === cardId ? response.data : c),
        loading: false
      }))
      return response.data
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to upgrade card', loading: false })
      return null
    }
  },
}))

export default useCardStore

