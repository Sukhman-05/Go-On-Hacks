const RacerModel = require('../models/RacerModel');
const EvolutionModel = require('../models/EvolutionModel');
const { inheritStats } = require('../utils/statWeighting');
const { randomChoice } = require('../utils/rng');

const EVOLUTION_XP_THRESHOLD = 500;

// AI Avatar names for evolved forms
const avatarNames = [
  'GPT-Prime', 'Claude-Ultra', 'Gemini-Pro', 'LLaMA-Max', 'Mistral-Elite',
  'Neural-Alpha', 'Quantum-AI', 'Singularity-One', 'DeepMind-X', 'OpenAI-Omega',
  'Anthropic-Apex', 'Google-Genesis', 'Meta-Master', 'Stable-Supreme', 'Turing-Complete'
];

/**
 * Check if racer is eligible for evolution
 */
async function checkEvolutionEligibility(racerId) {
  const racer = await RacerModel.findById(racerId);
  
  if (!racer) {
    throw new Error('Racer not found');
  }

  if (racer.evolved) {
    return { eligible: false, reason: 'Already evolved', racer };
  }

  if (racer.xp < EVOLUTION_XP_THRESHOLD) {
    return { 
      eligible: false, 
      reason: `Need ${EVOLUTION_XP_THRESHOLD - racer.xp} more XP`,
      racer 
    };
  }

  return { eligible: true, racer };
}

/**
 * Evolve a racer into an AI Avatar
 */
async function evolveRacer(racerId) {
  const { eligible, reason, racer } = await checkEvolutionEligibility(racerId);
  
  if (!eligible) {
    throw new Error(`Cannot evolve: ${reason}`);
  }

  // Generate new avatar name
  const baseName = randomChoice(avatarNames);
  const generation = racer.generation;
  const newName = `${baseName}-G${generation}`;

  // Mark original racer as evolved
  await RacerModel.markAsEvolved(racerId);

  // Record evolution
  await EvolutionModel.create(racerId, racer.name, newName);

  return {
    oldName: racer.name,
    newName,
    generation,
    stats: racer.stats,
    canBreed: true
  };
}

/**
 * Breed two evolved racers to create offspring
 * For now, we'll allow self-breeding (one parent)
 */
async function breedRacer(parentRacerId, userId) {
  const parent = await RacerModel.findById(parentRacerId);
  
  if (!parent) {
    throw new Error('Parent racer not found');
  }

  if (!parent.evolved) {
    throw new Error('Only evolved racers can breed');
  }

  // Check ownership
  const ownsRacer = await RacerModel.belongsToUser(parentRacerId, userId);
  if (!ownsRacer) {
    throw new Error('You do not own this racer');
  }

  // Inherit stats (60% parent, 40% random)
  const childStats = inheritStats(parent.stats);

  // Generate child name
  const childName = `${parent.name}-Offspring-${Math.floor(Math.random() * 999)}`;
  
  // Determine rarity based on inherited stats
  const { determineRarity } = require('../utils/statWeighting');
  const rarity = determineRarity(childStats);

  // Create child racer
  const child = await RacerModel.create(
    userId,
    childName,
    childStats,
    rarity,
    parent.generation + 1,
    parentRacerId
  );

  return child;
}

/**
 * Get evolution progress for a racer
 */
async function getEvolutionProgress(racerId) {
  const racer = await RacerModel.findById(racerId);
  
  if (!racer) {
    throw new Error('Racer not found');
  }

  const progress = Math.min(100, (racer.xp / EVOLUTION_XP_THRESHOLD) * 100);
  const xpNeeded = Math.max(0, EVOLUTION_XP_THRESHOLD - racer.xp);

  return {
    currentXP: racer.xp,
    requiredXP: EVOLUTION_XP_THRESHOLD,
    progress: Math.floor(progress),
    xpNeeded,
    canEvolve: racer.xp >= EVOLUTION_XP_THRESHOLD && !racer.evolved,
    evolved: racer.evolved
  };
}

module.exports = {
  checkEvolutionEligibility,
  evolveRacer,
  breedRacer,
  getEvolutionProgress,
  EVOLUTION_XP_THRESHOLD
};

