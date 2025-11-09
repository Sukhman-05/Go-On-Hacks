import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Battle from './pages/Battle'
import DeckBuilder from './pages/DeckBuilder'
import CardCollection from './pages/CardCollection'
import Profile from './pages/Profile'
import Navbar from './components/Navbar'

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/battle" element={<Battle />} />
            <Route path="/deck" element={<DeckBuilder />} />
            <Route path="/cards" element={<CardCollection />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App

