import pool from './database.js'

const migrations = `
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  trophies INTEGER DEFAULT 0,
  gold INTEGER DEFAULT 1000,
  gems INTEGER DEFAULT 50,
  level INTEGER DEFAULT 1,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  best_trophies INTEGER DEFAULT 0,
  avatar VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cards table
CREATE TABLE IF NOT EXISTS cards (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL,
  rarity VARCHAR(50) NOT NULL,
  elixir_cost INTEGER NOT NULL,
  target_type VARCHAR(50) NOT NULL,
  deploy_time FLOAT DEFAULT 1.0,
  character_model VARCHAR(100),
  description TEXT,
  base_hp INTEGER,
  base_damage INTEGER,
  base_speed FLOAT,
  base_range FLOAT,
  attack_speed FLOAT,
  area_damage BOOLEAN DEFAULT FALSE,
  area_radius FLOAT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User cards (card collection)
CREATE TABLE IF NOT EXISTS user_cards (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  card_id INTEGER REFERENCES cards(id) ON DELETE CASCADE,
  level INTEGER DEFAULT 1,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, card_id)
);

-- Decks table
CREATE TABLE IF NOT EXISTS decks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  card_slot_1 INTEGER REFERENCES cards(id),
  card_slot_2 INTEGER REFERENCES cards(id),
  card_slot_3 INTEGER REFERENCES cards(id),
  card_slot_4 INTEGER REFERENCES cards(id),
  card_slot_5 INTEGER REFERENCES cards(id),
  card_slot_6 INTEGER REFERENCES cards(id),
  card_slot_7 INTEGER REFERENCES cards(id),
  card_slot_8 INTEGER REFERENCES cards(id),
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Matches table
CREATE TABLE IF NOT EXISTS matches (
  id SERIAL PRIMARY KEY,
  player1_id INTEGER REFERENCES users(id),
  player2_id INTEGER REFERENCES users(id),
  winner_id INTEGER REFERENCES users(id),
  player1_trophies_change INTEGER,
  player2_trophies_change INTEGER,
  player1_gold_earned INTEGER,
  player2_gold_earned INTEGER,
  duration INTEGER,
  replay_data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_user_cards_user_id ON user_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_decks_user_id ON decks(user_id);
CREATE INDEX IF NOT EXISTS idx_matches_player1 ON matches(player1_id);
CREATE INDEX IF NOT EXISTS idx_matches_player2 ON matches(player2_id);
`

async function runMigrations() {
  try {
    console.log('Running database migrations...')
    await pool.query(migrations)
    console.log('✅ Migrations completed successfully')
    process.exit(0)
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

runMigrations()

