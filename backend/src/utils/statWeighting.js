/**
 * Distribute 100 points across 4 stats with constraints
 * Min: 10 per stat, Max: 40 per stat
 */
function distributeStats(rng = Math.random) {
  const stats = { speed: 10, motility: 10, endurance: 10, luck: 10 };
  let remaining = 60; // 100 - (10 * 4)

  const statNames = ['speed', 'motility', 'endurance', 'luck'];
  
  while (remaining > 0) {
    // Pick a random stat
    const statName = statNames[Math.floor(rng() * 4)];
    
    // Check if we can add to this stat (max 40)
    if (stats[statName] < 40) {
      stats[statName]++;
      remaining--;
    }
  }

  return stats;
}

/**
 * Calculate stat variance (used for rarity determination)
 * Higher variance = more specialized racer = higher rarity
 */
function calculateVariance(stats) {
  const values = [stats.speed, stats.motility, stats.endurance, stats.luck];
  const mean = 25; // 100 / 4
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / 4;
  return Math.sqrt(variance);
}

/**
 * Determine rarity based on stat variance
 */
function determineRarity(stats) {
  const variance = calculateVariance(stats);
  
  // Higher variance = more specialized = rarer
  if (variance >= 10) return 'legendary'; // ~2%
  if (variance >= 7) return 'epic';      // ~8%
  if (variance >= 5) return 'rare';      // ~20%
  return 'common';                        // ~70%
}

/**
 * Inherit stats from parent (60% parent, 40% random)
 */
function inheritStats(parentStats, rng = Math.random) {
  const childStats = { speed: 10, motility: 10, endurance: 10, luck: 10 };
  let remaining = 60;

  const statNames = ['speed', 'motility', 'endurance', 'luck'];
  
  // Inherit 60% of parent's distribution
  for (const stat of statNames) {
    const parentBonus = Math.floor((parentStats[stat] - 10) * 0.6);
    childStats[stat] += parentBonus;
    remaining -= parentBonus;
  }

  // Distribute remaining 40% randomly
  while (remaining > 0) {
    const statName = statNames[Math.floor(rng() * 4)];
    if (childStats[statName] < 40) {
      childStats[statName]++;
      remaining--;
    }
  }

  return childStats;
}

module.exports = {
  distributeStats,
  calculateVariance,
  determineRarity,
  inheritStats
};

