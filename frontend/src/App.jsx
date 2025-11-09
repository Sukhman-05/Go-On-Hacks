import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Summon from './pages/Summon';
import RaceSetup from './pages/RaceSetup';
import RaceViewer from './pages/RaceViewer';
import Results from './pages/Results';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';

function App() {
  const { token } = useAuthStore();

  // Protected route wrapper
  const ProtectedRoute = ({ children }) => {
    return token ? children : <Navigate to="/login" />;
  };

  return (
    <div className="min-h-screen bg-dark">
      {token && <Navbar />}
      
      <Routes>
        {/* Auth routes */}
        <Route 
          path="/login" 
          element={token ? <Navigate to="/" /> : <Login />} 
        />
        <Route 
          path="/register" 
          element={token ? <Navigate to="/" /> : <Register />} 
        />

        {/* Protected routes */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/summon" 
          element={
            <ProtectedRoute>
              <Summon />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/race" 
          element={
            <ProtectedRoute>
              <RaceSetup />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/race/:raceId" 
          element={
            <ProtectedRoute>
              <RaceViewer />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/results" 
          element={
            <ProtectedRoute>
              <Results />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/leaderboard" 
          element={
            <ProtectedRoute>
              <Leaderboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;

