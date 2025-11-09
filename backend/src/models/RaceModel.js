const pool = require('../config/database');

class RaceModel {
  /**
   * Create a new race
   */
  static async create(raceType, participants, results, winnerId, raceSeed) {
    const query = `
      INSERT INTO races (race_type, participants, results, winner_id, race_seed)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await pool.query(query, [
      raceType,
      JSON.stringify(participants),
      JSON.stringify(results),
      winnerId,
      raceSeed
    ]);
    return result.rows[0];
  }

  /**
   * Find race by ID
   */
  static async findById(id) {
    const query = 'SELECT * FROM races WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Get recent races for a user
   */
  static async findByUserId(userId, limit = 10) {
    const query = `
      SELECT r.* FROM races r
      WHERE r.participants::jsonb @> $1::jsonb
      ORDER BY r.timestamp DESC
      LIMIT $2
    `;
    const result = await pool.query(query, [JSON.stringify([{ userId }]), limit]);
    return result.rows;
  }

  /**
   * Get all races
   */
  static async findAll(limit = 50) {
    const query = 'SELECT * FROM races ORDER BY timestamp DESC LIMIT $1';
    const result = await pool.query(query, [limit]);
    return result.rows;
  }

  /**
   * Get race statistics for a racer
   */
  static async getRacerStats(racerId) {
    const query = `
      SELECT 
        COUNT(*) as total_races,
        COUNT(CASE WHEN winner_id = $1 THEN 1 END) as wins,
        COUNT(CASE WHEN winner_id != $1 THEN 1 END) as losses
      FROM races
      WHERE participants::jsonb @> $2::jsonb
    `;
    const result = await pool.query(query, [
      racerId,
      JSON.stringify([{ racerId }])
    ]);
    return result.rows[0];
  }
}

module.exports = RaceModel;

