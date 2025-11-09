# System Architecture

## Overview
This document describes the technical architecture of the Clash Royale 3D Clone.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                      │
├─────────────────────────────────────────────────────────────┤
│  React App (Port 5173)                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   UI Layer   │  │  Game Layer  │  │ State Layer  │      │
│  │  (Components)│  │  (Three.js)  │  │  (Zustand)   │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                  │               │
│         └─────────────────┴──────────────────┘               │
│                           │                                  │
│                ┌──────────┴──────────┐                      │
│                │                     │                      │
│         ┌──────▼──────┐      ┌──────▼──────┐              │
│         │  Axios/HTTP │      │  Socket.io  │              │
│         │  (REST API) │      │  (WebSocket)│              │
│         └──────┬──────┘      └──────┬──────┘              │
└────────────────┼──────────────────────┼───────────────────┘
                 │                      │
                 │                      │
        ┌────────▼──────────┐  ┌────────▼──────────┐
        │   API Server      │  │  Socket Server    │
        │   (Port 3001)     │  │   (Port 3002)     │
        ├───────────────────┤  ├───────────────────┤
        │  Express.js       │  │   Socket.io       │
        │  JWT Middleware   │  │   Auth Handler    │
        │  REST Endpoints   │  │   Battle Handler  │
        │  Business Logic   │  │   Matchmaking     │
        └────────┬──────────┘  └────────┬──────────┘
                 │                      │
                 └──────────┬───────────┘
                            │
                    ┌───────▼────────┐
                    │   PostgreSQL   │
                    │   (Port 5432)  │
                    └────────────────┘
```

## Frontend Architecture

### Directory Structure
```
frontend/src/
├── components/          # React UI components
│   ├── Navbar.jsx      # Navigation bar
│   ├── BattleArena.jsx # 3D battle container
│   └── BattleUI.jsx    # Battle interface overlays
├── game/               # Three.js game engine
│   ├── AssetLoader.js  # 3D model loading
│   ├── BattleScene.js  # 3D scene setup
│   └── CombatSystem.js # Combat logic
├── pages/              # Route pages
│   ├── Home.jsx
│   ├── Battle.jsx
│   ├── DeckBuilder.jsx
│   ├── CardCollection.jsx
│   └── Profile.jsx
├── services/           # External communication
│   ├── api.js          # HTTP client
│   └── socketService.js# WebSocket client
└── store/              # State management
    ├── useAuthStore.js
    ├── useGameStore.js
    └── useCardStore.js
```

### Component Hierarchy
```
App
├── Navbar
└── Router
    ├── Home
    ├── Login
    ├── Register
    ├── Battle
    │   └── BattleArena
    │       ├── BattleScene (Three.js)
    │       │   ├── Arena
    │       │   ├── Towers
    │       │   ├── Units
    │       │   └── CombatSystem
    │       └── BattleUI
    │           ├── ElixirBar
    │           ├── TowerIndicators
    │           ├── HandCards
    │           └── Timer
    ├── DeckBuilder
    ├── CardCollection
    └── Profile
```

### State Flow
```
User Action
    ↓
Component Handler
    ↓
Zustand Store Action
    ↓
API/Socket Service
    ↓
Backend Processing
    ↓
Response/Event
    ↓
Store Update
    ↓
Component Re-render
```

## Backend Architecture

### Directory Structure
```
backend/src/
├── config/
│   ├── database.js     # PostgreSQL connection
│   ├── migrate.js      # Schema migrations
│   └── seed.js         # Initial data
├── middleware/
│   └── authMiddleware.js # JWT verification
├── models/             # Database models
│   ├── UserModel.js
│   ├── CardModel.js
│   ├── DeckModel.js
│   └── MatchModel.js
├── routes/             # REST API routes
│   ├── authRoutes.js
│   ├── cardRoutes.js
│   ├── deckRoutes.js
│   └── userRoutes.js
├── services/           # Business logic
│   └── matchmakingService.js
├── websocket/          # Socket.io handlers
│   └── battleHandler.js
├── index.js            # HTTP server
└── socketIndex.js      # WebSocket server
```

### Request Flow - REST API
```
HTTP Request
    ↓
Express Router
    ↓
Auth Middleware (if protected)
    ↓
Route Handler
    ↓
Model Method
    ↓
PostgreSQL Query
    ↓
Response with Data
```

### Request Flow - WebSocket
```
Socket Event
    ↓
Socket.io Server
    ↓
