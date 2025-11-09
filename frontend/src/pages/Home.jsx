import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import useAuthStore from '../store/useAuthStore'

function Home() {
  const navigate = useNavigate()
  const { isAuthenticated, user, fetchUser } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated && !user) {
      fetchUser()
    }
  }, [isAuthenticated, user, fetchUser])

  const handlePlayNow = () => {
    if (isAuthenticated) {
      navigate('/battle')
    } else {
      navigate('/login')
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4">
      <div className="text-center space-y-8 max-w-4xl">
        <h1 className="text-6xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
          Battle Arena
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-300">
          Deploy your troops, destroy towers, and climb the ranks in this epic 3D tower defense game
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
          <button
            onClick={handlePlayNow}
            className="px-8 py-4 text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl shadow-lg transform hover:scale-105 transition-all"
          >
            ⚔️ Play Now
          </button>
          
          {!isAuthenticated && (
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-4 text-lg font-bold bg-indigo-900/50 hover:bg-indigo-800/50 border-2 border-purple-500 rounded-xl transform hover:scale-105 transition-all"
            >
              Create Account
            </button>
          )}
        </div>

        {isAuthenticated && user && (
          <div className="pt-12 grid grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="bg-indigo-900/50 p-6 rounded-xl border border-indigo-700">
              <div className="text-3xl font-bold text-yellow-400">{user.trophies || 0}</div>
              <div className="text-sm text-gray-400 mt-1">Trophies</div>
            </div>
            <div className="bg-indigo-900/50 p-6 rounded-xl border border-indigo-700">
              <div className="text-3xl font-bold text-yellow-400">{user.gold || 0}</div>
              <div className="text-sm text-gray-400 mt-1">Gold</div>
            </div>
            <div className="bg-indigo-900/50 p-6 rounded-xl border border-indigo-700">
              <div className="text-3xl font-bold text-purple-400">{user.level || 1}</div>
              <div className="text-sm text-gray-400 mt-1">Level</div>
            </div>
          </div>
        )}

        <div className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="bg-indigo-900/30 p-6 rounded-xl border border-indigo-700">
            <div className="text-4xl mb-3">🎮</div>
            <h3 className="text-xl font-bold mb-2">Real-Time Battles</h3>
            <p className="text-gray-400">Fight against players worldwide in intense 3-minute battles</p>
          </div>
          <div className="bg-indigo-900/30 p-6 rounded-xl border border-indigo-700">
            <div className="text-4xl mb-3">🃏</div>
            <h3 className="text-xl font-bold mb-2">Collect & Upgrade</h3>
            <p className="text-gray-400">Build your deck with powerful cards and upgrade them</p>
          </div>
          <div className="bg-indigo-900/30 p-6 rounded-xl border border-indigo-700">
            <div className="text-4xl mb-3">🏆</div>
            <h3 className="text-xl font-bold mb-2">Climb the Ranks</h3>
            <p className="text-gray-400">Earn trophies and compete on the global leaderboard</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home

