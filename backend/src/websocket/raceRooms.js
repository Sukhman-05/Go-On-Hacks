/**
 * Race room management for PvP racing
 */

class RaceRooms {
  constructor() {
    this.rooms = new Map(); // roomId -> room data
    this.userRooms = new Map(); // userId -> roomId
  }

  /**
   * Create a new race room
   */
  createRoom(roomId, player1, player2, wagerAmount) {
    const room = {
      id: roomId,
      players: [player1, player2],
      wagerAmount,
      status: 'waiting', // waiting, countdown, racing, finished
      startTime: null,
      raceData: null,
      currentFrame: 0
    };

    this.rooms.set(roomId, room);
    this.userRooms.set(player1.userId, roomId);
    this.userRooms.set(player2.userId, roomId);

    return room;
  }

  /**
   * Get room by ID
   */
  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  /**
   * Get room by user ID
   */
  getRoomByUser(userId) {
    const roomId = this.userRooms.get(userId);
    return roomId ? this.rooms.get(roomId) : null;
  }

  /**
   * Update room status
   */
  updateRoomStatus(roomId, status) {
    const room = this.rooms.get(roomId);
    if (room) {
      room.status = status;
    }
  }

  /**
   * Set race data for room
   */
  setRaceData(roomId, raceData) {
    const room = this.rooms.get(roomId);
    if (room) {
      room.raceData = raceData;
      room.startTime = Date.now();
    }
  }

  /**
   * Advance to next frame
   */
  advanceFrame(roomId) {
    const room = this.rooms.get(roomId);
    if (room && room.raceData) {
      room.currentFrame++;
      return room.currentFrame < room.raceData.frames.length;
    }
    return false;
  }

  /**
   * Get current frame data
   */
  getCurrentFrame(roomId) {
    const room = this.rooms.get(roomId);
    if (room && room.raceData) {
      return room.raceData.frames[room.currentFrame];
    }
    return null;
  }

  /**
   * Check if race is finished
   */
  isRaceFinished(roomId) {
    const room = this.rooms.get(roomId);
    return room && room.currentFrame >= room.raceData?.frames?.length - 1;
  }

  /**
   * Delete a room
   */
  deleteRoom(roomId) {
    const room = this.rooms.get(roomId);
    if (room) {
      room.players.forEach(player => {
        this.userRooms.delete(player.userId);
      });
      this.rooms.delete(roomId);
    }
  }

  /**
   * Get all active rooms
   */
  getAllRooms() {
    return Array.from(this.rooms.values());
  }

  /**
   * Remove user from their room
   */
  removeUser(userId) {
    const roomId = this.userRooms.get(userId);
    if (roomId) {
      this.deleteRoom(roomId);
    }
  }
}

module.exports = new RaceRooms();

