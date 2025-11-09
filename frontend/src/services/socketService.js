import { io } from 'socket.io-client';
import { useAuthStore } from '../store/useAuthStore';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3002';

let socket = null;

export const connectSocket = () => {
  const token = useAuthStore.getState().token;
  
  if (!token) {
    console.error('Cannot connect socket: No auth token');
    return null;
  }

  if (socket?.connected) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    auth: { token }
  });

  socket.on('connect', () => {
    console.log('🔌 Socket connected');
  });

  socket.on('disconnect', () => {
    console.log('🔌 Socket disconnected');
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;

// Matchmaking
export const joinMatchmaking = (racerId, wagerAmount) => {
  if (!socket) return;
  socket.emit('joinMatchmaking', { racerId, wagerAmount });
};

export const leaveMatchmaking = () => {
  if (!socket) return;
  socket.emit('leaveMatchmaking');
};

export const getQueueStatus = () => {
  if (!socket) return;
  socket.emit('queueStatus');
};

// Race events
export const sendPlayerReady = (roomId) => {
  if (!socket) return;
  socket.emit('playerReady', { roomId });
};

// Event listeners
export const onMatchFound = (callback) => {
  if (!socket) return;
  socket.on('matchFound', callback);
};

export const onMatchmaking = (callback) => {
  if (!socket) return;
  socket.on('matchmaking', callback);
};

export const onCountdown = (callback) => {
  if (!socket) return;
  socket.on('countdown', callback);
};

export const onRaceStart = (callback) => {
  if (!socket) return;
  socket.on('raceStart', callback);
};

export const onRaceUpdate = (callback) => {
  if (!socket) return;
  socket.on('raceUpdate', callback);
};

export const onRaceEnd = (callback) => {
  if (!socket) return;
  socket.on('raceEnd', callback);
};

export const onPlayerDisconnected = (callback) => {
  if (!socket) return;
  socket.on('playerDisconnected', callback);
};

// Remove listeners
export const removeAllListeners = () => {
  if (!socket) return;
  socket.removeAllListeners();
};

export default {
  connectSocket,
  disconnectSocket,
  getSocket,
  joinMatchmaking,
  leaveMatchmaking,
  getQueueStatus,
  sendPlayerReady,
  onMatchFound,
  onMatchmaking,
  onCountdown,
  onRaceStart,
  onRaceUpdate,
  onRaceEnd,
  onPlayerDisconnected,
  removeAllListeners
};

