/**
 * Format number with commas
 */
export const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Format currency (DNA Credits)
 */
export const formatCredits = (amount) => {
  return `${formatNumber(amount)} DNA₵`;
};

/**
 * Get rarity color class
 */
export const getRarityColor = (rarity) => {
  const colors = {
    common: 'text-common',
    rare: 'text-rare',
    epic: 'text-epic',
    legendary: 'text-legendary'
  };
  return colors[rarity] || 'text-gray-400';
};

/**
 * Get rarity background class
 */
export const getRarityBg = (rarity) => {
  const colors = {
    common: 'bg-common',
    rare: 'bg-rare',
    epic: 'bg-epic',
    legendary: 'bg-legendary'
  };
  return colors[rarity] || 'bg-gray-400';
};

/**
 * Get rarity border class
 */
export const getRarityBorder = (rarity) => {
  const colors = {
    common: 'border-common',
    rare: 'border-rare',
    epic: 'border-epic',
    legendary: 'border-legendary'
  };
  return colors[rarity] || 'border-gray-400';
};

/**
 * Get stat color class
 */
export const getStatColor = (statName) => {
  const colors = {
    speed: 'text-red-400',
    motility: 'text-blue-400',
    endurance: 'text-green-400',
    luck: 'text-yellow-400'
  };
  return colors[statName] || 'text-gray-400';
};

/**
 * Format date
 */
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
};

/**
 * Calculate win rate
 */
export const calculateWinRate = (wins, total) => {
  if (total === 0) return 0;
  return Math.round((wins / total) * 100);
};

/**
 * Get stat percentage (out of 40)
 */
export const getStatPercentage = (value) => {
  return Math.round((value / 40) * 100);
};

