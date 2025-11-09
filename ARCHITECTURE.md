# 🏗️ System Architecture

## Overview

Sperm Racing Simulator is a full-stack web application with real-time multiplayer capabilities.

## High-Level Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌──────────────┐
│   React Frontend │ ◄─────► │  Express API     │ ◄─────► │  PostgreSQL  │
│   (Port 3000)    │  HTTP   │  (Port 3001)     │  SQL    │  Database    │
└─────────────────┘         └──────────────────┘         └──────────────┘
        │                            │
        │ WebSocket                  │
        ▼                            ▼
┌─────────────────┐         ┌──────────────────┐
│  Socket.IO      │ ◄─────► │  Socket.IO       │
│  Client         │         │  Server          │
│                 │         │  (Port 3002)     │
└─────────────────┘         └──────────────────┘
```

## Backend Architecture

### API Server (Express)

```
/backend/src/
├── config/           # Configuration & database setup
│   ├── database.js   # PostgreSQL connection pool
│   ├── auth.js       # JWT configuration
│   ├── migrate.js    # Database schema migrations
│   └── seed.js       # Test data seeding
│
├── middleware/       # Express middleware
│   └── authMiddleware.js  # JWT token verification
│
├── models/          # Data access layer
│   ├── UserModel.js      # User CRUD operations
│   ├── RacerModel.js     # Racer CRUD operations
│   ├── RaceModel.js      # Race CRUD operations
│   ├── BetModel.js       # Betting CRUD operations
│   ├── TransactionModel.js
│   └── EvolutionModel.js
│
├── services/        # Business logic
│   ├── gachaService.js        # Racer generation & stats
│   ├── raceSimulationService.js # Physics simulation
│   ├── economyService.js      # Currency & transactions
│   ├── evolutionService.js    # Evolution & breeding
│   └── matchmakingService.js  # PvP matching
│
├── routes/          # API endpoints
│   ├── authRoutes.js      # /auth/login, /auth/register
│   ├── userRoutes.js      # /api/user/*
│   ├── summonRoutes.js    # /api/summon
│   ├── raceRoutes.js      # /api/race/*
│   ├── betRoutes.js       # /api/bet/*
│   ├── evolveRoutes.js    # /api/evolve/*
│   └── leaderboardRoutes.js
│
├── utils/           # Utilities
│   ├── rng.js            # Random number generation (seeded)
│   └── statWeighting.js  # Stat distribution algorithms
│
├── websocket/       # Real-time PvP
│   ├── socketServer.js   # Socket.IO server setup
│   └── raceRooms.js      # Race room management
│
├── index.js         # Main API server entry
└── socketIndex.js   # WebSocket server entry
```

### Database Schema

```sql
users
  - id (PK)
  - username (unique)
  - email (unique)
  - password_hash
  - wallet_balance
  - created_at

racers
  - id (PK)
  - user_id (FK → users)
  - name
  - stats (JSONB: {speed, motility, endurance, luck})
  - rarity (common|rare|epic|legendary)
  - xp
  - generation
  - parent_id (FK → racers, nullable)
  - evolved (boolean)
  - created_at

races
  - id (PK)
  - race_type (pve|pvp)
  - participants (JSONB array)
  - results (JSONB)
  - winner_id
  - race_seed (for replay)
  - timestamp

bets
  - id (PK)
  - user_id (FK → users)
  - race_id (FK → races)
  - racer_id (FK → racers)
  - amount
  - outcome (win|loss)
  - resolved (boolean)
  - created_at

evolutions
  - id (PK)
  - racer_id (FK → racers)
  - old_form
  - new_form
  - evolved_at

transactions
  - id (PK)
  - user_id (FK → users)
  - transaction_type (summon|race_win|bet_won|etc.)
  - amount (positive for gains, negative for costs)
  - reference_id (race_id, bet_id, etc.)
  - timestamp
