import UserModel from '../models/UserModel.js'
import DeckModel from '../models/DeckModel.js'
import MatchModel from '../models/MatchModel.js'

class MatchmakingService {
  constructor() {
    this.queue = []
    this.activeMatches = new Map()
  }

  async addToQueue(userId, deckId, socket) {
    // Remove if already in queue
    this.removeFromQueue(userId)

    const user = await UserModel.findById(userId)
    const deck = await DeckModel.findById(deckId)

    if (!user || !deck) {
      socket.emit('matchmaking:error', { message: 'Invalid user or deck' })
      return
    }

    this.queue.push({
      userId,
      user,
      deckId,
      deck,
      socket,
      trophies: user.trophies,
      timestamp: Date.now()
    })

    console.log(`User ${userId} joined matchmaking queue. Queue size: ${this.queue.length}`)

    // Try to find a match
    this.tryMatchmaking()
  }

  removeFromQueue(userId) {
    const index = this.queue.findIndex(p => p.userId === userId)
    if (index !== -1) {
      this.queue.splice(index, 1)
      console.log(`User ${userId} left matchmaking queue`)
    }
  }

  async tryMatchmaking() {
    if (this.queue.length < 2) return

    // Sort by waiting time (fairness)
    this.queue.sort((a, b) => a.timestamp - b.timestamp)

    const player1 = this.queue[0]
    let player2 = null

    // Find best match based on trophies (within 200 range)
    for (let i = 1; i < this.queue.length; i++) {
      const candidate = this.queue[i]
      const trophyDiff = Math.abs(player1.trophies - candidate.trophies)
      
      if (trophyDiff <= 200) {
        player2 = candidate
        break
      }
    }

    // If no good match, pair with anyone after 10 seconds
    if (!player2 && Date.now() - player1.timestamp > 10000) {
      player2 = this.queue[1]
    }

    if (player2) {
      // Remove from queue
      this.removeFromQueue(player1.userId)
      this.removeFromQueue(player2.userId)

      // Create match
      await this.createMatch(player1, player2)
    }
  }

  async createMatch(player1, player2) {
    try {
      // Create match in database
      const match = await MatchModel.create(player1.userId, player2.userId)

      // Create match state
      const matchState = {
        matchId: match.id,
        player1: {
          userId: player1.userId,
          username: player1.user.username,
          trophies: player1.user.trophies,
          deck: player1.deck,
          socket: player1.socket,
          elixir: 5,
          towers: { left: 2000, right: 2000, king: 3000 },
          units: []
        },
        player2: {
          userId: player2.userId,
          username: player2.user.username,
          trophies: player2.user.trophies,
          deck: player2.deck,
          socket: player2.socket,
          elixir: 5,
          towers: { left: 2000, right: 2000, king: 3000 },
          units: []
        },
        startTime: Date.now(),
        elapsedTime: 0,
        isOvertimeActive: false
      }

      this.activeMatches.set(match.id, matchState)

      // Notify both players
      player1.socket.emit('matchmaking:found', {
        matchId: match.id,
        opponent: {
          userId: player2.userId,
          username: player2.user.username,
          trophies: player2.user.trophies
        },
        playerSide: 'player1',
        deck: player1.deck
      })

      player2.socket.emit('matchmaking:found', {
        matchId: match.id,
        opponent: {
          userId: player1.userId,
          username: player1.user.username,
          trophies: player1.user.trophies
        },
        playerSide: 'player2',
        deck: player2.deck
      })

      console.log(`Match created: ${match.id} - ${player1.user.username} vs ${player2.user.username}`)

      // Start match timer and elixir generation
      this.startMatch(match.id)
    } catch (error) {
      console.error('Failed to create match:', error)
    }
  }

