import express from 'express'
import jwt from 'jsonwebtoken'
import UserModel from '../models/UserModel.js'
import CardModel from '../models/CardModel.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }

    // Check if user exists
    const existingUser = await UserModel.findByEmail(email)
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' })
    }

    // Create user
    const user = await UserModel.create(username, email, password)

    // Give starter cards to new user - all common cards plus some rares
    const allCards = await CardModel.findAll()
    const commonCards = allCards.filter(c => c.rarity === 'common')
    const rareCards = allCards.filter(c => c.rarity === 'rare')
    
    // Give all common cards (quantity 10 each)
    for (const card of commonCards) {
      await CardModel.addCardToUser(user.id, card.id, 10)
    }
    
    // Give some rare cards (quantity 5 each)
    for (const card of rareCards.slice(0, 5)) {
      await CardModel.addCardToUser(user.id, card.id, 5)
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION || '7d' }
    )

    res.status(201).json({ token, user })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ message: 'Registration failed' })
  }
})

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const user = await UserModel.verifyPassword(email, password)
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION || '7d' }
    )

    res.json({ token, user })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Login failed' })
  }
})

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    res.json(user)
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ message: 'Failed to fetch user' })
  }
})

export default router