```

## Frontend Architecture

### React App Structure

```
/frontend/src/
├── components/      # Reusable UI components
│   ├── Navbar.jsx
│   ├── RacerCard.jsx      # Display racer with stats
│   ├── BettingPanel.jsx   # Betting UI with slider
│   ├── EvolutionModal.jsx # Evolution popup
│   └── RaceCanvas.jsx     # Phaser game wrapper
│
├── pages/          # Route pages
│   ├── Login.jsx        # Auth: Login
│   ├── Register.jsx     # Auth: Register
│   ├── Home.jsx         # Dashboard
│   ├── Summon.jsx       # Gacha summon page
│   ├── RaceSetup.jsx    # Pre-race configuration
│   ├── RaceViewer.jsx   # Live race view
│   ├── Results.jsx      # Post-race results
│   ├── Leaderboard.jsx  # Rankings
│   └── Profile.jsx      # User profile & collection
│
├── game/           # Phaser.js game
│   └── RaceScene.js     # 2D race visualization
│
├── services/       # API communication
│   ├── api.js           # REST API client (Axios)
│   └── socketService.js # WebSocket client (Socket.IO)
│
├── store/          # State management (Zustand)
│   ├── useAuthStore.js  # User & auth state
│   ├── useGameStore.js  # Racers & balance
│   └── useRaceStore.js  # Active race state
│
├── utils/          # Utilities
│   ├── formatters.js    # Number, currency, date formatting
│   └── constants.js     # Game constants
│
├── App.jsx         # Root component with routing
├── main.jsx        # React entry point
└── index.css       # Global styles (TailwindCSS)
```

### State Management (Zustand)

**useAuthStore**
- Stores: user, token
- Actions: setAuth, updateBalance, logout
- Persisted to localStorage

**useGameStore**
- Stores: racers[], selectedRacer, balance
- Actions: setRacers, addRacer, updateRacer, selectRacer

**useRaceStore**
- Stores: currentRace, frames[], currentFrame, winner, rewards
- Actions: setCurrentRace, setFrames, advanceFrame, setWinner
- Cleared after each race

### Routing

```
/login           → Login page
/register        → Register page
/                → Home dashboard (protected)
/summon          → Summon page (protected)
/race            → Race setup (protected)
/race/:raceId    → Race viewer (protected)
/results         → Results page (protected)
/leaderboard     → Leaderboard (protected)
/profile         → User profile (protected)
```

## Data Flow

### 1. Summon Flow

```
User clicks "Summon"
  → Frontend: POST /api/summon
  → Backend: gachaService.performGachaPull()
    → Generate random stats (100 points)
    → Determine rarity based on variance
    → Generate unique name
  → Backend: RacerModel.create()
  → Backend: economyService.processSummonPayment()
    → Deduct 100 DNA Credits
    → Log transaction
  → Response: new racer data
  → Frontend: addRacer to store
  → Frontend: Show summoning animation
```

### 2. PvE Race Flow

```
User selects racer & starts race
  → Frontend: POST /api/race/pve { racerId, betAmount }
  → Backend: Generate AI opponent
  → Backend: raceSimulationService.simulateRace()
    → Generate race seed
    → Run 60-frame physics simulation
    → Return winner & frame data
  → Backend: Create race record
  → Backend: Update racer XP
  → Backend: Distribute rewards
  → Backend: Resolve bets
  → Response: race results + frames
  → Frontend: Navigate to /race/:id
  → Frontend: Play race animation (Phaser.js)
  → Frontend: Navigate to /results
```

### 3. PvP Race Flow

```
User joins matchmaking
  → Frontend: connectSocket()
  → Frontend: emit('joinMatchmaking', { racerId, wager })
  → Backend: matchmakingService.joinQueue()
  → Backend: Find match with similar power level
  → Backend: Create race room
  → Backend: emit('matchFound') to both players
  → Backend: Countdown 3...2...1...GO!
  → Backend: Simulate race
  → Backend: emit('raceUpdate') every second (60 frames)
  → Frontend: Update Phaser scene in real-time
  → Backend: emit('raceEnd', { winner, rewards })
  → Backend: Update XP, distribute rewards
  → Frontend: Navigate to /results
```

### 4. Evolution Flow

```
Racer reaches 500 XP
  → Frontend: Shows evolution prompt
  → User clicks "Evolve"
  → Frontend: POST /api/evolve/:racerId
  → Backend: Check eligibility (XP >= 500)
  → Backend: Generate AI Avatar name
  → Backend: Mark racer as evolved
  → Backend: Create evolution record
  → Response: evolution data
  → Frontend: Show evolution animation
  → Frontend: Update racer in store
