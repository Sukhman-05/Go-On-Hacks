import { Link } from 'react-router-dom'
import useAuthStore from '../store/useAuthStore'

function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore()

  return (
    <nav className="bg-indigo-900/50 backdrop-blur-md border-b border-indigo-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center space-x-3">
            <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
              ⚔️ Clash Royale 3D
            </div>
          </Link>

          <div className="flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                <Link to="/battle" className="hover:text-purple-300 transition">
                  Battle
                </Link>
                <Link to="/deck" className="hover:text-purple-300 transition">
                  Deck
                </Link>
                <Link to="/cards" className="hover:text-purple-300 transition">
                  Cards
                </Link>
                <Link to="/profile" className="hover:text-purple-300 transition">
                  Profile
                </Link>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-purple-300">{user?.username}</span>
                  <button
                    onClick={logout}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 hover:text-purple-300 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar

