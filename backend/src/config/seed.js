const bcrypt = require('bcrypt');
const pool = require('./database');
const { distributeStats, determineRarity } = require('../utils/statWeighting');
const { randomChoice } = require('../utils/rng');

const namePool = [
  'GPT-Racer', 'Claude-Sprint', 'Gemini-Rush', 'LLaMA-Dash', 'Mistral-Bolt',
  'Bard-Blitz', 'Copilot-Charge', 'Whisper-Wave', 'DALL-E-Dash', 'Stable-Sprint'
];

async function seedDatabase() {
  const client = await pool.connect();

  try {
    console.log('🌱 Starting database seeding...');

    // Create test users
    const users = [
      { username: 'testuser1', email: 'test1@example.com', password: 'password123' },
      { username: 'testuser2', email: 'test2@example.com', password: 'password123' },
      { username: 'speedster', email: 'speed@example.com', password: 'password123' },
      { username: 'racerking', email: 'king@example.com', password: 'password123' },
      { username: 'aimaster', email: 'master@example.com', password: 'password123' }
    ];

    const createdUsers = [];
    for (const user of users) {
      const passwordHash = await bcrypt.hash(user.password, 10);
      const result = await client.query(
        `INSERT INTO users (username, email, password_hash, wallet_balance)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (email) DO NOTHING
         RETURNING id, username`,
        [user.username, user.email, passwordHash, 1000]
      );
      if (result.rows.length > 0) {
        createdUsers.push(result.rows[0]);
        console.log(`✅ Created user: ${user.username}`);
      }
    }

    // Create racers for each user
    let totalRacers = 0;
    for (const user of createdUsers) {
      const racerCount = Math.floor(Math.random() * 3) + 2; // 2-4 racers per user

      for (let i = 0; i < racerCount; i++) {
        const stats = distributeStats();
        const rarity = determineRarity(stats);
        const baseName = randomChoice(namePool);
        const name = `${baseName}-${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`;
        const xp = Math.floor(Math.random() * 600); // Random XP between 0-600

        await client.query(
          `INSERT INTO racers (user_id, name, stats, rarity, xp, generation)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [user.id, name, JSON.stringify(stats), rarity, xp, 1]
        );
        totalRacers++;
      }
      console.log(`✅ Created ${racerCount} racers for ${user.username}`);
    }

    // Create some sample races
    console.log('🏁 Creating sample races...');
    const racers = await client.query('SELECT * FROM racers LIMIT 10');
    
    for (let i = 0; i < 5; i++) {
      const racer1 = racers.rows[Math.floor(Math.random() * racers.rows.length)];
      const racer2 = racers.rows[Math.floor(Math.random() * racers.rows.length)];
      
      if (racer1.id === racer2.id) continue;

      const winner = Math.random() > 0.5 ? racer1.id : racer2.id;
      
      await client.query(
        `INSERT INTO races (race_type, participants, results, winner_id)
         VALUES ($1, $2, $3, $4)`,
        [
          'pve',
          JSON.stringify([
            { racerId: racer1.id, racerName: racer1.name, userId: racer1.user_id },
            { racerId: racer2.id, racerName: racer2.name, isAI: true }
          ]),
          JSON.stringify({ winner, timeElapsed: Math.floor(Math.random() * 60) + 30 }),
          winner
        ]
      );
    }
    console.log('✅ Created 5 sample races');

    // Create some transactions
    console.log('💰 Creating sample transactions...');
    for (const user of createdUsers) {
      // Summon transaction
      await client.query(
        `INSERT INTO transactions (user_id, transaction_type, amount)
         VALUES ($1, $2, $3)`,
        [user.id, 'summon', -100]
      );

      // Race win transaction
      await client.query(
        `INSERT INTO transactions (user_id, transaction_type, amount)
         VALUES ($1, $2, $3)`,
        [user.id, 'race_win', 75]
      );
    }
    console.log('✅ Created sample transactions');

    console.log('\n🎉 Database seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Users created: ${createdUsers.length}`);
    console.log(`   - Racers created: ${totalRacers}`);
    console.log(`   - Races created: 5`);
    console.log(`\n💡 Test credentials:`);
    console.log(`   Email: test1@example.com`);
    console.log(`   Password: password123`);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run seed if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = seedDatabase;

