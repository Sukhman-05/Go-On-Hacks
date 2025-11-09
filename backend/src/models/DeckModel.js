import { query } from '../config/database.js'
import CardModel from './CardModel.js'

export const DeckModel = {
  async create(userId, name, cardIds) {
    if (cardIds.length !== 8) {
      throw new Error('Deck must contain exactly 8 cards')
    }

    const result = await query(
      `INSERT INTO decks (user_id, name, card_slot_1, card_slot_2, card_slot_3, card_slot_4, 
                          card_slot_5, card_slot_6, card_slot_7, card_slot_8)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [userId, name, ...cardIds]
    )
    
    return result.rows[0]
  },

  async findById(id) {
    const result = await query('SELECT * FROM decks WHERE id = $1', [id])
    const deck = result.rows[0]
    
    if (!deck) return null
    
    // Fetch card details
    const cardIds = [
      deck.card_slot_1, deck.card_slot_2, deck.card_slot_3, deck.card_slot_4,
      deck.card_slot_5, deck.card_slot_6, deck.card_slot_7, deck.card_slot_8
    ].filter(id => id !== null)
    
    const cards = await CardModel.findByIds(cardIds)
    
    return {
      ...deck,
      cards
    }
  },

  async findByUserId(userId) {
    const result = await query(
      'SELECT * FROM decks WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    )
    
    // Fetch cards for each deck
    const decks = await Promise.all(
      result.rows.map(async (deck) => {
        const cardIds = [
          deck.card_slot_1, deck.card_slot_2, deck.card_slot_3, deck.card_slot_4,
          deck.card_slot_5, deck.card_slot_6, deck.card_slot_7, deck.card_slot_8
        ].filter(id => id !== null)
        
        const cards = await CardModel.findByIds(cardIds)
        
        return {
          ...deck,
          cards
        }
      })
    )
    
    return decks
  },

  async update(id, userId, updates) {
    const { name, cardIds } = updates
    
    if (cardIds && cardIds.length !== 8) {
      throw new Error('Deck must contain exactly 8 cards')
    }

    let updateQuery = 'UPDATE decks SET updated_at = CURRENT_TIMESTAMP'
    const params = []
    let paramCount = 1

    if (name) {
      updateQuery += `, name = $${paramCount}`
      params.push(name)
      paramCount++
    }

    if (cardIds) {
      for (let i = 0; i < 8; i++) {
        updateQuery += `, card_slot_${i + 1} = $${paramCount}`
        params.push(cardIds[i])
        paramCount++
      }
    }

    updateQuery += ` WHERE id = $${paramCount} AND user_id = $${paramCount + 1} RETURNING *`
    params.push(id, userId)

    const result = await query(updateQuery, params)
    return result.rows[0]
  },

  async delete(id, userId) {
    const result = await query(
      'DELETE FROM decks WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    )
    return result.rows[0]
  },

  async setActive(id, userId) {
    // Set all decks to inactive
    await query('UPDATE decks SET is_active = FALSE WHERE user_id = $1', [userId])
    
    // Set selected deck to active
    const result = await query(
      'UPDATE decks SET is_active = TRUE WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    )
    return result.rows[0]
  },

  async getActiveDeck(userId) {
    const result = await query(
      'SELECT * FROM decks WHERE user_id = $1 AND is_active = TRUE LIMIT 1',
      [userId]
    )
    return result.rows[0]
  }
}

export default DeckModel

