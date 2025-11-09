import express from 'express'
import CardModel from '../models/CardModel.js'
import UserModel from '../models/UserModel.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

// Get all cards
router.get('/', async (req, res) => {
  try {
    const cards = await CardModel.findAll()
    res.json(cards)
  } catch (error) {
    console.error('Get cards error:', error)
    res.status(500).json({ message: 'Failed to fetch cards' })
  }
})

// Get user's cards
router.get('/user', authMiddleware, async (req, res) => {
  try {
    const cards = await CardModel.getUserCards(req.userId)
    res.json(cards)
  } catch (error) {
    console.error('Get user cards error:', error)
    res.status(500).json({ message: 'Failed to fetch user cards' })
  }
})

// Get card by ID
router.get('/:id', async (req, res) => {
  try {
    const card = await CardModel.findById(req.params.id)
    if (!card) {
      return res.status(404).json({ message: 'Card not found' })
    }
    res.json(card)
  } catch (error) {
    console.error('Get card error:', error)
    res.status(500).json({ message: 'Failed to fetch card' })
  }
})

// Upgrade card
router.post('/:id/upgrade', authMiddleware, async (req, res) => {
  try {
    const cardId = req.params.id
    const userId = req.userId

    // Get user's card
    const userCards = await CardModel.getUserCards(userId)
    const userCard = userCards.find(uc => uc.card.id == cardId)

    if (!userCard) {
      return res.status(404).json({ message: 'Card not found in collection' })
    }

    // Calculate upgrade cost
    const upgradeCost = 100 * userCard.level
    const cardsNeeded = 5 * userCard.level

    // Check if user has enough resources
    const user = await UserModel.findById(userId)
    if (user.gold < upgradeCost) {
      return res.status(400).json({ message: 'Not enough gold' })
    }

    if (userCard.quantity < cardsNeeded) {
      return res.status(400).json({ message: `Need ${cardsNeeded} cards to upgrade` })
    }

    // Upgrade card
    const upgraded = await CardModel.upgradeCard(userId, cardId)
    
    // Deduct gold
    await UserModel.updateCurrency(userId, -upgradeCost, 0)

    res.json(upgraded)
  } catch (error) {
    console.error('Upgrade card error:', error)
    res.status(500).json({ message: 'Failed to upgrade card' })
  }
})

export default router

