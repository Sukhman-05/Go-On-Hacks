import { motion } from 'framer-motion';
import { getRarityColor, getRarityBorder, getRarityBg, getStatColor, getStatPercentage } from '../utils/formatters';
import { STAT_LABELS, EVOLUTION_XP_THRESHOLD } from '../utils/constants';

function RacerCard({ racer, showDetails = false, onClick }) {
  const stats = racer.stats;
  const xpProgress = (racer.xp / EVOLUTION_XP_THRESHOLD) * 100;

  // Determine character type for ALL racers (Orc or Soldier)
  // Use a simple hash based on racer ID to consistently assign character type
  // This ensures the same racer always shows the same character type
  const getCharacterType = (racerId) => {
    if (!racerId) return 'orc';
    // Simple hash to determine character type
    const hash = racerId.toString().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return hash % 2 === 0 ? 'orc' : 'soldier';
  };

  // All racers show character sprites (Orc or Soldier), not sperm
  // Sperm sprites are only used during racing
  const characterType = getCharacterType(racer.id);
  const characterSprite = `/sprites/characters/${characterType}_idle.png`;

  return (
    <motion.div
      whileHover={{ scale: showDetails ? 1 : 1.02 }}
      onClick={onClick}
      className={`bg-dark-card rounded-xl p-4 border-2 ${getRarityBorder(racer.rarity)} ${
        onClick ? 'cursor-pointer' : ''
      } transition-all duration-200`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-bold text-lg truncate">{racer.name}</h3>
          <span className={`text-sm font-semibold ${getRarityColor(racer.rarity)}`}>
            {racer.rarity.toUpperCase()}
          </span>
        </div>
        {racer.evolved && (
          <div className="text-2xl" title="Evolved Avatar">
            ⭐
          </div>
        )}
      </div>

      {/* Racer Visual */}
      <div className={`${getRarityBg(racer.rarity)} bg-opacity-20 rounded-lg p-6 mb-3 text-center flex items-center justify-center min-h-[120px]`}>
        <img 
          src={characterSprite} 
          alt={characterType}
          className="w-20 h-20 object-contain"
          style={{ imageRendering: 'pixelated' }}
        />
      </div>

      {/* Stats */}
      <div className="space-y-2 mb-3">
        {Object.entries(stats).map(([stat, value]) => (
          <div key={stat}>
            <div className="flex justify-between text-sm mb-1">
              <span className={`${getStatColor(stat)} font-medium`}>
                {STAT_LABELS[stat]}
              </span>
              <span className="text-white font-bold">{value}</span>
            </div>
            <div className="w-full bg-dark rounded-full h-2">
              <div
                className={`${getRarityBg(racer.rarity)} h-2 rounded-full transition-all`}
                style={{ width: `${getStatPercentage(value)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* XP Progress */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>XP</span>
          <span>{racer.xp} / {EVOLUTION_XP_THRESHOLD}</span>
        </div>
        <div className="w-full bg-dark rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all"
            style={{ width: `${Math.min(xpProgress, 100)}%` }}
          />
        </div>
      </div>

      {/* Details */}
      {showDetails && (
        <div className="text-xs text-gray-400 space-y-1 border-t border-gray-700 pt-3">
          <div className="flex justify-between">
            <span>Generation:</span>
            <span className="text-white">{racer.generation}</span>
          </div>
          {racer.parentId && (
            <div className="flex justify-between">
              <span>Has Parent:</span>
              <span className="text-white">Yes</span>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

export default RacerCard;

