const pool = require('../config/database');

class EvolutionModel {
  /**
   * Create an evolution record
   */
  static async create(racerId, oldForm, newForm) {
    const query = `
      INSERT INTO evolutions (racer_id, old_form, new_form)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await pool.query(query, [racerId, oldForm, newForm]);
    return result.rows[0];
  }

  /**
   * Get evolutions for a racer
   */
  static async findByRacerId(racerId) {
    const query = 'SELECT * FROM evolutions WHERE racer_id = $1';
    const result = await pool.query(query, [racerId]);
    return result.rows;
  }

  /**
   * Get all evolutions for a user
   */
  static async findByUserId(userId) {
    const query = `
      SELECT e.*, r.name as racer_name
      FROM evolutions e
      JOIN racers r ON e.racer_id = r.id
      WHERE r.user_id = $1
      ORDER BY e.evolved_at DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  /**
   * Check if racer has evolved
   */
  static async hasEvolved(racerId) {
    const query = 'SELECT COUNT(*) as count FROM evolutions WHERE racer_id = $1';
    const result = await pool.query(query, [racerId]);
    return parseInt(result.rows[0].count) > 0;
  }
}

module.exports = EvolutionModel;

