const pool = require('../config/database');

class TransactionModel {
  /**
   * Create a new transaction
   */
  static async create(userId, transactionType, amount, referenceId = null) {
    const query = `
      INSERT INTO transactions (user_id, transaction_type, amount, reference_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await pool.query(query, [userId, transactionType, amount, referenceId]);
    return result.rows[0];
  }

  /**
   * Get user's transaction history
   */
  static async findByUserId(userId, limit = 50) {
    const query = `
      SELECT * FROM transactions 
      WHERE user_id = $1 
      ORDER BY timestamp DESC 
      LIMIT $2
    `;
    const result = await pool.query(query, [userId, limit]);
    return result.rows;
  }

  /**
   * Get transactions by type for user
   */
  static async findByType(userId, transactionType, limit = 50) {
    const query = `
      SELECT * FROM transactions 
      WHERE user_id = $1 AND transaction_type = $2 
      ORDER BY timestamp DESC 
      LIMIT $3
    `;
    const result = await pool.query(query, [userId, transactionType, limit]);
    return result.rows;
  }

  /**
   * Get user's total earnings
   */
  static async getTotalEarnings(userId) {
    const query = `
      SELECT 
        SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as total_earned,
        SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as total_spent
      FROM transactions
      WHERE user_id = $1
    `;
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }
}

module.exports = TransactionModel;

