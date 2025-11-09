import pool from './database.js'

const cardsSeed = `
-- Insert base cards
INSERT INTO cards (name, type, rarity, elixir_cost, target_type, character_model, base_hp, base_damage, base_speed, base_range, attack_speed, description) VALUES
  ('Knight', 'troop', 'common', 3, 'ground', 'Knight', 1400, 150, 1.0, 1.2, 1.1, 'A tough melee fighter with balanced stats'),
  ('Barbarian', 'troop', 'common', 5, 'ground', 'Barbarian', 1200, 200, 1.2, 1.2, 1.3, 'Fierce warrior with high damage output'),
  ('Mage', 'troop', 'rare', 4, 'both', 'Mage', 800, 250, 0.8, 5.0, 1.5, 'Ranged spellcaster with area damage'),
  ('Ranger', 'troop', 'rare', 3, 'both', 'Ranger', 700, 180, 1.0, 5.5, 1.0, 'Swift archer with long range'),
  ('Rogue', 'troop', 'epic', 4, 'ground', 'Rogue', 900, 220, 1.4, 1.5, 0.9, 'Fast assassin with high burst damage'),
  ('Giant', 'troop', 'rare', 5, 'ground', 'Barbarian', 3000, 180, 0.6, 1.2, 1.5, 'Massive tank that targets buildings'),
  ('Archers', 'troop', 'common', 3, 'both', 'Ranger', 500, 120, 0.9, 5.0, 1.2, 'Pair of ranged attackers'),
  ('Mini Knight', 'troop', 'common', 2, 'ground', 'Knight', 800, 100, 1.2, 1.2, 1.0, 'Smaller but faster knight'),
  ('Elite Barbarian', 'troop', 'epic', 6, 'ground', 'Barbarian', 1600, 280, 1.4, 1.2, 1.2, 'Fast and powerful barbarians'),
  ('Wizard', 'troop', 'legendary', 5, 'both', 'Mage', 1000, 350, 0.7, 5.5, 1.7, 'Powerful mage with splash damage'),
  ('Fireball', 'spell', 'rare', 4, 'both', NULL, NULL, 400, NULL, NULL, NULL, 'Area damage spell'),
  ('Freeze', 'spell', 'epic', 4, 'both', NULL, NULL, NULL, NULL, NULL, NULL, 'Freezes enemies in area'),
  ('Heal', 'spell', 'common', 3, 'both', NULL, NULL, NULL, NULL, NULL, NULL, 'Heals friendly troops in area'),
  ('Arrow Tower', 'building', 'common', 3, 'both', NULL, 1000, 100, NULL, 6.0, 1.0, 'Defensive tower that shoots arrows'),
  ('Cannon', 'building', 'common', 3, 'ground', NULL, 800, 200, NULL, 5.5, 0.8, 'Defensive building targeting ground'),
  ('Shadow Rogue', 'troop', 'rare', 3, 'ground', 'Rogue', 700, 180, 1.5, 1.5, 0.8, 'Stealthy assassin with quick attacks'),
  ('Battle Mage', 'troop', 'rare', 4, 'both', 'Mage', 850, 280, 0.8, 5.0, 1.4, 'Versatile mage with powerful spells'),
  ('Elite Knight', 'troop', 'rare', 4, 'ground', 'Knight', 1800, 200, 1.0, 1.2, 1.0, 'Heavily armored knight'),
  ('Dual Archers', 'troop', 'common', 3, 'both', 'Ranger', 600, 140, 1.0, 6.0, 1.1, 'Two archers with extended range'),
  ('Berserker', 'troop', 'epic', 5, 'ground', 'Barbarian', 1400, 250, 1.3, 1.2, 1.4, 'Raging warrior with massive damage')
ON CONFLICT DO NOTHING;
`

async function runSeed() {
  try {
    console.log('Seeding database...')
    await pool.query(cardsSeed)
    console.log('✅ Database seeded successfully')
    process.exit(0)
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  }
}

runSeed()

