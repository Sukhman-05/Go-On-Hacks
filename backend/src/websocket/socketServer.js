const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/auth');
const RacerModel = require('../models/RacerModel');
const RaceModel = require('../models/RaceModel');
const { simulateRace, calculateXPReward } = require('../services/raceSimulationService');
const { processPvPWager, resolveRaceBets } = require('../services/economyService');
const { joinQueue, leaveQueue, getQueueStatus } = require('../services/matchmakingService');
const { generateRaceSeed } = require('../utils/rng');
const raceRooms = require('./raceRooms');

let io;

/**
 * Initialize Socket.IO server
 */
function initializeSocketServer(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST']
    }
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication token required'));
    }

    try {
      const decoded = jwt.verify(token, jwtSecret);
      socket.userId = decoded.userId;
      socket.username = decoded.username;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.username} (${socket.userId})`);

    /**
     * Join matchmaking queue
     */
    socket.on('joinMatchmaking', async ({ racerId, wagerAmount }) => {
      try {
        const racer = await RacerModel.findById(racerId);
        
        if (!racer) {
          return socket.emit('error', { message: 'Racer not found' });
        }

        // Check ownership
        const ownsRacer = await RacerModel.belongsToUser(racerId, socket.userId);
        if (!ownsRacer) {
          return socket.emit('error', { message: 'You do not own this racer' });
        }

        // Join queue
        const match = joinQueue(socket.userId, racerId, racer, wagerAmount);

        if (match) {
          // Match found! Create race room
          const roomId = `race_${Date.now()}`;
          
          // Get both player sockets
          const player1Socket = socket;
          const player2Socket = Array.from(io.sockets.sockets.values())
            .find(s => s.userId === match.player2.userId);

          // Both join room
          player1Socket.join(roomId);
          if (player2Socket) {
            player2Socket.join(roomId);
          }

          // Create room
          raceRooms.createRoom(roomId, match.player1, match.player2, match.wagerAmount);

          // Notify both players
          io.to(roomId).emit('matchFound', {
            roomId,
            opponent: {
              name: match.player2.racer.name,
              stats: match.player2.racer.stats,
              rarity: match.player2.racer.rarity
            },
            wagerAmount: match.wagerAmount
          });

          // Start countdown after 3 seconds
          setTimeout(() => startRaceCountdown(roomId), 3000);
        } else {
          // Still waiting for match
          socket.emit('matchmaking', { status: 'searching' });
        }
      } catch (error) {
        console.error('Matchmaking error:', error);
        socket.emit('error', { message: 'Matchmaking failed' });
      }
    });

    /**
     * Leave matchmaking queue
     */
    socket.on('leaveMatchmaking', () => {
      leaveQueue(socket.userId);
      socket.emit('matchmaking', { status: 'left' });
    });

    /**
     * Get queue status
     */
    socket.on('queueStatus', () => {
      const status = getQueueStatus(socket.userId);
      socket.emit('queueStatus', status);
    });

    /**
     * Player ready for race
     */
    socket.on('playerReady', ({ roomId }) => {
      const room = raceRooms.getRoom(roomId);
      if (room) {
        socket.to(roomId).emit('opponentReady');
      }
    });

    /**
     * Handle disconnect
     */
    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.username} (${socket.userId})`);
      
      // Remove from queue
      leaveQueue(socket.userId);
      
      // Handle room disconnect (forfeit)
      const room = raceRooms.getRoomByUser(socket.userId);
      if (room && room.status === 'racing') {
        io.to(room.id).emit('playerDisconnected', {
          message: 'Opponent disconnected. You win by forfeit!'
        });
        raceRooms.deleteRoom(room.id);
      }
    });
  });

  console.log('🌐 WebSocket server initialized');
}

/**
 * Start race countdown and simulation
 */
