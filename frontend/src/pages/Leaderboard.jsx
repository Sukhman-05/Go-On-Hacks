import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getLeaderboard } from '../services/api';
import { formatCredits } from '../utils/formatters';

function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const data = await getLeaderboard(20);
      setLeaders(data.leaderboard);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankMedal = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
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
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">🏆 Leaderboard</h1>
          <p className="text-xl text-gray-400">
            Top racers competing for the gene pool
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Top 3 Podium */}
          {leaders.length >= 3 && (
            <div className="grid grid-cols-3 gap-4 mb-8">
              {/* 2nd Place */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-b from-gray-400/20 to-dark-card p-6 rounded-xl border border-gray-400 text-center"
              >
                <div className="text-5xl mb-2">🥈</div>
                <div className="text-2xl font-bold mb-2">{leaders[1].username}</div>
                <div className="text-primary text-xl font-bold mb-2">
                  {formatCredits(leaders[1].balance)}
                </div>
                <div className="text-sm text-gray-400">
                  {leaders[1].wins} / {leaders[1].totalRaces} wins
                </div>
                <div className="text-sm text-gray-400">
                  Win Rate: {leaders[1].winRate}%
                </div>
              </motion.div>

              {/* 1st Place */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-b from-legendary/20 to-dark-card p-6 rounded-xl border-2 border-legendary text-center glow-gold"
              >
                <div className="text-6xl mb-2">🥇</div>
                <div className="text-3xl font-bold mb-2 text-legendary">{leaders[0].username}</div>
                <div className="text-primary text-2xl font-bold mb-2">
                  {formatCredits(leaders[0].balance)}
                </div>
                <div className="text-sm text-gray-400">
                  {leaders[0].wins} / {leaders[0].totalRaces} wins
                </div>
                <div className="text-sm text-gray-400">
                  Win Rate: {leaders[0].winRate}%
                </div>
              </motion.div>

              {/* 3rd Place */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-b from-yellow-700/20 to-dark-card p-6 rounded-xl border border-yellow-700 text-center"
              >
                <div className="text-5xl mb-2">🥉</div>
                <div className="text-2xl font-bold mb-2">{leaders[2].username}</div>
                <div className="text-primary text-xl font-bold mb-2">
                  {formatCredits(leaders[2].balance)}
                </div>
                <div className="text-sm text-gray-400">
                  {leaders[2].wins} / {leaders[2].totalRaces} wins
                </div>
                <div className="text-sm text-gray-400">
                  Win Rate: {leaders[2].winRate}%
                </div>
              </motion.div>
            </div>
          )}

          {/* Rest of Leaderboard */}
          <div className="bg-dark-card rounded-xl border border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-dark border-b border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left">Rank</th>
                  <th className="px-6 py-4 text-left">Player</th>
                  <th className="px-6 py-4 text-right">Balance</th>
                  <th className="px-6 py-4 text-right">Races</th>
                  <th className="px-6 py-4 text-right">Wins</th>
                  <th className="px-6 py-4 text-right">Win Rate</th>
                </tr>
              </thead>
              <tbody>
                {leaders.slice(3).map((leader, index) => (
                  <motion.tr
                    key={leader.username}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-gray-800 hover:bg-dark-lighter transition"
                  >
                    <td className="px-6 py-4 font-bold">{getRankMedal(index + 4)}</td>
                    <td className="px-6 py-4 font-semibold">{leader.username}</td>
                    <td className="px-6 py-4 text-right text-primary font-bold">
                      {formatCredits(leader.balance)}
                    </td>
                    <td className="px-6 py-4 text-right">{leader.totalRaces}</td>
                    <td className="px-6 py-4 text-right text-green-400">{leader.wins}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={leader.winRate >= 50 ? 'text-green-400' : 'text-gray-400'}>
                        {leader.winRate}%
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Leaderboard;

