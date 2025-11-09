/**
 * WebSocket server entry point
 * Run this separately for Socket.IO server
 */

const http = require('http');
const { initializeSocketServer } = require('./websocket/socketServer');
require('dotenv').config();

const server = http.createServer();

// Initialize WebSocket server
initializeSocketServer(server);

// Start server
const SOCKET_PORT = process.env.SOCKET_PORT || 3002;
server.listen(SOCKET_PORT, () => {
  console.log(`\n🌐 WebSocket Server (Socket.IO)`);
  console.log(`📡 Listening on port ${SOCKET_PORT}`);
  console.log(`🏁 Ready for PvP racing!\n`);
});

module.exports = server;