Auth Verification
    ↓
Event Handler
    ↓
Matchmaking/Battle Service
    ↓
Database Update
    ↓
Emit to Client(s)
```

## Database Schema

### Entity Relationship Diagram
```
┌─────────────┐
│    users    │
├─────────────┤
│ id (PK)     │───┐
│ username    │   │
│ email       │   │
│ pass_hash   │   │
│ trophies    │   │
│ gold        │   │
│ gems        │   │
│ level       │   │
└─────────────┘   │
                  │
                  │ 1:N
                  │
         ┌────────┴─────────┬─────────────┬──────────────┐
         │                  │             │              │
         ▼                  ▼             ▼              ▼
┌─────────────┐    ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ user_cards  │    │   decks     │  │  matches    │  │  matches    │
├─────────────┤    ├─────────────┤  │ (player1)   │  │ (player2)   │
│ id (PK)     │    │ id (PK)     │  ├─────────────┤  ├─────────────┤
│ user_id(FK) │    │ user_id(FK) │  │ id (PK)     │  │ id (PK)     │
│ card_id(FK) │───┐│ card_slot_1 │  │ player1_id  │  │ player2_id  │
│ level       │   ││ card_slot_2 │  │ player2_id  │  │ winner_id   │
│ quantity    │   ││ ...         │  │ winner_id   │  │ duration    │
└─────────────┘   ││ card_slot_8 │  │ trophies    │  │ replay      │
                  │└─────────────┘  │ gold        │  └─────────────┘
                  │                 └─────────────┘
                  │
                  │ N:1
                  │
                  ▼
         ┌─────────────┐
         │    cards    │
         ├─────────────┤
         │ id (PK)     │
         │ name        │
         │ type        │
         │ rarity      │
         │ elixir_cost │
         │ stats       │
         └─────────────┘
```

## Authentication Flow

```
Registration:
Client → POST /api/auth/register {username, email, password}
    ↓
Backend → Hash password with bcrypt
    ↓
Backend → Insert user into database
    ↓
Backend → Add starter cards to user
    ↓
Backend → Generate JWT token
    ↓
Backend → Return {token, user}
    ↓
Client → Store token in localStorage

Login:
Client → POST /api/auth/login {email, password}
    ↓
Backend → Find user by email
    ↓
Backend → Verify password with bcrypt
    ↓
Backend → Generate JWT token
    ↓
Backend → Return {token, user}
    ↓
Client → Store token in localStorage

Protected Request:
Client → GET /api/cards/user (with Authorization: Bearer TOKEN)
    ↓
Backend → Extract token from header
    ↓
Backend → Verify JWT
    ↓
Backend → Attach user info to request
    ↓
Backend → Process request
    ↓
Backend → Return data
```

## Matchmaking Flow

```
Player 1 Joins Queue:
Client → Socket: matchmaking:join {deckId}
    ↓
Server → Verify deck exists
    ↓
Server → Add to queue with trophy info
    ↓
Server → Try to find match

Player 2 Joins Queue:
Client → Socket: matchmaking:join {deckId}
    ↓
Server → Add to queue
    ↓
Server → Find Player 1 (trophy diff < 200)
    ↓
Server → Create match in database
    ↓
Server → Initialize match state
    ↓
Server → Emit matchmaking:found to both players
    ↓
Server → Start elixir generation interval
    ↓
Server → Start match timer (3 min)

During Battle:
Client → Socket: battle:deploy {cardId, position}
    ↓
Server → Validate elixir cost
    ↓
Server → Deduct elixir
    ↓
Server → Create unit
    ↓
Server → Emit battle:unit_deployed to both
    ↓
Client → Render unit in 3D scene
    ↓
Combat System → Auto-target and attack
    ↓
Client → Socket: battle:tower_damage {tower, damage}
    ↓
Server → Update tower health
    ↓
Server → Emit battle:tower_damaged
    ↓
Server → Check win condition
    ↓
Server → If won: matchmaking:endMatch

Match End:
Server → Calculate trophy changes
    ↓
Server → Calculate gold rewards
    ↓
Server → Update database
    ↓
Server → Emit battle:end to both players
    ↓
Client → Show results screen
```

## 3D Rendering Pipeline

```
Scene Initialization:
BattleScene.init()
    ↓
Create THREE.Scene
    ↓
Create PerspectiveCamera
    ↓
Create WebGLRenderer with shadows
    ↓
Add OrbitControls
    ↓
Create Arena (ground, river, bridges)
    ↓
