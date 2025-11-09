import { Server } from 'socket.io'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import matchmakingService from './services/matchmakingService.js'
import battleHandler from './websocket/battleHandler.js'

dotenv.config()

const SOCKET_PORT = process.env.SOCKET_PORT || 3002

const io = new Server(SOCKET_PORT, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})

// Authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token
  
  if (!token) {
    return next(new Error('Authentication error'))
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    socket.userId = decoded.userId
    next()
  } catch (err) {
    next(new Error('Authentication error'))
  }
})

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.userId}`)

  // Matchmaking
  socket.on('matchmaking:join', (data) => {
    matchmakingService.addToQueue(socket.userId, data.deckId, socket)
  })

  socket.on('matchmaking:leave', () => {
    matchmakingService.removeFromQueue(socket.userId)
  })

  // Battle events
  socket.on('battle:deploy', (data) => {
    battleHandler.handleDeploy(socket, data)
  })

  socket.on('battle:emote', (data) => {
    battleHandler.handleEmote(socket, data)
  })

  socket.on('battle:surrender', () => {
    battleHandler.handleSurrender(socket)
  })

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.userId}`)
    matchmakingService.removeFromQueue(socket.userId)
    battleHandler.handleDisconnect(socket)
  })
})

console.log(`🎮 Socket.IO Server running on port ${SOCKET_PORT}`)

export default io

