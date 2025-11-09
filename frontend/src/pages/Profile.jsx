import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getProfile, getRacers, getTransactions } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { formatCredits, formatDate } from '../utils/formatters';
import RacerCard from '../components/RacerCard';

function Profile() {
  const [profile, setProfile] = useState(null);
  const [racers, setRacers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('racers'); // racers, transactions
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const [profileData, racersData, transactionsData] = await Promise.all([
        getProfile(),
        getRacers(),
        getTransactions(20)
      ]);
      setProfile(profileData.user);
      setRacers(racersData.racers);
      setTransactions(transactionsData.transactions);
    } catch (error) {
      console.error('Failed to load profile:', error);
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Profile Header */}
        <div className="bg-dark-card rounded-xl p-8 mb-8 border border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">{user?.username}</h1>
              <p className="text-gray-400">{profile?.email}</p>
              <p className="text-sm text-gray-500 mt-2">
                Member since {formatDate(profile?.created_at)}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400 mb-1">Balance</div>
              <div className="text-4xl font-bold text-primary">
                {formatCredits(profile?.wallet_balance || 0)}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-dark-card p-6 rounded-xl border border-gray-700"
          >
            <div className="text-3xl mb-2">🧬</div>
            <div className="text-2xl font-bold text-primary">{racers.length}</div>
            <div className="text-sm text-gray-400">Total Racers</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-dark-card p-6 rounded-xl border border-gray-700"
          >
            <div className="text-3xl mb-2">⭐</div>
            <div className="text-2xl font-bold text-secondary">
              {racers.filter(r => r.evolved).length}
            </div>
            <div className="text-sm text-gray-400">Evolved Avatars</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-dark-card p-6 rounded-xl border border-gray-700"
          >
            <div className="text-3xl mb-2">💰</div>
            <div className="text-2xl font-bold text-green-400">
              {formatCredits(profile?.stats?.totalEarned || 0)}
            </div>
            <div className="text-sm text-gray-400">Total Earned</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-dark-card p-6 rounded-xl border border-gray-700"
          >
            <div className="text-3xl mb-2">💸</div>
            <div className="text-2xl font-bold text-red-400">
              {formatCredits(profile?.stats?.totalSpent || 0)}
            </div>
            <div className="text-sm text-gray-400">Total Spent</div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex gap-4 border-b border-gray-700">
            <button
              onClick={() => setActiveTab('racers')}
              className={`px-6 py-3 font-semibold transition ${
                activeTab === 'racers'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              My Racers ({racers.length})
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-6 py-3 font-semibold transition ${
                activeTab === 'transactions'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Transaction History
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'racers' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {racers.map((racer, index) => (
              <motion.div
                key={racer.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <RacerCard racer={racer} showDetails />
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="bg-dark-card rounded-xl border border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-dark border-b border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left">Type</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                  <th className="px-6 py-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, index) => (
                  <motion.tr
                    key={tx.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="border-b border-gray-800 hover:bg-dark-lighter transition"
                  >
                    <td className="px-6 py-4">
                      <span className="capitalize">{tx.transaction_type.replace(/_/g, ' ')}</span>
                    </td>
                    <td className={`px-6 py-4 text-right font-bold ${
                      tx.amount > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {tx.amount > 0 ? '+' : ''}{formatCredits(tx.amount)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-400">
                      {formatDate(tx.timestamp)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default Profile;

