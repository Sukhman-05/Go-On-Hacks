import express from 'express'
import DeckModel from '../models/DeckModel.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

// Get user's decks
router.get('/', authMiddleware, async (req, res) => {
  try {
    const decks = await DeckModel.findByUserId(req.userId)
    res.json(decks)
  } catch (error) {
    console.error('Get decks error:', error)
    res.status(500).json({ message: 'Failed to fetch decks' })
  }
})

// Get deck by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const deck = await DeckModel.findById(req.params.id)
    if (!deck) {
      return res.status(404).json({ message: 'Deck not found' })
    }
    
    if (deck.user_id !== req.userId) {
      return res.status(403).json({ message: 'Access denied' })
    }
    
    res.json(deck)
  } catch (error) {
    console.error('Get deck error:', error)
    res.status(500).json({ message: 'Failed to fetch deck' })
  }
})

// Create deck
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, cards } = req.body

    if (!name || !cards || cards.length !== 8) {
      return res.status(400).json({ message: 'Name and exactly 8 cards are required' })
    }

    const deck = await DeckModel.create(req.userId, name, cards)
    const fullDeck = await DeckModel.findById(deck.id)
    
    res.status(201).json(fullDeck)
  } catch (error) {
    console.error('Create deck error:', error)
    res.status(500).json({ message: 'Failed to create deck' })
  }
})

// Update deck
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, cards } = req.body
    
    const deck = await DeckModel.update(req.params.id, req.userId, {
      name,
      cardIds: cards
    })

    if (!deck) {
      return res.status(404).json({ message: 'Deck not found' })
    }

    const fullDeck = await DeckModel.findById(deck.id)
    res.json(fullDeck)
  } catch (error) {
    console.error('Update deck error:', error)
    res.status(500).json({ message: 'Failed to update deck' })
  }
})

// Delete deck
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const deck = await DeckModel.delete(req.params.id, req.userId)
    
    if (!deck) {
      return res.status(404).json({ message: 'Deck not found' })
    }

    res.json({ message: 'Deck deleted successfully' })
  } catch (error) {
    console.error('Delete deck error:', error)
    res.status(500).json({ message: 'Failed to delete deck' })
  }
})

// Set active deck
router.post('/:id/activate', authMiddleware, async (req, res) => {
  try {
    const deck = await DeckModel.setActive(req.params.id, req.userId)
    
    if (!deck) {
      return res.status(404).json({ message: 'Deck not found' })
    }

    res.json(deck)
  } catch (error) {
    console.error('Activate deck error:', error)
    res.status(500).json({ message: 'Failed to activate deck' })
  }
})

export default router

