import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getRacers, getBalance } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { useGameStore } from '../store/useGameStore';
import { formatCredits } from '../utils/formatters';
import RacerCard from '../components/RacerCard';

function Home() {
  const [loading, setLoading] = useState(true);
  const { user, updateBalance } = useAuthStore();
  const { racers, setRacers } = useGameStore();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [racersData, balanceData] = await Promise.all([
        getRacers(),
        getBalance()
      ]);
      setRacers(racersData.racers);
      updateBalance(balanceData.balance);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="dna-loader text-6xl">🧬</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        <h1 className="text-5xl font-bold mb-4">
          Welcome, <span className="text-primary">{user?.username}</span>!
        </h1>
        <p className="text-xl text-gray-400 mb-6">
          Your balance: <span className="text-primary font-bold">{formatCredits(user?.wallet_balance || 0)}</span>
        </p>
        
        <div className="flex justify-center gap-4">
          <Link to="/summon" className="btn-primary">
            🎰 Summon New Racer
          </Link>
          <Link to="/race" className="btn-secondary">
            🏁 Start Racing
          </Link>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-dark-card p-6 rounded-xl border border-primary/20"
        >
          <div className="text-4xl mb-2">🧬</div>
          <div className="text-2xl font-bold text-primary">{racers.length}</div>
          <div className="text-gray-400">Total Racers</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-dark-card p-6 rounded-xl border border-secondary/20"
        >
          <div className="text-4xl mb-2">⭐</div>
          <div className="text-2xl font-bold text-secondary">
            {racers.filter(r => r.evolved).length}
          </div>
          <div className="text-gray-400">Evolved Avatars</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-dark-card p-6 rounded-xl border border-legendary/20"
        >
          <div className="text-4xl mb-2">👑</div>
          <div className="text-2xl font-bold text-legendary">
            {racers.filter(r => r.rarity === 'legendary').length}
          </div>
          <div className="text-gray-400">Legendary Racers</div>
        </motion.div>
      </div>

      {/* Racer Collection */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-6">Your Racers</h2>
        
        {racers.length === 0 ? (
          <div className="text-center py-12 bg-dark-card rounded-xl border border-gray-700">
            <div className="text-6xl mb-4">🎰</div>
            <p className="text-xl text-gray-400 mb-4">No racers yet!</p>
            <Link to="/summon" className="btn-primary inline-block">
              Summon Your First Racer
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {racers.map((racer, index) => (
              <motion.div
                key={racer.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <RacerCard racer={racer} />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="text-center">
        <p className="text-gray-400 mb-4">Ready for more action?</p>
        <div className="flex justify-center gap-4">
          <Link to="/leaderboard" className="text-primary hover:underline">
            View Leaderboard
          </Link>
          <Link to="/profile" className="text-primary hover:underline">
            View Full Profile
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;

