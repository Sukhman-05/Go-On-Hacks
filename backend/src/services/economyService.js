const UserModel = require('../models/UserModel');
const TransactionModel = require('../models/TransactionModel');
const BetModel = require('../models/BetModel');

const STARTING_BALANCE = 1000;
const SUMMON_COST = 100;
const PVE_ENTRY_COST = 50;
const PVE_WIN_REWARD = 75;
const PVP_HOUSE_FEE = 0.05; // 5%

/**
 * Validate if user has enough balance
 */
async function validateBalance(userId, amount) {
  const balance = await UserModel.getBalance(userId);
  return balance >= amount;
}

/**
 * Deduct cost from user balance
 */
async function deductCost(userId, amount, transactionType, referenceId = null) {
  const hasBalance = await validateBalance(userId, amount);
  
  if (!hasBalance) {
    throw new Error('Insufficient balance');
  }

  await UserModel.updateBalance(userId, -amount);
  await TransactionModel.create(userId, transactionType, -amount, referenceId);
  
  return true;
}

/**
 * Add credits to user balance
 */
async function addCredits(userId, amount, transactionType, referenceId = null) {
  await UserModel.updateBalance(userId, amount);
  await TransactionModel.create(userId, transactionType, amount, referenceId);
  
  return true;
}

/**
 * Process summon payment
 */
async function processSummonPayment(userId, racerId) {
  return await deductCost(userId, SUMMON_COST, 'summon', racerId);
}

/**
 * Process PvE race entry
 */
async function processPvERaceEntry(userId, raceId) {
  return await deductCost(userId, PVE_ENTRY_COST, 'race_entry', raceId);
}

/**
 * Distribute PvE race rewards
 */
async function distributePvERewards(userId, raceId, won) {
  if (won) {
    return await addCredits(userId, PVE_WIN_REWARD, 'race_win', raceId);
  }
  // Loser gets nothing in PvE (already paid entry fee)
  return false;
}

/**
 * Process bet placement
 */
async function placeBet(userId, raceId, racerId, amount) {
  const hasBalance = await validateBalance(userId, amount);
  
  if (!hasBalance) {
    throw new Error('Insufficient balance for bet');
  }

  // Lock the bet amount
  await UserModel.updateBalance(userId, -amount);
  
  // Create bet record
  const bet = await BetModel.create(userId, raceId, racerId, amount);
  
  // Log transaction
  await TransactionModel.create(userId, 'bet_placed', -amount, bet.id);
  
  return bet;
}

/**
 * Resolve bet after race
 */
async function resolveBet(betId, won, raceType = 'pve') {
  const bet = await BetModel.findById(betId);
  
  if (!bet || bet.resolved) {
    return null;
  }

  let payout = 0;

  if (won) {
    if (raceType === 'pve') {
      // PvE: 1.5x payout
      payout = Math.floor(bet.amount * 1.5);
    } else {
      // PvP: 2x minus house fee
      payout = Math.floor(bet.amount * 2 * (1 - PVP_HOUSE_FEE));
    }

    await addCredits(bet.user_id, payout, 'bet_won', bet.race_id);
  }

  await BetModel.resolve(betId, won ? 'win' : 'loss');

  return { betId, payout, won };
}

/**
 * Resolve all bets for a race
 */
async function resolveRaceBets(raceId, winnerId, raceType) {
  const bets = await BetModel.findByRaceId(raceId);
  
  const results = [];
  for (const bet of bets) {
    const won = bet.racer_id === winnerId;
    const result = await resolveBet(bet.id, won, raceType);
    results.push(result);
  }

  return results;
}

/**
 * Process PvP wager pool
 */
async function processPvPWager(player1Id, player2Id, wagerAmount, raceId, winnerId) {
  // Total pot
  const totalPot = wagerAmount * 2;
  const houseFee = Math.floor(totalPot * PVP_HOUSE_FEE);
  const winnerPayout = totalPot - houseFee;

  // Award to winner
  await addCredits(winnerId, winnerPayout, 'pvp_win', raceId);

  return { winnerPayout, houseFee };
}

module.exports = {
  validateBalance,
  deductCost,
  addCredits,
  processSummonPayment,
  processPvERaceEntry,
  distributePvERewards,
  placeBet,
  resolveBet,
  resolveRaceBets,
  processPvPWager,
  STARTING_BALANCE,
  SUMMON_COST,
  PVE_ENTRY_COST
};