  startMatch(matchId) {
    const matchState = this.activeMatches.get(matchId)
    if (!matchState) return

    // Elixir generation (1 elixir every 2.8 seconds)
    const elixirInterval = setInterval(() => {
      const state = this.activeMatches.get(matchId)
      if (!state) {
        clearInterval(elixirInterval)
        return
      }

      // Add elixir to both players
      if (state.player1.elixir < 10) {
        state.player1.elixir = Math.min(10, state.player1.elixir + 1)
        state.player1.socket.emit('battle:elixir_update', { elixir: state.player1.elixir })
      }

      if (state.player2.elixir < 10) {
        state.player2.elixir = Math.min(10, state.player2.elixir + 1)
        state.player2.socket.emit('battle:elixir_update', { elixir: state.player2.elixir })
      }
    }, 2800)

    // Match timer (3 minutes = 180 seconds)
    const timerInterval = setInterval(() => {
      const state = this.activeMatches.get(matchId)
      if (!state) {
        clearInterval(timerInterval)
        clearInterval(elixirInterval)
        return
      }

      state.elapsedTime = Math.floor((Date.now() - state.startTime) / 1000)

      // Broadcast timer update
      const timeRemaining = 180 - state.elapsedTime
      state.player1.socket.emit('battle:timer_update', { timeRemaining })
      state.player2.socket.emit('battle:timer_update', { timeRemaining })

      // Check if time is up
      if (state.elapsedTime >= 180) {
        clearInterval(timerInterval)
        clearInterval(elixirInterval)
        this.endMatch(matchId)
      }
    }, 1000)
  }

  async endMatch(matchId, winnerId = null) {
    const matchState = this.activeMatches.get(matchId)
    if (!matchState) return

    // Determine winner if not provided
    if (!winnerId) {
      const p1Towers = matchState.player1.towers
      const p2Towers = matchState.player2.towers
      
      const p1TotalHP = p1Towers.left + p1Towers.right + p1Towers.king
      const p2TotalHP = p2Towers.left + p2Towers.right + p2Towers.king

      if (p1TotalHP > p2TotalHP) {
        winnerId = matchState.player1.userId
      } else if (p2TotalHP > p1TotalHP) {
        winnerId = matchState.player2.userId
      } else {
        // Draw - no winner
        winnerId = null
      }
    }

    // Calculate trophy changes
    const trophyChange = 30
    const p1TrophiesChange = winnerId === matchState.player1.userId ? trophyChange : -trophyChange
    const p2TrophiesChange = winnerId === matchState.player2.userId ? trophyChange : -trophyChange

    // Calculate gold rewards
    const winnerGold = 50
    const loserGold = 20
    const p1Gold = winnerId === matchState.player1.userId ? winnerGold : loserGold
    const p2Gold = winnerId === matchState.player2.userId ? winnerGold : loserGold

    // Update database
    await MatchModel.complete(
      matchId,
      winnerId,
      p1TrophiesChange,
      p2TrophiesChange,
      p1Gold,
      p2Gold,
      matchState.elapsedTime
    )

    // Update user trophies and gold
    const p1 = await UserModel.findById(matchState.player1.userId)
    const p2 = await UserModel.findById(matchState.player2.userId)
    
    await UserModel.updateTrophies(matchState.player1.userId, p1.trophies + p1TrophiesChange)
    await UserModel.updateTrophies(matchState.player2.userId, p2.trophies + p2TrophiesChange)
    await UserModel.updateCurrency(matchState.player1.userId, p1Gold, 0)
    await UserModel.updateCurrency(matchState.player2.userId, p2Gold, 0)

    // Update win/loss stats
    if (winnerId === matchState.player1.userId) {
      await UserModel.updateStats(matchState.player1.userId, 1, 0)
      await UserModel.updateStats(matchState.player2.userId, 0, 1)
    } else if (winnerId === matchState.player2.userId) {
      await UserModel.updateStats(matchState.player1.userId, 0, 1)
      await UserModel.updateStats(matchState.player2.userId, 1, 0)
    }

    // Notify players
    const results = {
      winnerId,
      trophiesChange: p1TrophiesChange,
      goldEarned: p1Gold
    }

    matchState.player1.socket.emit('battle:end', {
      ...results,
      trophiesChange: p1TrophiesChange,
      goldEarned: p1Gold,
      result: winnerId === matchState.player1.userId ? 'victory' : winnerId === matchState.player2.userId ? 'defeat' : 'draw'
    })

    matchState.player2.socket.emit('battle:end', {
      ...results,
      trophiesChange: p2TrophiesChange,
      goldEarned: p2Gold,
      result: winnerId === matchState.player2.userId ? 'victory' : winnerId === matchState.player1.userId ? 'defeat' : 'draw'
    })

    // Remove from active matches
    this.activeMatches.delete(matchId)
    
    console.log(`Match ${matchId} ended. Winner: ${winnerId}`)
  }

  getMatchState(matchId) {
    return this.activeMatches.get(matchId)
  }

  getPlayerMatch(userId) {
    for (const [matchId, state] of this.activeMatches.entries()) {
      if (state.player1.userId === userId || state.player2.userId === userId) {
        return { matchId, state }
      }
    }
    return null
  }
}

const matchmakingService = new MatchmakingService()
export default matchmakingService