```

## Key Algorithms

### Stat Distribution

```javascript
// Distribute 100 points across 4 stats (10-40 range)
function distributeStats() {
  const stats = { speed: 10, motility: 10, endurance: 10, luck: 10 };
  let remaining = 60;
  
  while (remaining > 0) {
    const stat = randomChoice(['speed', 'motility', 'endurance', 'luck']);
    if (stats[stat] < 40) {
      stats[stat]++;
      remaining--;
    }
  }
  
  return stats;
}
```

### Rarity Determination

```javascript
// Higher variance = more specialized = rarer
function determineRarity(stats) {
  const variance = calculateVariance(stats); // Standard deviation
  
  if (variance >= 10) return 'legendary'; // ~2%
  if (variance >= 7) return 'epic';      // ~8%
  if (variance >= 5) return 'rare';      // ~20%
  return 'common';                        // ~70%
}
```

### Race Simulation

```javascript
// Physics-based race simulation
for (let frame = 0; frame <= 60; frame++) {
  racers.forEach(racer => {
    // Calculate velocity
    const baseSpeed = racer.stats.speed * 0.4;
    const agility = racer.stats.motility * 0.2;
    const staminaFactor = racer.stamina / 100;
    racer.velocity = (baseSpeed + agility) * staminaFactor;
    
    // Apply luck
    if (random() < racer.stats.luck / 100) {
      racer.velocity *= 1.2; // Lucky boost!
    }
    
    // Update position
    racer.position += racer.velocity * dt;
    
    // Deplete stamina
    const drain = (100 - racer.stats.endurance) * 0.1;
    racer.stamina = max(0, racer.stamina - drain);
  });
  
  // Record frame
  frames.push({ time: frame, positions: [...racers] });
}
```

### Breeding (Inheritance)

```javascript
// 60% parent stats + 40% random
function inheritStats(parentStats) {
  const childStats = { speed: 10, motility: 10, endurance: 10, luck: 10 };
  let remaining = 60;
  
  // Inherit 60% from parent
  for (const stat in parentStats) {
    const inherited = floor((parentStats[stat] - 10) * 0.6);
    childStats[stat] += inherited;
    remaining -= inherited;
  }
  
  // Random 40%
  while (remaining > 0) {
    const stat = randomChoice(['speed', 'motility', 'endurance', 'luck']);
    if (childStats[stat] < 40) {
      childStats[stat]++;
      remaining--;
    }
  }
  
  return childStats;
}
```

## Performance Considerations

### Backend
- **Connection Pooling**: PostgreSQL pool for efficient connections
- **Indexing**: Indexes on user_id, race_id foreign keys
- **Caching**: In-memory matchmaking queue (should use Redis in production)

### Frontend
- **Code Splitting**: Route-based code splitting with React Router
- **State Management**: Zustand for minimal re-renders
- **Asset Optimization**: Vite for fast builds and HMR
- **Animation**: Framer Motion for smooth transitions
- **Game Rendering**: Phaser.js with Canvas for efficient 2D rendering

## Security

- **Password Hashing**: bcrypt with salt rounds
- **JWT**: Stateless authentication with 7-day expiration
- **Authorization**: Middleware checks on protected routes
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection**: Parameterized queries throughout
- **CORS**: Configured for allowed origins only

## Scalability

**Current Limitations:**
- In-memory matchmaking queue
- Single WebSocket server instance

**Production Improvements:**
- Redis for shared matchmaking queue
- Socket.IO with Redis adapter for multi-instance WebSockets
- CDN for frontend assets
- Database read replicas
- Rate limiting on API endpoints

## Monitoring & Debugging

**Backend Logs:**
- Request logging middleware
- Error handling with stack traces
- Database connection status

**Frontend Logs:**
- API error interceptor
- WebSocket connection status
- Console logs for key events

**Database:**
- Transaction logs
- Race history for replay

---

This architecture provides a solid foundation for a real-time multiplayer game with complex game mechanics, while remaining hackathon-friendly and easy to understand.

