const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const BetModel = require('../models/BetModel');
const { placeBet } = require('../services/economyService');

const router = express.Router();

/**
 * POST /api/bet
 * Place a bet on a racer
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { raceId, racerId, amount } = req.body;

    // Validation
    if (!raceId || !racerId || !amount) {
      return res.status(400).json({ error: 'Race ID, racer ID, and amount are required' });
    }

    if (amount < 10 || amount > 1000) {
      return res.status(400).json({ error: 'Bet amount must be between 10 and 1000' });
    }

    // Place bet
    const bet = await placeBet(userId, raceId, racerId, amount);

    res.json({
      message: 'Bet placed successfully',
      bet: {
        id: bet.id,
        amount: bet.amount,
        racerId: bet.racer_id
      }
    });
  } catch (error) {
    console.error('Bet placement error:', error);
    
    if (error.message === 'Insufficient balance for bet') {
      return res.status(400).json({ error: 'Insufficient DNA Credits' });
    }
    
    res.status(500).json({ error: 'Failed to place bet' });
  }
});

/**
 * GET /api/bet/history
 * Get user's betting history
 */
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const limit = parseInt(req.query.limit) || 20;

    const bets = await BetModel.findByUserId(userId, limit);

    res.json({ bets });
  } catch (error) {
    console.error('Bet history error:', error);
    res.status(500).json({ error: 'Failed to fetch betting history' });
  }
});

/**
 * GET /api/bet/race/:raceId
 * Get bets for a specific race
 */
router.get('/race/:raceId', authMiddleware, async (req, res) => {
  try {
    const raceId = req.params.raceId;
    const bets = await BetModel.findByRaceId(raceId);

    res.json({ bets });
  } catch (error) {
    console.error('Race bets error:', error);
    res.status(500).json({ error: 'Failed to fetch race bets' });
  }
});

module.exports = router;

