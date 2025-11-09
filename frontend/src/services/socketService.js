import { io } from 'socket.io-client'

class SocketService {
  constructor() {
    this.socket = null
    this.connected = false
  }

  connect() {
    const token = localStorage.getItem('token')
    
    this.socket = io('http://localhost:3002', {
      auth: { token },
      transports: ['websocket'],
    })

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id)
      this.connected = true
    })

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected')
      this.connected = false
    })

    this.socket.on('error', (error) => {
      console.error('Socket error:', error)
    })

    return this.socket
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.connected = false
    }
  }

  emit(event, data) {
    if (this.socket && this.connected) {
      this.socket.emit(event, data)
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback)
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback)
    }
  }

  // Matchmaking
  joinMatchmaking(deckId) {
    this.emit('matchmaking:join', { deckId })
  }

  leaveMatchmaking() {
    this.emit('matchmaking:leave')
  }

  // Battle actions
  deployCard(cardId, position) {
    this.emit('battle:deploy', { cardId, position })
  }

  emote(emoteId) {
    this.emit('battle:emote', { emoteId })
  }

  surrender() {
    this.emit('battle:surrender')
  }
}

const socketService = new SocketService()
export default socketService

