const seedrandom = require('seedrandom');

/**
 * Create a seeded random number generator
 */
function createSeededRNG(seed) {
  return seedrandom(seed);
}

/**
 * Generate random integer between min and max (inclusive)
 */
function randomInt(min, max, rng = Math.random) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

/**
 * Generate random float between min and max
 */
function randomFloat(min, max, rng = Math.random) {
  return rng() * (max - min) + min;
}

/**
 * Pick random element from array
 */
function randomChoice(array, rng = Math.random) {
  return array[Math.floor(rng() * array.length)];
}

/**
 * Generate race seed from timestamp and racer IDs
 */
function generateRaceSeed(racer1Id, racer2Id) {
  return `race_${Date.now()}_${racer1Id}_${racer2Id}`;
}

module.exports = {
  createSeededRNG,
  randomInt,
  randomFloat,
  randomChoice,
  generateRaceSeed
};

