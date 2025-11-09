const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const UserModel = require('../models/UserModel');

const router = express.Router();

/**
 * GET /api/leaderboard
 * Get top players by balance and wins
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const leaderboard = await UserModel.getLeaderboard(limit);

    res.json({
      leaderboard: leaderboard.map((user, index) => ({
        rank: index + 1,
        username: user.username,
        balance: user.wallet_balance,
        totalRaces: parseInt(user.total_races) || 0,
        wins: parseInt(user.wins) || 0,
        winRate: parseInt(user.total_races) > 0 
          ? Math.round((parseInt(user.wins) / parseInt(user.total_races)) * 100)
          : 0
      }))
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

module.exports = router;

