const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const RacerModel = require('../models/RacerModel');
const RaceModel = require('../models/RaceModel');
const { simulateRace, generateAIOpponent, calculateXPReward } = require('../services/raceSimulationService');
const { processPvERaceEntry, distributePvERewards, resolveRaceBets } = require('../services/economyService');
const { generateRaceSeed } = require('../utils/rng');

const router = express.Router();

/**
 * POST /api/race/pve
 * Start a PvE race against AI
 */
router.post('/pve', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { racerId, betAmount } = req.body;

    // Validate racer
    const racer = await RacerModel.findById(racerId);
    if (!racer) {
      return res.status(404).json({ error: 'Racer not found' });
    }

    // Check ownership
    const ownsRacer = await RacerModel.belongsToUser(racerId, userId);
    if (!ownsRacer) {
      return res.status(403).json({ error: 'You do not own this racer' });
    }

    // Generate AI opponent
    const aiOpponent = generateAIOpponent(racer);

    // Generate race seed
    const seed = generateRaceSeed(racer.id, aiOpponent.id);

    // Simulate race
    const raceResult = simulateRace(racer, aiOpponent, seed);

    // Create race record
    const race = await RaceModel.create(
      'pve',
      [
        { racerId: racer.id, racerName: racer.name, userId, isAI: false },
        { racerId: aiOpponent.id, racerName: aiOpponent.name, isAI: true }
      ],
      raceResult,
      raceResult.winner === racer.id ? racer.id : null,
      seed
    );

    // Process entry fee
    await processPvERaceEntry(userId, race.id);

    // Determine if player won
    const playerWon = raceResult.winner === racer.id;

    // Add XP to racer
    const xpGained = calculateXPReward(playerWon, raceResult.timeElapsed, 'pve');
    await RacerModel.addXP(racerId, xpGained);

    // Distribute rewards
    await distributePvERewards(userId, race.id, playerWon);

    // Resolve any bets
    if (betAmount && betAmount > 0) {
      await resolveRaceBets(race.id, raceResult.winner, 'pve');
    }

    res.json({
      message: playerWon ? 'Victory!' : 'Defeated!',
      race: {
        id: race.id,
        winner: raceResult.winner,
        playerWon,
        timeElapsed: raceResult.timeElapsed,
        frames: raceResult.frames,
        finalPositions: raceResult.finalPositions
      },
      rewards: {
        xpGained,
        creditsEarned: playerWon ? 75 : 0
      }
    });
  } catch (error) {
    console.error('PvE race error:', error);
    
    if (error.message === 'Insufficient balance') {
      return res.status(400).json({ error: 'Insufficient DNA Credits for race entry' });
    }
    
    res.status(500).json({ error: 'Failed to start race' });
  }
});

/**
 * GET /api/race/:id
 * Get race details
 */
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const raceId = req.params.id;
    const race = await RaceModel.findById(raceId);

    if (!race) {
      return res.status(404).json({ error: 'Race not found' });
    }

    res.json({ race });
  } catch (error) {
    console.error('Get race error:', error);
    res.status(500).json({ error: 'Failed to fetch race' });
  }
});

/**
 * GET /api/race/history
 * Get user's race history
 */
router.get('/history/me', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const limit = parseInt(req.query.limit) || 10;

    const races = await RaceModel.findByUserId(userId, limit);

    res.json({ races });
  } catch (error) {
    console.error('Race history error:', error);
    res.status(500).json({ error: 'Failed to fetch race history' });
  }
});

module.exports = router;

