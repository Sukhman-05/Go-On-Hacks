import express from 'express'
import UserModel from '../models/UserModel.js'
import MatchModel from '../models/MatchModel.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

// Get user profile
router.get('/:id', async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    res.json(user)
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ message: 'Failed to fetch user' })
  }
})

// Get leaderboard
router.get('/leaderboard/top', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100
    const leaderboard = await UserModel.getLeaderboard(limit)
    res.json(leaderboard)
  } catch (error) {
    console.error('Get leaderboard error:', error)
    res.status(500).json({ message: 'Failed to fetch leaderboard' })
  }
})

// Get match history
router.get('/:id/matches', authMiddleware, async (req, res) => {
  try {
    const userId = parseInt(req.params.id)
    
    if (userId !== req.userId) {
      return res.status(403).json({ message: 'Access denied' })
    }

    const limit = parseInt(req.query.limit) || 20
    const matches = await MatchModel.getMatchHistory(userId, limit)
    
    res.json(matches)
  } catch (error) {
    console.error('Get match history error:', error)
    res.status(500).json({ message: 'Failed to fetch match history' })
  }
})

export default router

