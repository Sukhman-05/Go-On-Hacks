const pool = require('../config/database');

class RacerModel {
  /**
   * Create a new racer
   */
  static async create(userId, name, stats, rarity, generation = 1, parentId = null) {
    const query = `
      INSERT INTO racers (user_id, name, stats, rarity, generation, parent_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const result = await pool.query(query, [
      userId, 
      name, 
      JSON.stringify(stats), 
      rarity, 
      generation, 
      parentId
    ]);
    return result.rows[0];
  }

  /**
   * Find racer by ID
   */
  static async findById(id) {
    const query = 'SELECT * FROM racers WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Get all racers for a user
   */
  static async findByUserId(userId) {
    const query = 'SELECT * FROM racers WHERE user_id = $1 ORDER BY created_at DESC';
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  /**
   * Update racer XP
   */
  static async addXP(racerId, xp) {
    const query = `
      UPDATE racers 
      SET xp = xp + $2 
      WHERE id = $1 
      RETURNING *
    `;
    const result = await pool.query(query, [racerId, xp]);
    return result.rows[0];
  }

  /**
   * Mark racer as evolved
   */
  static async markAsEvolved(racerId) {
    const query = `
      UPDATE racers 
      SET evolved = true 
      WHERE id = $1 
      RETURNING *
    `;
    const result = await pool.query(query, [racerId]);
    return result.rows[0];
  }

  /**
   * Get racer's descendants
   */
  static async getDescendants(racerId) {
    const query = 'SELECT * FROM racers WHERE parent_id = $1';
    const result = await pool.query(query, [racerId]);
    return result.rows;
  }

  /**
   * Get racer family tree (parent and children)
   */
  static async getFamilyTree(racerId) {
    const query = `
      WITH RECURSIVE family AS (
        SELECT * FROM racers WHERE id = $1
        UNION ALL
        SELECT r.* FROM racers r
        INNER JOIN family f ON r.parent_id = f.id OR r.id = f.parent_id
      )
      SELECT * FROM family
    `;
    const result = await pool.query(query, [racerId]);
    return result.rows;
  }

  /**
   * Check if racer belongs to user
   */
  static async belongsToUser(racerId, userId) {
    const query = 'SELECT user_id FROM racers WHERE id = $1';
    const result = await pool.query(query, [racerId]);
    return result.rows[0]?.user_id === userId;
  }
}

module.exports = RacerModel;

