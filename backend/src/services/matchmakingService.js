/**
 * Simple matchmaking service for PvP races
 * In a real implementation, this would use a queue system
 */

// In-memory queue (for MVP - should use Redis in production)
const matchmakingQueue = new Map();

/**
 * Calculate racer power level for matchmaking
 */
function calculatePowerLevel(stats) {
  return stats.speed + stats.motility + stats.endurance + stats.luck;
}

/**
 * Add player to matchmaking queue
 */
function joinQueue(userId, racerId, racer, wagerAmount) {
  const powerLevel = calculatePowerLevel(racer.stats);
  
  const queueEntry = {
    userId,
    racerId,
    racer,
    wagerAmount,
    powerLevel,
    joinedAt: Date.now()
  };

  matchmakingQueue.set(userId, queueEntry);

  // Try to find a match
  return findMatch(userId);
}

/**
 * Find a suitable match for a player
 */
function findMatch(userId) {
  const player = matchmakingQueue.get(userId);
  
  if (!player) return null;

  // Look for another player with similar power level and same wager
  for (const [otherUserId, opponent] of matchmakingQueue.entries()) {
    if (otherUserId === userId) continue;

    // Check wager match
    if (opponent.wagerAmount !== player.wagerAmount) continue;

    // Check power level (within 10 points)
    const powerDiff = Math.abs(opponent.powerLevel - player.powerLevel);
    if (powerDiff <= 15) {
      // Match found!
      matchmakingQueue.delete(userId);
      matchmakingQueue.delete(otherUserId);

      return {
        player1: player,
        player2: opponent,
        wagerAmount: player.wagerAmount
      };
    }
  }

  return null;
}

/**
 * Leave matchmaking queue
 */
function leaveQueue(userId) {
  return matchmakingQueue.delete(userId);
}

/**
 * Get queue status for a user
 */
function getQueueStatus(userId) {
  const entry = matchmakingQueue.get(userId);
  
  if (!entry) {
    return { inQueue: false };
  }

  return {
    inQueue: true,
    waitTime: Date.now() - entry.joinedAt,
    queueSize: matchmakingQueue.size
  };
}

/**
 * Clear stale queue entries (older than 5 minutes)
 */
function clearStaleEntries() {
  const fiveMinutes = 5 * 60 * 1000;
  const now = Date.now();

  for (const [userId, entry] of matchmakingQueue.entries()) {
    if (now - entry.joinedAt > fiveMinutes) {
      matchmakingQueue.delete(userId);
    }
  }
}

// Periodically clear stale entries
setInterval(clearStaleEntries, 60000); // Every minute

module.exports = {
  joinQueue,
  findMatch,
  leaveQueue,
  getQueueStatus,
  calculatePowerLevel
};

