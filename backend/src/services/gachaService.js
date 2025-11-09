const { distributeStats, determineRarity } = require('../utils/statWeighting');
const { randomChoice } = require('../utils/rng');

// AI-themed racer names
const namePool = [
  'GPT-Racer', 'Claude-Sprint', 'Gemini-Rush', 'LLaMA-Dash', 'Mistral-Bolt',
  'Bard-Blitz', 'Copilot-Charge', 'Whisper-Wave', 'DALL-E-Dash', 'Stable-Sprint',
  'Midjourney-Mover', 'ChatGPT-Champ', 'Bing-Blazer', 'Palm-Pacer', 'Falcon-Flash',
  'Vicuna-Velocity', 'Alpaca-Ace', 'Bloom-Bullet', 'Gopher-Go', 'Megatron-Mach'
];

/**
 * Perform a gacha pull to generate a new racer
 */
function performGachaPull(rng = Math.random) {
  // Generate random stats
  const stats = distributeStats(rng);
  
  // Determine rarity based on stat distribution
  const rarity = determineRarity(stats);
  
  // Generate a unique name
  const baseName = randomChoice(namePool, rng);
  const number = Math.floor(rng() * 9999) + 1;
  const name = `${baseName}-${number.toString().padStart(4, '0')}`;
  
  return {
    name,
    stats,
    rarity
  };
}

/**
 * Generate multiple gacha pulls (for future bulk pull feature)
 */
function performMultiplePulls(count, rng = Math.random) {
  const pulls = [];
  for (let i = 0; i < count; i++) {
    pulls.push(performGachaPull(rng));
  }
  return pulls;
}

/**
 * Calculate gacha cost
 */
function getGachaCost(pullCount = 1) {
  const baseCost = 100;
  if (pullCount === 1) return baseCost;
  if (pullCount === 10) return baseCost * 9; // 10% discount for 10-pull
  return baseCost * pullCount;
}

module.exports = {
  performGachaPull,
  performMultiplePulls,
  getGachaCost
};

