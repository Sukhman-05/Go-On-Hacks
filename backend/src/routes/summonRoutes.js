const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const RacerModel = require('../models/RacerModel');
const { performGachaPull, getGachaCost } = require('../services/gachaService');
const { processSummonPayment } = require('../services/economyService');

const router = express.Router();

/**
 * POST /api/summon
 * Perform a gacha pull to summon a new racer
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { pullCount = 1 } = req.body;

    // Validate pull count
    if (pullCount !== 1 && pullCount !== 10) {
      return res.status(400).json({ error: 'Pull count must be 1 or 10' });
    }

    const cost = getGachaCost(pullCount);

    // Perform gacha pull
    const pull = performGachaPull();

    // Create racer in database
    const racer = await RacerModel.create(
      userId,
      pull.name,
      pull.stats,
      pull.rarity
    );

    // Process payment
    await processSummonPayment(userId, racer.id);

    res.json({
      message: 'Racer summoned successfully!',
      racer: {
        id: racer.id,
        name: racer.name,
        stats: racer.stats,
        rarity: racer.rarity,
        xp: racer.xp,
        generation: racer.generation
      },
      cost
    });
  } catch (error) {
    console.error('Summon error:', error);
    
    if (error.message === 'Insufficient balance') {
      return res.status(400).json({ error: 'Insufficient DNA Credits' });
    }
    
    res.status(500).json({ error: 'Failed to summon racer' });
  }
});

/**
 * GET /api/summon/cost
 * Get summon cost
 */
router.get('/cost', authMiddleware, (req, res) => {
  res.json({
    single: getGachaCost(1),
    ten: getGachaCost(10)
  });
});

module.exports = router;

