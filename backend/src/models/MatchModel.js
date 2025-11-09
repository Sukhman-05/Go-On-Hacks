import { query } from '../config/database.js'

export const MatchModel = {
  async create(player1Id, player2Id) {
    const result = await query(
      'INSERT INTO matches (player1_id, player2_id) VALUES ($1, $2) RETURNING *',
      [player1Id, player2Id]
    )
    return result.rows[0]
  },

  async findById(id) {
    const result = await query('SELECT * FROM matches WHERE id = $1', [id])
    return result.rows[0]
  },

  async complete(matchId, winnerId, player1TrophiesChange, player2TrophiesChange, player1Gold, player2Gold, duration, replayData = null) {
    const result = await query(
      `UPDATE matches
       SET winner_id = $1,
           player1_trophies_change = $2,
           player2_trophies_change = $3,
           player1_gold_earned = $4,
           player2_gold_earned = $5,
           duration = $6,
           replay_data = $7
       WHERE id = $8
       RETURNING *`,
      [winnerId, player1TrophiesChange, player2TrophiesChange, player1Gold, player2Gold, duration, replayData, matchId]
    )
    return result.rows[0]
  },

  async getUserMatches(userId, limit = 20) {
    const result = await query(
      `SELECT m.*,
              u1.username as player1_username,
              u2.username as player2_username
       FROM matches m
       LEFT JOIN users u1 ON m.player1_id = u1.id
       LEFT JOIN users u2 ON m.player2_id = u2.id
       WHERE m.player1_id = $1 OR m.player2_id = $1
       ORDER BY m.created_at DESC
       LIMIT $2`,
      [userId, limit]
    )
    return result.rows
  },

  async getMatchHistory(userId, limit = 10) {
    const matches = await this.getUserMatches(userId, limit)
    
    return matches.map(match => ({
      ...match,
      result: match.winner_id === userId ? 'win' : 'loss',
      trophiesChange: match.player1_id === userId 
        ? match.player1_trophies_change 
        : match.player2_trophies_change,
      goldEarned: match.player1_id === userId
        ? match.player1_gold_earned
        : match.player2_gold_earned
    }))
  }
}

export default MatchModel

