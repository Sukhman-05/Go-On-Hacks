import { useState } from 'react';
import { motion } from 'framer-motion';
import { formatCredits } from '../utils/formatters';
import { useAuthStore } from '../store/useAuthStore';

function BettingPanel({ maxBet = 1000, onBetChange, currentBet = 0 }) {
  const { user } = useAuthStore();
  const [bet, setBet] = useState(currentBet);

  const handleBetChange = (value) => {
    const newBet = Math.max(0, Math.min(value, Math.min(maxBet, user?.wallet_balance || 0)));
    setBet(newBet);
    if (onBetChange) {
      onBetChange(newBet);
    }
  };

  const quickBets = [0, 50, 100, 250, 500];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-card rounded-xl p-6 border border-primary/20"
    >
      <h3 className="text-2xl font-bold mb-4">💰 Place Your Bet</h3>
      
      <p className="text-gray-400 mb-4">
        Your Balance: <span className="text-primary font-bold">{formatCredits(user?.wallet_balance || 0)}</span>
      </p>

      {/* Bet Amount Slider */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Bet Amount</label>
        <input
          type="range"
          min="0"
          max={Math.min(maxBet, user?.wallet_balance || 0)}
          value={bet}
          onChange={(e) => handleBetChange(parseInt(e.target.value))}
          className="w-full h-2 bg-dark rounded-lg appearance-none cursor-pointer accent-primary"
        />
        <div className="text-center mt-2">
          <span className="text-3xl font-bold text-primary">{formatCredits(bet)}</span>
        </div>
      </div>

      {/* Quick Bet Buttons */}
      <div className="mb-4">
        <p className="text-sm text-gray-400 mb-2">Quick Select:</p>
        <div className="grid grid-cols-5 gap-2">
          {quickBets.map((amount) => (
            <button
              key={amount}
              onClick={() => handleBetChange(amount)}
              disabled={amount > (user?.wallet_balance || 0)}
              className={`py-2 px-3 rounded-lg text-sm font-semibold transition ${
                bet === amount
                  ? 'bg-primary text-dark'
                  : 'bg-dark-lighter text-gray-300 hover:bg-dark border border-gray-600'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {amount === 0 ? 'None' : amount}
            </button>
          ))}
        </div>
      </div>

      {/* Potential Payout */}
      {bet > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-dark p-4 rounded-lg border border-green-500/30"
        >
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Potential Payout (1.5x):</span>
            <span className="text-2xl font-bold text-green-400">
              {formatCredits(Math.floor(bet * 1.5))}
            </span>
          </div>
        </motion.div>
      )}

      {bet === 0 && (
        <p className="text-sm text-gray-500 italic">
          No bet placed. You can race without betting.
        </p>
      )}
    </motion.div>
  );
}

export default BettingPanel;