async function startRaceCountdown(roomId) {
  const room = raceRooms.getRoom(roomId);
  if (!room) return;

  raceRooms.updateRoomStatus(roomId, 'countdown');

  // Countdown: 3, 2, 1, GO!
  for (let i = 3; i > 0; i--) {
    io.to(roomId).emit('countdown', { count: i });
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  io.to(roomId).emit('countdown', { count: 'GO!' });
  
  // Start race
  await startRace(roomId);
}

/**
 * Start and simulate race
 */
async function startRace(roomId) {
  const room = raceRooms.getRoom(roomId);
  if (!room) return;

  try {
    raceRooms.updateRoomStatus(roomId, 'racing');

    const player1 = room.players[0];
    const player2 = room.players[1];

    // Get racers
    const racer1 = await RacerModel.findById(player1.racerId);
    const racer2 = await RacerModel.findById(player2.racerId);

    // Generate seed and simulate
    const seed = generateRaceSeed(racer1.id, racer2.id);
    const raceResult = simulateRace(racer1, racer2, seed);

    // Store race data in room
    raceRooms.setRaceData(roomId, raceResult);

    // Emit race start
    io.to(roomId).emit('raceStart', {
      racer1: { id: racer1.id, name: racer1.name, stats: racer1.stats },
      racer2: { id: racer2.id, name: racer2.name, stats: racer2.stats }
    });

    // Broadcast frames (1 per second)
    const frameInterval = setInterval(() => {
      const frameData = raceRooms.getCurrentFrame(roomId);
      
      if (frameData) {
        io.to(roomId).emit('raceUpdate', frameData);
      }

      if (!raceRooms.advanceFrame(roomId)) {
        clearInterval(frameInterval);
        finishRace(roomId, raceResult);
      }
    }, 1000);

  } catch (error) {
    console.error('Race start error:', error);
    io.to(roomId).emit('error', { message: 'Race failed to start' });
  }
}

/**
 * Finish race and distribute rewards
 */
async function finishRace(roomId, raceResult) {
  const room = raceRooms.getRoom(roomId);
  if (!room) return;

  try {
    raceRooms.updateRoomStatus(roomId, 'finished');

    const player1 = room.players[0];
    const player2 = room.players[1];
    const winnerId = raceResult.winner === player1.racerId ? player1.userId : player2.userId;
    const loserRacerId = raceResult.winner === player1.racerId ? player2.racerId : player1.racerId;

    // Save race to database
    const race = await RaceModel.create(
      'pvp',
      [
        { racerId: player1.racerId, racerName: player1.racer.name, userId: player1.userId },
        { racerId: player2.racerId, racerName: player2.racer.name, userId: player2.userId }
      ],
      raceResult,
      raceResult.winner,
      null
    );

    // Add XP to both racers
    const winnerXP = calculateXPReward(true, raceResult.timeElapsed, 'pvp');
    const loserXP = calculateXPReward(false, raceResult.timeElapsed, 'pvp');
    
    await RacerModel.addXP(raceResult.winner, winnerXP);
    await RacerModel.addXP(loserRacerId, loserXP);

    // Process wager
    const { winnerPayout } = await processPvPWager(
      player1.userId,
      player2.userId,
      room.wagerAmount,
      race.id,
      winnerId
    );

    // Resolve bets
    await resolveRaceBets(race.id, raceResult.winner, 'pvp');

    // Emit race end
    io.to(roomId).emit('raceEnd', {
      winner: raceResult.winner,
      winnerId,
      finalPositions: raceResult.finalPositions,
      rewards: {
        winnerXP,
        loserXP,
        payout: winnerPayout
      }
    });

    // Clean up room after 10 seconds
    setTimeout(() => {
      raceRooms.deleteRoom(roomId);
    }, 10000);

  } catch (error) {
    console.error('Race finish error:', error);
    io.to(roomId).emit('error', { message: 'Failed to complete race' });
  }
}

/**
 * Get Socket.IO instance
 */
function getIO() {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
}

module.exports = {
  initializeSocketServer,
  getIO
};

