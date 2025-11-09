import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/useAuthStore'
import useCardStore from '../store/useCardStore'

function DeckBuilder() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const { decks, userCards, fetchDecks, fetchUserCards, createDeck, selectDeck } = useCardStore()
  const [selectedCards, setSelectedCards] = useState([])
  const [deckName, setDeckName] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    fetchDecks()
    fetchUserCards()
  }, [isAuthenticated, navigate, fetchDecks, fetchUserCards])

  const handleCardClick = (card) => {
    if (selectedCards.find(c => c.id === card.id)) {
      setSelectedCards(selectedCards.filter(c => c.id !== card.id))
    } else if (selectedCards.length < 8) {
      setSelectedCards([...selectedCards, card])
    }
  }

  const handleCreateDeck = async () => {
    if (selectedCards.length !== 8) {
      alert('Please select exactly 8 cards')
      return
    }
    if (!deckName.trim()) {
      alert('Please enter a deck name')
      return
    }

    const cardIds = selectedCards.map(c => c.id)
    const newDeck = await createDeck(deckName, cardIds)
    if (newDeck) {
      setSelectedCards([])
      setDeckName('')
      setShowCreateForm(false)
    }
  }

  const handleSelectDeck = (deck) => {
    selectDeck(deck)
    alert(`Deck "${deck.name}" selected!`)
  }

  const getCardIcon = (card) => {
    // Return icon based on character model or type
    if (card.character_model) {
      const icons = {
        'Knight': '⚔️',
        'Barbarian': '🪓',
        'Mage': '🔮',
        'Ranger': '🏹',
        'Rogue': '🗡️'
      }
      return icons[card.character_model] || '⚔️'
    }
    
    if (card.type === 'spell') return '✨'
    if (card.type === 'building') return '🏰'
    return '⚔️'
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          Deck Builder
        </h1>

        {/* Existing Decks */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Your Decks</h2>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
            >
              {showCreateForm ? 'Cancel' : '+ New Deck'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {decks.map((deck) => (
              <div
                key={deck.id}
                className="bg-indigo-900/50 p-6 rounded-xl border border-indigo-700 hover:border-purple-500 transition cursor-pointer"
                onClick={() => handleSelectDeck(deck)}
              >
                <h3 className="text-xl font-semibold mb-3">{deck.name}</h3>
                <div className="grid grid-cols-4 gap-2">
                  {deck.cards?.map((card, idx) => (
                    <div key={idx} className="aspect-square bg-indigo-950/50 rounded-lg flex flex-col items-center justify-center">
                      <div className="text-2xl">{getCardIcon(card)}</div>
                      <div className="text-xs text-purple-400 mt-1">{card.elixir_cost}⚡</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Create New Deck */}
        {showCreateForm && (
          <div className="mb-12 bg-indigo-900/30 p-6 rounded-xl border border-indigo-700">
            <h2 className="text-2xl font-semibold mb-4">Create New Deck</h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Deck Name</label>
              <input
                type="text"
                value={deckName}
                onChange={(e) => setDeckName(e.target.value)}
                className="w-full max-w-md px-4 py-2 bg-indigo-950/50 border border-indigo-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                placeholder="My Awesome Deck"
              />
            </div>

            <div className="mb-6">
              <div className="text-sm font-medium mb-2">
                Selected Cards: {selectedCards.length}/8
              </div>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                {selectedCards.map((card, idx) => (
                  <div
                    key={idx}
                    className="aspect-square bg-purple-900/50 rounded-lg flex flex-col items-center justify-center border-2 border-purple-500"
                  >
                    <div className="text-3xl">{getCardIcon(card)}</div>
                    <div className="text-xs text-purple-300 mt-1">{card.elixir_cost}⚡</div>
                  </div>
                ))}
                {[...Array(8 - selectedCards.length)].map((_, idx) => (
                  <div
                    key={`empty-${idx}`}
                    className="aspect-square bg-indigo-950/30 rounded-lg border-2 border-dashed border-indigo-700 flex items-center justify-center text-gray-600"
                  >
                    ?
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleCreateDeck}
              disabled={selectedCards.length !== 8 || !deckName.trim()}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Deck
            </button>
          </div>
        )}

        {/* Available Cards */}
        {showCreateForm && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Available Cards</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {userCards.map((userCard) => (
                <div
                  key={userCard.id}
                  onClick={() => handleCardClick(userCard.card)}
                  className={`bg-indigo-900/50 p-4 rounded-xl border-2 cursor-pointer transition ${
                    selectedCards.find(c => c.id === userCard.card.id)
                      ? 'border-purple-500 scale-95'
                      : 'border-indigo-700 hover:border-purple-400'
                  }`}
                >
                  <div className="aspect-square bg-indigo-950/50 rounded-lg mb-2 flex flex-col items-center justify-center">
                    <div className="text-4xl mb-1">{getCardIcon(userCard.card)}</div>
                    {userCard.card.character_model && (
                      <div className="text-xs text-purple-400 font-medium">
                        {userCard.card.character_model}
                      </div>
                    )}
                  </div>
                  <div className="text-sm font-semibold text-center">{userCard.card.name}</div>
                  <div className="text-xs text-center text-gray-400 mt-1">
                    Lvl {userCard.level} | Cost: {userCard.card.elixir_cost} ⚡
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DeckBuilder

