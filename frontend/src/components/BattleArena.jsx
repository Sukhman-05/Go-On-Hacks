import { useEffect, useRef, useState } from 'react'
import BattleScene from '../game/BattleScene'
import assetLoader from '../game/AssetLoader'
import socketService from '../services/socketService'
import useGameStore from '../store/useGameStore'
import BattleUI from './BattleUI'

function BattleArena() {
  const canvasRef = useRef(null)
  const sceneRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)
  
  const {
    playerElixir,
    playerTowers,
    opponentTowers,
    handCards,
    matchTime,
    updatePlayerElixir,
    updateTowerHealth,
    addUnit,
    setHandCards,
    updateMatchTime
  } = useGameStore()

  useEffect(() => {
    const initScene = async () => {
      try {
        setLoadingProgress(20)
        
        // Initialize scene
        const scene = new BattleScene(canvasRef.current)
        sceneRef.current = scene
        
        setLoadingProgress(40)
        
        // Load 3D models
        await assetLoader.loadAllCharacters()
        
        setLoadingProgress(100)
        setLoading(false)

        console.log('Battle scene initialized')
      } catch (error) {
        console.error('Failed to initialize scene:', error)
        setLoading(false)
      }
    }

    initScene()

    // Initialize hand cards with some placeholder cards
    if (handCards.length === 0) {
      // These will be replaced with actual deck cards when match starts
      const placeholderCards = [
        { id: 1, name: 'Knight', elixir_cost: 3 },
        { id: 2, name: 'Archer', elixir_cost: 3 },
        { id: 3, name: 'Giant', elixir_cost: 5 },
        { id: 4, name: 'Fireball', elixir_cost: 4 }
      ]
      setHandCards(placeholderCards)
    }

    // Socket event listeners
    socketService.on('battle:elixir_update', (data) => {
      updatePlayerElixir(data.elixir - playerElixir)
    })

    socketService.on('battle:unit_deployed', (data) => {
      if (sceneRef.current) {
        const unit = sceneRef.current.spawnUnit(
          data.unit.name,
          data.unit.position,
          data.side
        )
        addUnit(data.side === 'friendly' ? 'player' : 'opponent', {
          ...data.unit,
          sceneUnit: unit
        })
      }
    })

    socketService.on('battle:tower_damaged', (data) => {
      updateTowerHealth(
        data.side === 'friendly' ? 'player' : 'opponent',
        data.tower,
        data.health
      )
      
      if (sceneRef.current) {
        sceneRef.current.updateTowerHealth(
          data.side === 'friendly' ? 'player' : 'opponent',
          data.tower,
          data.health,
          2000
        )
      }
    })

    socketService.on('battle:timer_update', (data) => {
      updateMatchTime(data.timeRemaining)
    })

    return () => {
      if (sceneRef.current) {
        sceneRef.current.dispose()
      }
      socketService.off('battle:elixir_update')
      socketService.off('battle:unit_deployed')
      socketService.off('battle:tower_damaged')
      socketService.off('battle:timer_update')
    }
  }, [])

  const handleCardDeploy = (card, position) => {
    if (playerElixir < card.elixir_cost) {
      console.log('Not enough elixir')
      return
    }

    socketService.deployCard(card.id, position)
    updatePlayerElixir(-card.elixir_cost)
  }

  if (loading) {
    return (
      <div className="w-full h-screen bg-gradient-to-b from-indigo-950 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-64 h-4 bg-gray-700 rounded-full overflow-hidden mb-4">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
          <h2 className="text-2xl font-bold mb-2">Loading Battle Arena...</h2>
          <p className="text-gray-300">{loadingProgress}%</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-screen">
      <canvas ref={canvasRef} className="absolute inset-0" />
      <BattleUI
        elixir={playerElixir}
        playerTowers={playerTowers}
        opponentTowers={opponentTowers}
        handCards={handCards}
        matchTime={matchTime}
        onCardDeploy={handleCardDeploy}
      />
    </div>
  )
}

export default BattleArena
