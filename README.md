# 🏁 Sperm Racing Simulator: Battle for the Gene Pool

A satirical, AI-themed gacha racing simulator where you summon sperm racers, compete in races, bet DNA Credits, and evolve winners into powerful AI avatars that can produce new generations.

## 🎮 Features

- **Gacha System**: Summon random racers with unique stat distributions and rarities
- **PvE Racing**: Race against AI opponents with dynamic physics simulation
- **PvP Racing**: Real-time multiplayer races via WebSocket
- **Betting System**: Wager DNA Credits on race outcomes
- **Evolution Mechanic**: Evolve racers into AI Avatars at 500 XP
- **Breeding**: Evolved avatars can create offspring with inherited traits
- **Leaderboard**: Compete for the top spot
- **2D Race Visualization**: Watch races unfold with Phaser.js
- **Economy System**: Earn and spend DNA Credits

## 🛠️ Tech Stack

### Backend
- **Node.js + Express**: REST API server
- **PostgreSQL**: Database for users, racers, races, and transactions
- **Socket.IO**: Real-time WebSocket for PvP racing
- **JWT**: Authentication
- **bcrypt**: Password hashing
- **seedrandom**: Deterministic race simulation

### Frontend
- **React**: UI framework
- **Vite**: Build tool
- **React Router**: Navigation
- **Zustand**: State management
- **TailwindCSS**: Styling
- **Framer Motion**: Animations
- **Phaser.js**: 2D race visualization
- **Axios**: HTTP client
- **Socket.IO Client**: WebSocket client

## 📁 Project Structure

```
/backend
  /src
    /config         - Database, auth, migrations
    /models         - Data models (User, Racer, Race, etc.)
    /routes         - API endpoints
    /services       - Business logic (gacha, racing, economy)
    /utils          - Utilities (RNG, stat weighting)
    /middleware     - Auth middleware
    /websocket      - Socket.IO server for PvP
  package.json
  .env.example

/frontend
  /src
    /components     - Reusable UI components
    /pages          - Page components
    /game           - Phaser.js race scene
    /services       - API and WebSocket clients
    /store          - Zustand state stores
    /utils          - Formatters and constants
  package.json
  .env.example
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v16+)
- PostgreSQL (v13+)
- npm or yarn

### 1. Database Setup

Create a PostgreSQL database:

```bash
createdb sperm_racing
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file (copy from `.env.example`):

```env
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://username:password@localhost:5432/sperm_racing
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRATION=7d
SOCKET_PORT=3002
```

Run database migrations:

```bash
npm run migrate
```

Seed the database with test data:

```bash
npm run seed
```

Start the backend server:

```bash
npm run dev
```

**Separately**, start the WebSocket server:

```bash
node src/socketIndex.js
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create `.env` file (copy from `.env.example`):

```env
VITE_API_URL=http://localhost:3001
VITE_SOCKET_URL=http://localhost:3002
```

Start the development server:

```bash
npm run dev
```

The app will open at `http://localhost:3000`

## 🎯 Test Credentials

After seeding the database, you can log in with:

- **Email**: `test1@example.com`
- **Password**: `password123`

## 📡 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### User
- `GET /api/user/profile` - Get user profile
- `GET /api/user/racers` - Get user's racers
- `GET /api/user/balance` - Get user balance
- `GET /api/user/transactions` - Get transaction history

### Summon
- `POST /api/summon` - Summon a new racer (costs 100 DNA Credits)
- `GET /api/summon/cost` - Get summon costs

### Racing
- `POST /api/race/pve` - Start PvE race
- `GET /api/race/:id` - Get race details
- `GET /api/race/history/me` - Get user's race history

### Betting
- `POST /api/bet` - Place a bet on a race
- `GET /api/bet/history` - Get betting history

### Evolution
- `POST /api/evolve/:racerId` - Evolve a racer (requires 500 XP)
- `GET /api/evolve/:racerId/progress` - Get evolution progress
- `POST /api/evolve/:racerId/breed` - Breed an evolved racer

