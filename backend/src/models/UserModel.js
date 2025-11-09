import { query } from '../config/database.js'
import bcrypt from 'bcryptjs'

export const UserModel = {
  async create(username, email, password) {
    const passwordHash = await bcrypt.hash(password, 10)
    
    const result = await query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, trophies, gold, gems, level, created_at',
      [username, email, passwordHash]
    )
    
    return result.rows[0]
  },

  async findByEmail(email) {
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    )
    return result.rows[0]
  },

  async findById(id) {
    const result = await query(
      'SELECT id, username, email, trophies, gold, gems, level, wins, losses, best_trophies, avatar, created_at FROM users WHERE id = $1',
      [id]
    )
    return result.rows[0]
  },

  async findByUsername(username) {
    const result = await query(
      'SELECT id, username, email, trophies, gold, gems, level, wins, losses, best_trophies, avatar, created_at FROM users WHERE username = $1',
      [username]
    )
    return result.rows[0]
  },

  async updateTrophies(userId, trophies) {
    const result = await query(
      'UPDATE users SET trophies = $1, best_trophies = GREATEST(best_trophies, $1), updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [trophies, userId]
    )
    return result.rows[0]
  },

  async updateCurrency(userId, gold, gems) {
    const result = await query(
      'UPDATE users SET gold = gold + $1, gems = gems + $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [gold, gems, userId]
    )
    return result.rows[0]
  },

  async updateStats(userId, wins, losses) {
    const result = await query(
      'UPDATE users SET wins = wins + $1, losses = losses + $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [wins, losses, userId]
    )
    return result.rows[0]
  },

  async verifyPassword(email, password) {
    const user = await this.findByEmail(email)
    if (!user) return null
    
    const isValid = await bcrypt.compare(password, user.password_hash)
    if (!isValid) return null
    
    delete user.password_hash
    return user
  },

  async getLeaderboard(limit = 100) {
    const result = await query(
      'SELECT id, username, trophies, level, wins, losses FROM users ORDER BY trophies DESC LIMIT $1',
      [limit]
    )
    return result.rows
  }
}

export default UserModel

