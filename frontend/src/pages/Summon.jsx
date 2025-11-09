import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { summonRacer } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { useGameStore } from '../store/useGameStore';
import { formatCredits, getRarityColor, getRarityBg, getRarityBorder } from '../utils/formatters';
import { SUMMON_COST } from '../utils/constants';
import RacerCard from '../components/RacerCard';

function Summon() {
  const [summoning, setSummoning] = useState(false);
  const [summonedRacer, setSummonedRacer] = useState(null);
  const [error, setError] = useState('');
  const { user, updateBalance } = useAuthStore();
  const { addRacer } = useGameStore();

  const handleSummon = async () => {
    if (user.wallet_balance < SUMMON_COST) {
      setError('Insufficient DNA Credits');
      return;
    }

    setError('');
    setSummoning(true);
    setSummonedRacer(null);

    try {
      // Simulate summoning animation
      await new Promise(resolve => setTimeout(resolve, 2000));

      const data = await summonRacer();
      setSummonedRacer(data.racer);
      addRacer(data.racer);
      updateBalance(user.wallet_balance - SUMMON_COST);
    } catch (err) {
      setError(err.response?.data?.error || 'Summon failed');
    } finally {
      setSummoning(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">Summon Racer</h1>
          <p className="text-xl text-gray-400">
            Pull the gacha to obtain a new AI-powered racer!
          </p>
        </div>

        {/* Summon Button */}
        <div className="bg-dark-card rounded-xl p-8 mb-8 text-center border border-primary/20">
          <div className="mb-6">
            <div className="text-6xl mb-4">🎰</div>
            <p className="text-2xl mb-2">Cost: <span className="text-primary font-bold">{formatCredits(SUMMON_COST)}</span></p>
            <p className="text-gray-400">Your Balance: {formatCredits(user?.wallet_balance || 0)}</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <button
            onClick={handleSummon}
            disabled={summoning || user?.wallet_balance < SUMMON_COST}
            className="btn-primary text-xl px-12 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {summoning ? (
              <span className="flex items-center justify-center gap-2">
                <span className="dna-loader">🧬</span> Summoning...
              </span>
            ) : (
              '🎰 Summon Racer'
            )}
          </button>
        </div>

        {/* Summoning Animation */}
        <AnimatePresence>
          {summoning && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-center mb-8"
            >
              <div className="text-8xl dna-loader mb-4">🧬</div>
              <p className="text-2xl text-primary">Generating DNA sequence...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Summoned Racer - Enhanced Display */}
        <AnimatePresence>
          {summonedRacer && !summoning && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', duration: 0.8 }}
              className="max-w-2xl mx-auto"
            >
              {/* Success Header */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="text-7xl mb-4"
                >
                  🎉
                </motion.div>
                <h2 className="text-5xl font-bold mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Racer Summoned!
                </h2>
                <p className={`text-3xl font-bold ${getRarityColor(summonedRacer.rarity)}`}>
                  {summonedRacer.rarity.toUpperCase()}
                </p>
              </div>

              {/* Large Sprite Display */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-dark-card to-dark rounded-2xl p-8 mb-6 border-2 border-primary/30 shadow-2xl"
              >
                <div className="flex flex-col md:flex-row items-center gap-8">
                  {/* Sprite */}
                  <div className="flex-shrink-0">
                    <div className={`${getRarityBg(summonedRacer.rarity)} bg-opacity-20 rounded-xl p-6 border-2 ${getRarityBorder(summonedRacer.rarity)} border-opacity-50`}>
                      {(() => {
                        // Determine character type based on racer ID (same logic as RacerCard)
                        const getCharacterType = (racerId) => {
                          if (!racerId) return 'orc';
                          const hash = racerId.toString().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                          return hash % 2 === 0 ? 'orc' : 'soldier';
                        };
                        const characterType = getCharacterType(summonedRacer.id);
                        return (
                          <img 
                            src={`/sprites/characters/${characterType}_idle.png`}
                            alt={characterType}
                            className="w-32 h-32 object-contain"
                            style={{ imageRendering: 'pixelated' }}
                          />
                        );
                      })()}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex-1 w-full">
                    <h3 className="text-3xl font-bold mb-4 text-center md:text-left">{summonedRacer.name}</h3>
                    <div className="space-y-3">
                      {Object.entries(summonedRacer.stats).map(([stat, value]) => (
                        <div key={stat} className="bg-dark/50 rounded-lg p-3">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-semibold text-gray-300 capitalize">{stat}</span>
                            <span className="text-xl font-bold text-white">{value}</span>
                          </div>
                          <div className="w-full bg-dark rounded-full h-2">
                            <div
                              className={`${getRarityBg(summonedRacer.rarity)} h-2 rounded-full transition-all`}
                              style={{ width: `${(value / 50) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <div className="flex justify-between text-sm text-gray-400">
                        <span>XP Progress</span>
                        <span className="text-white font-bold">{summonedRacer.xp} / 500</span>
                      </div>
                      <div className="w-full bg-dark rounded-full h-2 mt-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${Math.min((summonedRacer.xp / 500) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-4">
                <motion.button 
                  onClick={() => setSummonedRacer(null)} 
                  className="btn-secondary px-8 py-3"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Summon Again
                </motion.button>
                <motion.a 
                  href="/race" 
                  className="btn-primary px-8 py-3"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Race Now!
                </motion.a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Rarity Information */}
        {!summonedRacer && !summoning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-dark-card rounded-xl p-6 border border-gray-700"
          >
            <h3 className="text-xl font-bold mb-4">Rarity Chances</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-common">⚪ Common</span>
                <span className="text-gray-400">~70%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-rare">🔵 Rare</span>
                <span className="text-gray-400">~20%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-epic">🟣 Epic</span>
                <span className="text-gray-400">~8%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-legendary">🟡 Legendary</span>
                <span className="text-gray-400">~2%</span>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default Summon;