### Leaderboard
- `GET /api/leaderboard` - Get top players

## 🎲 Game Mechanics

### Stat Distribution
Each racer has 100 points distributed across 4 stats:
- **Speed**: Acceleration and top velocity
- **Motility**: Agility and turning capability  
- **Endurance**: Stamina depletion rate
- **Luck**: Chance for random boosts

Constraints: Min 10, Max 40 per stat

### Rarity System
Rarity is determined by stat variance (specialization):
- **Common**: ~70% (Low variance)
- **Rare**: ~20% (Medium variance)
- **Epic**: ~8% (High variance)
- **Legendary**: ~2% (Very high variance)

### Race Simulation
Races are 1000m over ~60 seconds:
```
position += (speed * 0.4 + motility * 0.2) * dt
stamina -= (100 - endurance) * 0.1 * dt
if stamina < 50: speed *= 0.8
if random() < luck/100: position += bonus
```

### Economy
- **Starting Balance**: 1000 DNA Credits
- **Summon Cost**: 100 DNA Credits
- **PvE Entry**: 50 DNA Credits
- **PvE Win Reward**: 75 DNA Credits
- **PvP**: Custom wager (winner takes pot minus 5% house fee)

### Evolution & Breeding
- **Evolution Threshold**: 500 XP
- **XP Gains**: Winner +50 XP, Loser +10 XP
- **Breeding**: Offspring inherit 60% parent stats + 40% random
- **Generations**: Each offspring increments generation number

## 🌐 WebSocket Events (PvP)

### Client → Server
- `joinMatchmaking` - Join PvP queue
- `leaveMatchmaking` - Leave PvP queue
- `playerReady` - Signal ready for race

### Server → Client
- `matchFound` - Match found, race starting soon
- `countdown` - Race countdown (3, 2, 1, GO!)
- `raceStart` - Race begins
- `raceUpdate` - Live position updates (1Hz)
- `raceEnd` - Race finished, winner announced
- `playerDisconnected` - Opponent disconnected (forfeit)

## 🎨 Visual Design

- **Color Scheme**: Neon blues/purples on dark background (cyberpunk aesthetic)
- **Rarity Colors**:
  - Common: Gray
  - Rare: Blue (#3b82f6)
  - Epic: Purple (#a855f7)
  - Legendary: Gold (#fbbf24)
- **UI**: Rounded cards, smooth transitions, DNA helix animations
- **Race Track**: Side-scrolling 2D with teardrop-shaped racers

## 🧪 Development

### Run Backend Tests
```bash
cd backend
npm test
```

### Build Frontend for Production
```bash
cd frontend
npm run build
```

### Database Migrations
To reset the database:
```bash
cd backend
npm run migrate
npm run seed
```

## 🚢 Deployment

### Backend
1. Set up PostgreSQL database (Supabase, AWS RDS, etc.)
2. Deploy to Render, Heroku, or similar
3. Set environment variables
4. Run migrations in production

### Frontend
1. Build: `npm run build`
2. Deploy to Vercel, Netlify, or similar
3. Set `VITE_API_URL` and `VITE_SOCKET_URL` environment variables

## 🎭 Humor & Flavor

The game embraces absurdist humor with:
- AI-themed racer names (GPT-Racer, Claude-Sprint, etc.)
- Satirical race commentary
- Self-aware mechanics
- DNA Credits as currency
- Evolution into "AI Avatars"

## 📜 License

MIT License - Feel free to use this for hackathons, learning, or fun!

## 🤝 Contributing

This is a hackathon project, but contributions are welcome!

## 🐛 Known Issues

- PvP matchmaking uses in-memory queue (use Redis for production)
- No replay system yet
- Limited mobile optimization

## 🎉 Credits

Built with ❤️ for hackathons and AI enthusiasts everywhere!

---

**Ready to race? May the best genes win!** 🧬🏁

