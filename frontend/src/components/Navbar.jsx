import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { formatCredits } from '../utils/formatters';

function Navbar() {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-dark-card border-b border-primary/20 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            🏁 Sperm Racing
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            <Link
              to="/"
              className={`hover:text-primary transition ${
                isActive('/') ? 'text-primary' : 'text-gray-300'
              }`}
            >
              Home
            </Link>
            <Link
              to="/summon"
              className={`hover:text-primary transition ${
                isActive('/summon') ? 'text-primary' : 'text-gray-300'
              }`}
            >
              Summon
            </Link>
            <Link
              to="/race"
              className={`hover:text-primary transition ${
                isActive('/race') ? 'text-primary' : 'text-gray-300'
              }`}
            >
              Race
            </Link>
            <Link
              to="/leaderboard"
              className={`hover:text-primary transition ${
                isActive('/leaderboard') ? 'text-primary' : 'text-gray-300'
              }`}
            >
              Leaderboard
            </Link>
            <Link
              to="/profile"
              className={`hover:text-primary transition ${
                isActive('/profile') ? 'text-primary' : 'text-gray-300'
              }`}
            >
              Profile
            </Link>
          </div>

          {/* User Info */}
          <div className="flex items-center space-x-4">
            <div className="bg-dark px-4 py-2 rounded-lg border border-primary/30">
              <span className="text-primary font-bold">
                {formatCredits(user?.wallet_balance || 0)}
              </span>
            </div>
            <div className="text-sm text-gray-400">
              {user?.username}
            </div>
            <button
              onClick={logout}
              className="text-sm text-gray-400 hover:text-red-400 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

