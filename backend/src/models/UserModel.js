const pool = require('../config/database');

class UserModel {
  /**
   * Create a new user
   */
  static async create(username, email, passwordHash) {
    const query = `
      INSERT INTO users (username, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id, username, email, wallet_balance, created_at
    `;
    const result = await pool.query(query, [username, email, passwordHash]);
    return result.rows[0];
  }

  /**
   * Find user by email
   */
  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  /**
   * Find user by username
   */
  static async findByUsername(username) {
    const query = 'SELECT * FROM users WHERE username = $1';
    const result = await pool.query(query, [username]);
    return result.rows[0];
  }

  /**
   * Find user by ID
   */
  static async findById(id) {
    const query = 'SELECT id, username, email, wallet_balance, created_at FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Update user balance
   */
  static async updateBalance(userId, amount) {
    const query = `
      UPDATE users 
      SET wallet_balance = wallet_balance + $2 
      WHERE id = $1 
      RETURNING wallet_balance
    `;
    const result = await pool.query(query, [userId, amount]);
    return result.rows[0];
  }

  /**
   * Get user balance
   */
  static async getBalance(userId) {
    const query = 'SELECT wallet_balance FROM users WHERE id = $1';
    const result = await pool.query(query, [userId]);
    return result.rows[0]?.wallet_balance;
  }

  /**
   * Get leaderboard (top users by balance)
   */
  static async getLeaderboard(limit = 10) {
    const query = `
      SELECT 
        u.id, 
        u.username, 
        u.wallet_balance,
        COUNT(DISTINCT r.id) as total_races,
        COUNT(DISTINCT CASE WHEN ra.winner_id = rac.id THEN ra.id END) as wins
      FROM users u
      LEFT JOIN racers rac ON u.id = rac.user_id
      LEFT JOIN races ra ON ra.winner_id = rac.id
      GROUP BY u.id, u.username, u.wallet_balance
      ORDER BY u.wallet_balance DESC
      LIMIT $1
    `;
    const result = await pool.query(query, [limit]);
    return result.rows;
  }
}

module.exports = UserModel;

