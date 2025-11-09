import matchmakingService from '../services/matchmakingService.js'
import CardModel from '../models/CardModel.js'
import { v4 as uuidv4 } from 'uuid'

class BattleHandler {
  handleDeploy(socket, data) {
    const { cardId, position } = data
    const userId = socket.userId

    const matchData = matchmakingService.getPlayerMatch(userId)
    if (!matchData) {
      socket.emit('battle:error', { message: 'Not in a match' })
      return
    }

    const { matchId, state } = matchData
    const isPlayer1 = state.player1.userId === userId
    const player = isPlayer1 ? state.player1 : state.player2
    const opponent = isPlayer1 ? state.player2 : state.player1

    // Find card in deck
    const card = player.deck.cards.find(c => c.id == cardId)
    if (!card) {
      socket.emit('battle:error', { message: 'Card not in deck' })
      return
    }

    // Check elixir
    if (player.elixir < card.elixir_cost) {
      socket.emit('battle:error', { message: 'Not enough elixir' })
      return
    }

    // Deduct elixir
    player.elixir -= card.elixir_cost

    // Create unit
    const unit = {
      id: uuidv4(),
      cardId: card.id,
      name: card.name,
      type: card.type,
      hp: card.base_hp,
      maxHp: card.base_hp,
      damage: card.base_damage,
      speed: card.base_speed,
      range: card.base_range,
      attackSpeed: card.attack_speed,
      position: position,
      targetPosition: null,
      target: null,
      side: isPlayer1 ? 'player1' : 'player2',
      characterModel: card.character_model
    }

    player.units.push(unit)

    // Broadcast unit deployment to both players
    player.socket.emit('battle:unit_deployed', {
      unit,
      elixir: player.elixir,
      side: 'friendly'
    })

    opponent.socket.emit('battle:unit_deployed', {
      unit,
      side: 'enemy'
    })

    opponent.socket.emit('battle:opponent_elixir', {
      elixir: player.elixir
    })

    console.log(`Unit deployed in match ${matchId}: ${card.name} by user ${userId}`)
  }

  handleEmote(socket, data) {
    const { emoteId } = data
    const userId = socket.userId

    const matchData = matchmakingService.getPlayerMatch(userId)
    if (!matchData) return

    const { state } = matchData
    const isPlayer1 = state.player1.userId === userId
    const opponent = isPlayer1 ? state.player2 : state.player1

    opponent.socket.emit('battle:emote', { emoteId })
  }

  handleSurrender(socket) {
    const userId = socket.userId

    const matchData = matchmakingService.getPlayerMatch(userId)
    if (!matchData) return

    const { matchId, state } = matchData
    const isPlayer1 = state.player1.userId === userId
    const winnerId = isPlayer1 ? state.player2.userId : state.player1.userId

    matchmakingService.endMatch(matchId, winnerId)
  }

  handleDisconnect(socket) {
    const userId = socket.userId

    const matchData = matchmakingService.getPlayerMatch(userId)
    if (matchData) {
      const { matchId, state } = matchData
      const isPlayer1 = state.player1.userId === userId
      const winnerId = isPlayer1 ? state.player2.userId : state.player1.userId

      // End match with opponent as winner
      matchmakingService.endMatch(matchId, winnerId)
    }
  }

  // Handle unit updates (movement, combat, etc.)
  handleUnitUpdate(socket, data) {
    const { unitId, updates } = data
    const userId = socket.userId

    const matchData = matchmakingService.getPlayerMatch(userId)
    if (!matchData) return

    const { state } = matchData
    const isPlayer1 = state.player1.userId === userId
    const player = isPlayer1 ? state.player1 : state.player2
    const opponent = isPlayer1 ? state.player2 : state.player1

    const unitIndex = player.units.findIndex(u => u.id === unitId)
    if (unitIndex === -1) return

    // Update unit
    player.units[unitIndex] = {
      ...player.units[unitIndex],
      ...updates
    }

    // Broadcast to opponent
    opponent.socket.emit('battle:unit_update', {
      unitId,
      updates,
      side: 'enemy'
    })
  }

  handleTowerDamage(socket, data) {
    const { tower, damage } = data
    const userId = socket.userId

    const matchData = matchmakingService.getPlayerMatch(userId)
    if (!matchData) return

    const { matchId, state } = matchData
    const isPlayer1 = state.player1.userId === userId
    const opponent = isPlayer1 ? state.player2 : state.player1

    // Apply damage to opponent's tower
    opponent.towers[tower] = Math.max(0, opponent.towers[tower] - damage)

    // Broadcast tower damage
    opponent.socket.emit('battle:tower_damaged', {
      tower,
      health: opponent.towers[tower],
      side: 'friendly'
    })

    socket.emit('battle:tower_damaged', {
      tower,
      health: opponent.towers[tower],
      side: 'enemy'
    })

    // Check if tower destroyed
    if (opponent.towers[tower] <= 0) {
      socket.emit('battle:tower_destroyed', { tower, side: 'enemy' })
      opponent.socket.emit('battle:tower_destroyed', { tower, side: 'friendly' })

      // Check if king tower destroyed (instant win)
      if (tower === 'king') {
        matchmakingService.endMatch(matchId, userId)
      }
    }
  }
}

const battleHandler = new BattleHandler()
export default battleHandler