Create Towers (6 total, 3 per side)
    ↓
Add Lights (ambient, directional, hemisphere)
    ↓
Initialize CombatSystem
    ↓
Start Animation Loop

Unit Spawning:
User deploys card
    ↓
AssetLoader.cloneModel(characterName)
    ↓
Position model at click location
    ↓
Add to scene
    ↓
Create unit object with stats
    ↓
Add to CombatSystem

Animation Loop (60 FPS):
requestAnimationFrame()
    ↓
Update controls (OrbitControls)
    ↓
CombatSystem.update(deltaTime)
    │  ├─ For each unit:
    │  │     ├─ Find target
    │  │     ├─ Move towards target
    │  │     └─ Attack if in range
    │  └─ Remove dead units
    ↓
Update health bar positions
    ↓
Render scene with camera
```

## Communication Protocols

### REST API (HTTP)
- Used for: Authentication, CRUD operations, static data
- Format: JSON
- Authentication: Bearer token in Authorization header

### WebSocket (Socket.io)
- Used for: Real-time game events, matchmaking
- Format: Event-based with JSON payloads
- Authentication: Token in handshake

### Key Events

**Client → Server:**
- `matchmaking:join` - Join matchmaking
- `matchmaking:leave` - Leave queue
- `battle:deploy` - Deploy card
- `battle:emote` - Send emote
- `battle:surrender` - Give up

**Server → Client:**
- `matchmaking:found` - Match ready
- `battle:elixir_update` - Elixir changed
- `battle:unit_deployed` - Unit spawned
- `battle:tower_damaged` - Tower took damage
- `battle:tower_destroyed` - Tower destroyed
- `battle:timer_update` - Time remaining
- `battle:end` - Match finished

## Performance Optimizations

### Frontend
1. **Asset Loading**: Models loaded once and cloned
2. **State Updates**: Minimal re-renders with Zustand
3. **3D Rendering**: Shadow map size optimized (2048)
4. **Fog**: Depth culling for distant objects
5. **Delta Time**: Frame-independent physics

### Backend
1. **Database Indexes**: On foreign keys and lookups
2. **Connection Pooling**: PostgreSQL pool for efficiency
3. **JWT Caching**: Decoded once per request
4. **Match State**: In-memory during battle
5. **Intervals**: Single timer per match

## Security Measures

### Authentication
- Passwords hashed with bcrypt (10 rounds)
- JWT with expiration (7 days)
- Tokens stored client-side (localStorage)
- Protected routes with middleware

### Validation
- Elixir validation server-side
- Card ownership verification
- Deck validity checks
- Match state verification

### Anti-Cheat
- Server-authoritative game state
- All combat calculated server-side
- Tower damage verified
- Replay data stored for review

## Scalability Considerations

### Current Architecture
- Single server design
- In-memory match state
- Direct database connections

### Future Improvements
1. **Load Balancing**: Multiple API servers
2. **Redis**: Shared session/match state
3. **Microservices**: Separate matchmaking service
4. **Message Queue**: Async match processing
5. **CDN**: Static assets delivery
6. **Database Replication**: Read replicas
7. **Horizontal Scaling**: Multiple Socket.io servers with adapter

## Deployment Architecture

```
Production Setup:
┌────────────────────────────────────────────────┐
│                    CDN                          │
│              (Static Assets)                    │
└─────────────────┬──────────────────────────────┘
                  │
┌─────────────────▼──────────────────────────────┐
│              Load Balancer                      │
└─────────┬──────────────────┬───────────────────┘
          │                  │
┌─────────▼────────┐  ┌──────▼──────────┐
│  Frontend Server │  │  Backend Servers │
│   (Nginx/Vite)   │  │  (PM2/Cluster)   │
└──────────────────┘  └──────┬───────────┘
                             │
                      ┌──────▼───────────┐
                      │   PostgreSQL     │
                      │   (Managed DB)   │
                      └──────────────────┘
```

## Technology Versions

- Node.js: v18+
- React: 18.2.0
- Three.js: 0.159.0
- Express: 4.18.2
- Socket.io: 4.6.1
- PostgreSQL: 14+
- Zustand: 4.4.7
- Tailwind CSS: 3.4.0

---

This architecture provides:
- ✅ Real-time multiplayer
- ✅ 3D rendering in browser
- ✅ Scalable data model
- ✅ Secure authentication
- ✅ Responsive UI
- ✅ Server-authoritative gameplay

