import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/useAuthStore'
import useCardStore from '../store/useCardStore'

function CardCollection() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const { userCards, fetchUserCards, upgradeCard, loading } = useCardStore()

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    fetchUserCards()
  }, [isAuthenticated, navigate, fetchUserCards])

  const handleUpgrade = async (cardId) => {
    const result = await upgradeCard(cardId)
    if (result) {
      alert('Card upgraded successfully!')
    }
  }

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'legendary': return 'from-yellow-400 to-orange-500'
      case 'epic': return 'from-purple-400 to-pink-500'
      case 'rare': return 'from-blue-400 to-cyan-500'
      default: return 'from-gray-400 to-gray-500'
    }
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
          Card Collection
        </h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : userCards.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-400 mb-4">You don&apos;t have any cards yet!</p>
            <p className="text-gray-500">Complete battles to earn cards</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {userCards.map((userCard) => (
              <div
                key={userCard.id}
                className="bg-indigo-900/50 rounded-xl border border-indigo-700 overflow-hidden hover:border-purple-500 transition group"
              >
                <div className={`h-2 bg-gradient-to-r ${getRarityColor(userCard.card.rarity)}`}></div>
                
                <div className="p-6">
                  <div className="aspect-square bg-indigo-950/50 rounded-lg mb-4 flex flex-col items-center justify-center group-hover:scale-110 transition">
                    <div className="text-6xl mb-2">{getCardIcon(userCard.card)}</div>
                    {userCard.card.character_model && (
                      <div className="text-xs text-purple-400 font-semibold">
                        {userCard.card.character_model}
                      </div>
                    )}
                  </div>

                  <h3 className="text-xl font-bold mb-2">{userCard.card.name}</h3>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Level:</span>
                      <span className="font-semibold text-purple-300">{userCard.level}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Elixir Cost:</span>
                      <span className="font-semibold text-purple-300">{userCard.card.elixir_cost}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Quantity:</span>
                      <span className="font-semibold text-purple-300">{userCard.quantity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Rarity:</span>
                      <span className={`font-semibold capitalize text-transparent bg-clip-text bg-gradient-to-r ${getRarityColor(userCard.card.rarity)}`}>
                        {userCard.card.rarity}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleUpgrade(userCard.id)}
                    className="w-full mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition text-sm font-medium"
                  >
                    Upgrade
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default CardCollection

