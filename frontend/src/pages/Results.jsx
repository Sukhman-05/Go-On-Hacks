import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useRaceStore } from '../store/useRaceStore';
import { formatCredits } from '../utils/formatters';

function Results() {
  const { currentRace, winner, rewards } = useRaceStore();

  // Debug logging
  console.log('Results page:', { currentRace, winner, rewards });

  if (!currentRace || !rewards) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-xl text-gray-400 mb-4">No race results available</p>
          <p className="text-sm text-gray-500 mb-4">
            {!currentRace && 'Race data missing. '}
            {!rewards && 'Rewards missing.'}
          </p>
          <Link to="/race" className="btn-primary">
            Start a Race
          </Link>
        </div>
      </div>
    );
  }

  const playerWon = currentRace.playerWon !== undefined ? currentRace.playerWon : (winner && currentRace.winner === winner);

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-3xl mx-auto text-center"
      >
        {/* Result Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.8 }}
          className="mb-8"
        >
          <div className="text-9xl mb-4">
            {playerWon ? '🎉' : '😢'}
          </div>
          <h1 className={`text-6xl font-bold mb-4 ${
            playerWon ? 'text-green-400' : 'text-red-400'
          }`}>
            {playerWon ? 'Victory!' : 'Defeated!'}
          </h1>
          <p className="text-2xl text-gray-400">
            {playerWon 
              ? 'You crossed the finish line first!' 
              : 'Better luck next time, champion!'}
          </p>
        </motion.div>

        {/* Rewards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-dark-card rounded-xl p-8 mb-8 border border-primary/20"
        >
          <h2 className="text-3xl font-bold mb-6">Rewards</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-5xl mb-2">⭐</div>
              <div className="text-3xl font-bold text-primary mb-2">
                +{rewards.xpGained} XP
              </div>
              <div className="text-sm text-gray-400">Experience Gained</div>
            </div>
            <div>
              <div className="text-5xl mb-2">💰</div>
              <div className={`text-3xl font-bold mb-2 ${
                rewards.creditsEarned > 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {rewards.creditsEarned > 0 ? '+' : ''}{formatCredits(rewards.creditsEarned)}
              </div>
              <div className="text-sm text-gray-400">Credits {rewards.creditsEarned > 0 ? 'Earned' : 'Lost'}</div>
            </div>
          </div>
        </motion.div>

        {/* Race Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-dark-card rounded-xl p-6 mb-8 border border-gray-700"
        >
          <h3 className="text-xl font-bold mb-4">Race Statistics</h3>
          <div className="space-y-2 text-gray-400">
            <div className="flex justify-between">
              <span>Race Duration:</span>
              <span className="text-white">{currentRace.timeElapsed}s</span>
            </div>
            <div className="flex justify-between">
              <span>Race Type:</span>
              <span className="text-white uppercase">PvE</span>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex justify-center gap-4"
        >
          <Link to="/race" className="btn-primary">
            Race Again
          </Link>
          <Link to="/" className="btn-secondary">
            Back to Home
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Results;

