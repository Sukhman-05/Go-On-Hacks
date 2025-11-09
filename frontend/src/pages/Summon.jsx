import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { summonRacer } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { useGameStore } from '../store/useGameStore';
import { formatCredits, getRarityColor } from '../utils/formatters';
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

        {/* Summoned Racer */}
        <AnimatePresence>
          {summonedRacer && !summoning && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', duration: 0.8 }}
              className="text-center"
            >
              <div className="mb-6">
                <h2 className="text-4xl font-bold mb-2">🎉 Success!</h2>
                <p className={`text-2xl ${getRarityColor(summonedRacer.rarity)}`}>
                  {summonedRacer.rarity.toUpperCase()} Racer Summoned!
                </p>
              </div>

              <div className="max-w-md mx-auto">
                <RacerCard racer={summonedRacer} showDetails />
              </div>

              <div className="mt-8 flex justify-center gap-4">
                <button onClick={() => setSummonedRacer(null)} className="btn-secondary">
                  Summon Again
                </button>
                <a href="/race" className="btn-primary">
                  Race Now!
                </a>
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

