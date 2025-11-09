const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const RacerModel = require('../models/RacerModel');
const { evolveRacer, breedRacer, getEvolutionProgress } = require('../services/evolutionService');

const router = express.Router();

/**
 * POST /api/evolve/:racerId
 * Evolve a racer into AI Avatar
 */
router.post('/:racerId', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const racerId = parseInt(req.params.racerId);

    // Check ownership
    const ownsRacer = await RacerModel.belongsToUser(racerId, userId);
    if (!ownsRacer) {
      return res.status(403).json({ error: 'You do not own this racer' });
    }

    // Evolve racer
    const evolution = await evolveRacer(racerId);

    res.json({
      message: 'Evolution complete!',
      evolution
    });
  } catch (error) {
    console.error('Evolution error:', error);
    
    if (error.message.startsWith('Cannot evolve:')) {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Failed to evolve racer' });
  }
});

/**
 * GET /api/evolve/:racerId/progress
 * Get evolution progress for a racer
 */
router.get('/:racerId/progress', authMiddleware, async (req, res) => {
  try {
    const racerId = parseInt(req.params.racerId);
    const progress = await getEvolutionProgress(racerId);

    res.json({ progress });
  } catch (error) {
    console.error('Evolution progress error:', error);
    res.status(500).json({ error: 'Failed to get evolution progress' });
  }
});

/**
 * POST /api/evolve/:racerId/breed
 * Breed an evolved racer to create offspring
 */
router.post('/:racerId/breed', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const racerId = parseInt(req.params.racerId);

    // Breed racer
    const offspring = await breedRacer(racerId, userId);

    res.json({
      message: 'Offspring created!',
      offspring: {
        id: offspring.id,
        name: offspring.name,
        stats: offspring.stats,
        rarity: offspring.rarity,
        generation: offspring.generation,
        parentId: offspring.parent_id
      }
    });
  } catch (error) {
    console.error('Breeding error:', error);
    
    if (error.message === 'Only evolved racers can breed') {
      return res.status(400).json({ error: error.message });
    }
    
    if (error.message === 'You do not own this racer') {
      return res.status(403).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Failed to breed racer' });
  }
});

module.exports = router;

