const { createSeededRNG, randomFloat } = require('../utils/rng');

const RACE_DISTANCE = 1000; // meters
const RACE_DURATION = 60; // seconds
const FRAMES_PER_SECOND = 1; // Update frequency

/**
 * Simulate a race between two racers
 * Returns detailed frame-by-frame positions for visualization
 */
function simulateRace(racer1, racer2, seed) {
  const rng = createSeededRNG(seed);
  
  // Initialize racer states
  const racerStates = [
    {
      id: racer1.id,
      name: racer1.name,
      stats: racer1.stats,
      position: 0,
      stamina: 100,
      velocity: 0
    },
    {
      id: racer2.id,
      name: racer2.name,
      stats: racer2.stats,
      position: 0,
      stamina: 100,
      velocity: 0
    }
  ];

  const frames = [];
  let winner = null;
  let timeElapsed = 0;

  // Simulate race frame by frame
  for (let frame = 0; frame <= RACE_DURATION && !winner; frame++) {
    const dt = 1; // 1 second per frame
    timeElapsed = frame;

    racerStates.forEach(racer => {
      if (racer.position >= RACE_DISTANCE) return;

      // Calculate velocity based on stats
      const baseSpeed = racer.stats.speed * 0.4;
      const agility = racer.stats.motility * 0.2;
      const staminaFactor = racer.stamina / 100;
      
      // Calculate current velocity
      racer.velocity = (baseSpeed + agility) * staminaFactor;

      // Apply luck-based random events
      if (randomFloat(0, 100, rng) < racer.stats.luck) {
        // Lucky boost!
        racer.velocity *= randomFloat(1.1, 1.3, rng);
      } else if (randomFloat(0, 100, rng) < (10 - racer.stats.luck / 10)) {
        // Unlucky slowdown
        racer.velocity *= randomFloat(0.8, 0.95, rng);
      }

      // Update position
      racer.position += racer.velocity * dt;

      // Deplete stamina based on endurance
      const staminaDrain = (100 - racer.stats.endurance) * 0.1 * dt;
      racer.stamina = Math.max(0, racer.stamina - staminaDrain);

      // Check if reached finish line
      if (racer.position >= RACE_DISTANCE && !winner) {
        winner = racer.id;
        racer.position = RACE_DISTANCE; // Cap at finish line
      }
    });

    // Record frame data
    frames.push({
      time: frame,
      positions: racerStates.map(r => ({
        id: r.id,
        name: r.name,
        position: Math.min(r.position, RACE_DISTANCE),
        velocity: r.velocity,
        stamina: r.stamina
      }))
    });
  }

  // If no one finished, determine winner by position
  if (!winner) {
    const sorted = [...racerStates].sort((a, b) => b.position - a.position);
    winner = sorted[0].id;
  }

  return {
    winner,
    timeElapsed,
    frames,
    finalPositions: racerStates.map(r => ({
      id: r.id,
      name: r.name,
      finalPosition: r.position,
      finished: r.position >= RACE_DISTANCE
    }))
  };
}

/**
 * Generate AI opponent with similar stats to player's racer
 */
function generateAIOpponent(playerRacer) {
  // Create AI with slightly randomized stats (±10%)
  const aiStats = {};
  for (const [stat, value] of Object.entries(playerRacer.stats)) {
    const variance = Math.floor(Math.random() * 11) - 5; // -5 to +5
    aiStats[stat] = Math.max(10, Math.min(40, value + variance));
  }

  return {
    id: 'ai_opponent',
    name: 'AI-Challenger-' + Math.floor(Math.random() * 9999),
    stats: aiStats,
    isAI: true
  };
}

/**
 * Calculate XP reward based on race performance
 */
function calculateXPReward(won, raceDuration, raceType) {
  let baseXP = won ? 50 : 10;
  
  // Bonus for quick victories
  if (won && raceDuration < 30) {
    baseXP += 10;
  }

  // PvP gives more XP
  if (raceType === 'pvp') {
    baseXP *= 1.5;
  }

  return Math.floor(baseXP);
}

module.exports = {
  simulateRace,
  generateAIOpponent,
  calculateXPReward
};

