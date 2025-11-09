const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const UserModel = require('../models/UserModel');
const RacerModel = require('../models/RacerModel');
const TransactionModel = require('../models/TransactionModel');

const router = express.Router();

/**
 * GET /api/user/profile
 * Get current user's profile
 */
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get transaction stats
    const earnings = await TransactionModel.getTotalEarnings(userId);

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        wallet_balance: user.wallet_balance,
        created_at: user.created_at,
        stats: {
          totalEarned: earnings?.total_earned || 0,
          totalSpent: earnings?.total_spent || 0
        }
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

/**
 * GET /api/user/racers
 * Get all racers owned by user
 */
router.get('/racers', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const racers = await RacerModel.findByUserId(userId);

    res.json({
      racers: racers.map(racer => ({
        id: racer.id,
        name: racer.name,
        stats: racer.stats,
        rarity: racer.rarity,
        xp: racer.xp,
        generation: racer.generation,
        evolved: racer.evolved,
        parentId: racer.parent_id,
        createdAt: racer.created_at
      }))
    });
  } catch (error) {
    console.error('Racers fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch racers' });
  }
});

/**
 * GET /api/user/transactions
 * Get user's transaction history
 */
router.get('/transactions', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const limit = parseInt(req.query.limit) || 50;
    
    const transactions = await TransactionModel.findByUserId(userId, limit);

    res.json({ transactions });
  } catch (error) {
    console.error('Transactions fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

/**
 * GET /api/user/balance
 * Get user's current balance
 */
router.get('/balance', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const balance = await UserModel.getBalance(userId);

    res.json({ balance });
  } catch (error) {
    console.error('Balance fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch balance' });
  }
});

module.exports = router;

