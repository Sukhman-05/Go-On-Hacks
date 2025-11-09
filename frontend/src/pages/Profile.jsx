import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/useAuthStore'

function Profile() {
  const navigate = useNavigate()
  const { isAuthenticated, user, fetchUser } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    if (!user) {
      fetchUser()
    }
  }, [isAuthenticated, user, navigate, fetchUser])

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          Player Profile
        </h1>

        <div className="bg-indigo-900/50 rounded-xl border border-indigo-700 p-8 mb-8">
          <div className="flex items-center space-x-6 mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-4xl font-bold">
              {user.username[0].toUpperCase()}
            </div>
            <div>
              <h2 className="text-3xl font-bold">{user.username}</h2>
              <p className="text-gray-400">{user.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-indigo-950/50 p-6 rounded-xl text-center">
              <div className="text-3xl font-bold text-yellow-400">{user.trophies || 0}</div>
              <div className="text-sm text-gray-400 mt-2">Trophies</div>
            </div>
            <div className="bg-indigo-950/50 p-6 rounded-xl text-center">
              <div className="text-3xl font-bold text-purple-400">{user.level || 1}</div>
              <div className="text-sm text-gray-400 mt-2">Level</div>
            </div>
            <div className="bg-indigo-950/50 p-6 rounded-xl text-center">
              <div className="text-3xl font-bold text-yellow-400">{user.gold || 0}</div>
              <div className="text-sm text-gray-400 mt-2">Gold</div>
            </div>
            <div className="bg-indigo-950/50 p-6 rounded-xl text-center">
              <div className="text-3xl font-bold text-pink-400">{user.gems || 0}</div>
              <div className="text-sm text-gray-400 mt-2">Gems</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-indigo-900/50 rounded-xl border border-indigo-700 p-6">
            <h3 className="text-xl font-semibold mb-4">Battle Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Wins:</span>
                <span className="font-semibold">{user.wins || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Losses:</span>
                <span className="font-semibold">{user.losses || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Win Rate:</span>
                <span className="font-semibold">
                  {user.wins && user.losses 
                    ? `${((user.wins / (user.wins + user.losses)) * 100).toFixed(1)}%`
                    : '0%'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-indigo-900/50 rounded-xl border border-indigo-700 p-6">
            <h3 className="text-xl font-semibold mb-4">Account Info</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Member Since:</span>
                <span className="font-semibold">
                  {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Arena:</span>
                <span className="font-semibold">Arena 1</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Best Trophies:</span>
                <span className="font-semibold">{user.best_trophies || user.trophies || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile

