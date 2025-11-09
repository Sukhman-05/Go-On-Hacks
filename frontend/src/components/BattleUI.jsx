import { useState } from 'react'
import socketService from '../services/socketService'

function BattleUI({ elixir, playerTowers, opponentTowers, handCards, matchTime, onCardDeploy }) {
  const [selectedCard, setSelectedCard] = useState(null)
  const [showSurrenderConfirm, setShowSurrenderConfirm] = useState(false)

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleCardClick = (card) => {
    if (elixir >= card.elixir_cost) {
      setSelectedCard(card)
    }
  }

  const handleCanvasClick = (e) => {
    if (!selectedCard) return

    // Get click position relative to canvas
    const rect = e.target.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1

    // Convert to game coordinates (simplified)
    const position = {
      x: x * 8,
      z: y * 12
    }

    onCardDeploy(selectedCard, position)
    setSelectedCard(null)
  }

  const handleSurrender = () => {
    socketService.surrender()
    setShowSurrenderConfirm(false)
  }

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Top UI - Opponent Info */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 pointer-events-auto">
        <div className="bg-black/50 backdrop-blur-md rounded-xl px-6 py-3 flex items-center space-x-6">
          {/* Opponent Towers */}
          <div className="flex space-x-3">
            <TowerIndicator health={opponentTowers.left} maxHealth={2000} color="red" />
            <TowerIndicator health={opponentTowers.king} maxHealth={3000} color="red" isKing />
            <TowerIndicator health={opponentTowers.right} maxHealth={2000} color="red" />
          </div>
          
          {/* Timer */}
          <div className="text-center">
            <div className="text-3xl font-bold text-white">
              {formatTime(matchTime)}
            </div>
          </div>
        </div>
      </div>

      {/* Elixir Bar */}
      <div className="absolute top-1/2 right-4 transform -translate-y-1/2 pointer-events-auto">
        <div className="bg-black/50 backdrop-blur-md rounded-2xl p-4 flex flex-col items-center space-y-2">
          <div className="text-3xl font-bold text-purple-400">{elixir}</div>
          <div className="text-xs text-gray-400">ELIXIR</div>
          <div className="flex flex-col-reverse space-y-reverse space-y-1">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className={`w-8 h-3 rounded ${
                  i < elixir ? 'bg-purple-500' : 'bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom UI - Player Info & Cards */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-auto">
        <div className="bg-gradient-to-t from-black/80 to-transparent p-6">
          {/* Player Towers */}
          <div className="flex justify-center mb-4">
            <div className="bg-black/50 backdrop-blur-md rounded-xl px-6 py-3 flex space-x-3">
              <TowerIndicator health={playerTowers.left} maxHealth={2000} color="blue" />
              <TowerIndicator health={playerTowers.king} maxHealth={3000} color="blue" isKing />
              <TowerIndicator health={playerTowers.right} maxHealth={2000} color="blue" />
            </div>
          </div>

          {/* Hand Cards */}
          <div className="flex justify-center space-x-3 mb-4">
            {handCards.map((card, index) => (
              <CardSlot
                key={index}
                card={card}
                selected={selectedCard?.id === card.id}
                canDeploy={elixir >= card.elixir_cost}
                onClick={() => handleCardClick(card)}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setShowSurrenderConfirm(true)}
              className="px-4 py-2 bg-red-600/80 hover:bg-red-700 rounded-lg text-sm font-medium transition"
            >
              Surrender
            </button>
          </div>
        </div>
      </div>

      {/* Surrender Confirmation */}
      {showSurrenderConfirm && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center pointer-events-auto">
          <div className="bg-indigo-900 rounded-2xl p-8 max-w-md text-center">
            <h3 className="text-2xl font-bold mb-4">Surrender?</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to give up? You&apos;ll lose trophies.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowSurrenderConfirm(false)}
                className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSurrender}
                className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition"
              >
                Surrender
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Selected Card Indicator */}
      {selectedCard && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="text-center animate-pulse">
            <div className="text-xl font-bold text-white mb-2">{selectedCard.name}</div>
            <div className="text-sm text-gray-300">Click to deploy</div>
          </div>
        </div>
      )}
    </div>
  )
}

function TowerIndicator({ health, maxHealth, color, isKing = false }) {
  const healthPercent = (health / maxHealth) * 100
  const bgColor = color === 'red' ? 'bg-red-900' : 'bg-blue-900'
  const fillColor = color === 'red' ? 'bg-red-500' : 'bg-blue-500'

  return (
    <div className="flex flex-col items-center">
      <div className={`text-2xl ${isKing ? 'text-yellow-400' : 'text-gray-300'}`}>
        {isKing ? '👑' : '🏰'}
      </div>
      <div className={`w-16 h-2 ${bgColor} rounded-full overflow-hidden mt-1`}>
        <div
          className={`h-full ${fillColor} transition-all duration-300`}
          style={{ width: `${healthPercent}%` }}
        />
      </div>
      <div className="text-xs text-gray-400 mt-1">{health}</div>
    </div>
  )
}

function CardSlot({ card, selected, canDeploy, onClick }) {
  const getCardIcon = (card) => {
    if (!card) return '?'
    
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

  if (!card) {
    return (
      <div className="w-24 h-32 bg-gray-800/50 rounded-lg border-2 border-gray-700" />
    )
  }

  return (
    <div
      onClick={onClick}
      className={`w-24 h-32 rounded-lg border-2 transition-all cursor-pointer transform hover:scale-105 ${
        selected
          ? 'border-yellow-400 scale-105'
          : canDeploy
          ? 'border-purple-500 hover:border-purple-400'
          : 'border-gray-700 opacity-50 cursor-not-allowed'
      } ${
        canDeploy ? 'bg-gradient-to-b from-purple-900 to-indigo-900' : 'bg-gray-800'
      }`}
    >
      <div className="p-2 h-full flex flex-col justify-between">
        <div className="text-center">
          <div className="text-3xl mb-1">{getCardIcon(card)}</div>
          <div className="text-xs font-semibold truncate">{card.name}</div>
        </div>
        <div className="flex justify-center">
          <div className={`px-2 py-1 rounded ${canDeploy ? 'bg-purple-600' : 'bg-gray-600'} text-xs font-bold`}>
            {card.elixir_cost} ⚡
          </div>
        </div>
      </div>
    </div>
  )
}

export default BattleUI

