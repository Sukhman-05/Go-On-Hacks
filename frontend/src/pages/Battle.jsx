import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/useAuthStore'
import useCardStore from '../store/useCardStore'
import socketService from '../services/socketService'
import BattleArena from '../components/BattleArena'

function Battle() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const { selectedDeck, decks, fetchDecks } = useCardStore()
  const [matchmaking, setMatchmaking] = useState(false)
  const [inBattle, setInBattle] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    fetchDecks()
    socketService.connect()

    socketService.on('matchmaking:found', (data) => {
      console.log('Match found:', data)
      setMatchmaking(false)
      setInBattle(true)
    })

    socketService.on('battle:end', (data) => {
      console.log('Battle ended:', data)
      setInBattle(false)
      // Show results modal
    })

    return () => {
      socketService.leaveMatchmaking()
      socketService.disconnect()
    }
  }, [isAuthenticated, navigate, fetchDecks])

  const handleStartMatchmaking = () => {
    if (!selectedDeck && decks.length > 0) {
      alert('Please select a deck first!')
      navigate('/deck')
      return
    }
    
    setMatchmaking(true)
    socketService.joinMatchmaking(selectedDeck?.id || decks[0]?.id)
  }

  const handleCancelMatchmaking = () => {
    setMatchmaking(false)
    socketService.leaveMatchmaking()
  }

  if (inBattle) {
    return <BattleArena />
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4">
      <div className="text-center space-y-8 max-w-2xl">
        {!matchmaking ? (
          <>
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
              Ready for Battle?
            </h1>
            
            <div className="bg-indigo-900/50 p-6 rounded-xl border border-indigo-700">
              <h3 className="text-xl font-semibold mb-4">Selected Deck</h3>
              {selectedDeck || (decks.length > 0 && decks[0]) ? (
                <p className="text-lg text-purple-300">
                  {(selectedDeck || decks[0]).name}
                </p>
              ) : (
                <div>
                  <p className="text-gray-400 mb-4">No deck selected</p>
                  <button
                    onClick={() => navigate('/deck')}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
                  >
                    Create a Deck
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleStartMatchmaking}
              disabled={!selectedDeck && decks.length === 0}
              className="px-12 py-4 text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-xl shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ⚔️ Find Match
            </button>

            <button
              onClick={() => navigate('/deck')}
              className="block mx-auto text-purple-400 hover:text-purple-300 transition"
            >
              Change Deck →
            </button>
          </>
        ) : (
          <>
            <div className="animate-pulse">
              <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                Finding Opponent...
              </h1>
            </div>

            <div className="flex justify-center">
              <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>

            <p className="text-xl text-gray-300">
              Searching for a worthy opponent
            </p>

            <button
              onClick={handleCancelMatchmaking}
              className="px-8 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default Battle

