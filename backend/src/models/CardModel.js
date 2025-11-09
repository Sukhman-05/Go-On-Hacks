import { query } from '../config/database.js'

export const CardModel = {
  async findAll() {
    const result = await query('SELECT * FROM cards ORDER BY rarity, elixir_cost')
    return result.rows
  },

  async findById(id) {
    const result = await query('SELECT * FROM cards WHERE id = $1', [id])
    return result.rows[0]
  },

  async findByIds(ids) {
    const result = await query(
      'SELECT * FROM cards WHERE id = ANY($1)',
      [ids]
    )
    return result.rows
  },

  async getUserCards(userId) {
    const result = await query(
      `SELECT uc.*, c.*
       FROM user_cards uc
       JOIN cards c ON uc.card_id = c.id
       WHERE uc.user_id = $1
       ORDER BY c.rarity, c.elixir_cost`,
      [userId]
    )
    
    return result.rows.map(row => ({
      id: row.id,
      level: row.level,
      quantity: row.quantity,
      card: {
        id: row.card_id,
        name: row.name,
        type: row.type,
        rarity: row.rarity,
        elixir_cost: row.elixir_cost,
        target_type: row.target_type,
        character_model: row.character_model,
        description: row.description,
        base_hp: row.base_hp,
        base_damage: row.base_damage,
        base_speed: row.base_speed,
        base_range: row.base_range,
        attack_speed: row.attack_speed,
        area_damage: row.area_damage,
        area_radius: row.area_radius
      }
    }))
  },

  async addCardToUser(userId, cardId, quantity = 1) {
    const result = await query(
      `INSERT INTO user_cards (user_id, card_id, quantity)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, card_id)
       DO UPDATE SET quantity = user_cards.quantity + $3
       RETURNING *`,
      [userId, cardId, quantity]
    )
    return result.rows[0]
  },

  async upgradeCard(userId, cardId) {
    const result = await query(
      `UPDATE user_cards
       SET level = level + 1
       WHERE user_id = $1 AND card_id = $2
       RETURNING *`,
      [userId, cardId]
    )
    return result.rows[0]
  },

  async getCardStats(cardId, level) {
    const card = await this.findById(cardId)
    if (!card) return null

    // Scale stats based on level (10% per level)
    const multiplier = 1 + (level - 1) * 0.1
    
    return {
      ...card,
      hp: card.base_hp ? Math.floor(card.base_hp * multiplier) : null,
      damage: card.base_damage ? Math.floor(card.base_damage * multiplier) : null,
      speed: card.base_speed,
      range: card.base_range,
      attack_speed: card.attack_speed
    }
  }
}

export default CardModel

