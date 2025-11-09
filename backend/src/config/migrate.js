const pool = require('./database');

const createTables = async () => {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Starting database migration...');

    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        wallet_balance INTEGER DEFAULT 1000,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Users table created');

    // Racers table
    await client.query(`
      CREATE TABLE IF NOT EXISTS racers (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        stats JSONB NOT NULL,
        rarity VARCHAR(20) NOT NULL,
        xp INTEGER DEFAULT 0,
        generation INTEGER DEFAULT 1,
        parent_id INTEGER REFERENCES racers(id) ON DELETE SET NULL,
        evolved BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Racers table created');

    // Races table
    await client.query(`
      CREATE TABLE IF NOT EXISTS races (
        id SERIAL PRIMARY KEY,
        race_type VARCHAR(10) NOT NULL,
        participants JSONB NOT NULL,
        results JSONB,
        winner_id INTEGER,
        race_seed VARCHAR(50),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Races table created');

    // Bets table
    await client.query(`
      CREATE TABLE IF NOT EXISTS bets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        race_id INTEGER REFERENCES races(id) ON DELETE CASCADE,
        racer_id INTEGER REFERENCES racers(id) ON DELETE CASCADE,
        amount INTEGER NOT NULL,
        outcome VARCHAR(10),
        resolved BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Bets table created');

    // Evolutions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS evolutions (
        id SERIAL PRIMARY KEY,
        racer_id INTEGER REFERENCES racers(id) ON DELETE CASCADE,
        old_form VARCHAR(100),
        new_form VARCHAR(100) NOT NULL,
        evolved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Evolutions table created');

    // Transactions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        transaction_type VARCHAR(20) NOT NULL,
        amount INTEGER NOT NULL,
        reference_id INTEGER,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Transactions table created');

    // Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_racers_user_id ON racers(user_id);
      CREATE INDEX IF NOT EXISTS idx_bets_user_id ON bets(user_id);
      CREATE INDEX IF NOT EXISTS idx_bets_race_id ON bets(race_id);
      CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
    `);
    console.log('✅ Indexes created');

    console.log('🎉 Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Run migration if called directly
if (require.main === module) {
  createTables()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = createTables;

