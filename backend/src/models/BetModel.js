const pool = require('../config/database');

class BetModel {
  /**
   * Create a new bet
   */
  static async create(userId, raceId, racerId, amount) {
    const query = `
      INSERT INTO bets (user_id, race_id, racer_id, amount)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await pool.query(query, [userId, raceId, racerId, amount]);
    return result.rows[0];
  }

  /**
   * Find bet by ID
   */
  static async findById(id) {
    const query = 'SELECT * FROM bets WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Get bets for a race
   */
  static async findByRaceId(raceId) {
    const query = 'SELECT * FROM bets WHERE race_id = $1';
    const result = await pool.query(query, [raceId]);
    return result.rows;
  }

  /**
   * Get user's bet for a race
   */
  static async findUserBetForRace(userId, raceId) {
    const query = 'SELECT * FROM bets WHERE user_id = $1 AND race_id = $2';
    const result = await pool.query(query, [userId, raceId]);
    return result.rows[0];
  }

  /**
   * Resolve a bet
   */
  static async resolve(betId, outcome) {
    const query = `
      UPDATE bets 
      SET outcome = $2, resolved = true 
      WHERE id = $1 
      RETURNING *
    `;
    const result = await pool.query(query, [betId, outcome]);
    return result.rows[0];
  }

  /**
   * Resolve all bets for a race
   */
  static async resolveRaceBets(raceId, winnerId) {
    const query = `
      UPDATE bets 
      SET 
        outcome = CASE WHEN racer_id = $2 THEN 'win' ELSE 'loss' END,
        resolved = true
      WHERE race_id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [raceId, winnerId]);
    return result.rows;
  }

  /**
   * Get user's betting history
   */
  static async findByUserId(userId, limit = 20) {
    const query = `
      SELECT b.*, r.race_type, r.timestamp as race_date
      FROM bets b
      JOIN races r ON b.race_id = r.id
      WHERE b.user_id = $1
      ORDER BY b.created_at DESC
      LIMIT $2
    `;
    const result = await pool.query(query, [userId, limit]);
    return result.rows;
  }
}

module.exports = BetModel;

