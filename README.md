# Clash Royale 3D Clone

A full-featured 3D tower defense game inspired by Clash Royale, built with React, Three.js, Node.js, and PostgreSQL. Features real-time multiplayer battles, card collection, deck building, and progression systems.

![Game Banner](https://via.placeholder.com/800x200/8B5CF6/FFFFFF?text=Clash+Royale+3D+Clone)

## 🎮 Features

### Core Gameplay
- ⚔️ **Real-time Multiplayer Battles**: Fight against other players in intense 3-minute matches
- 🎯 **3D Battle Arena**: Fully rendered 3D environment with Three.js
- 🃏 **Card System**: 15+ unique cards with different rarities and abilities
- 💎 **Elixir Management**: Strategic resource management during battles
- 🏰 **Tower Defense**: Protect your towers while destroying enemy towers

### Game Systems
- 👤 **User Authentication**: Secure JWT-based authentication
- 🎴 **Card Collection**: Collect, unlock, and upgrade cards
- 📋 **Deck Building**: Create custom 8-card decks
- 🏆 **Trophy System**: Competitive ranking with ELO-based matchmaking
- 💰 **Economy**: Gold and gems for upgrades and purchases
- 📊 **Progression**: Level up cards and your player profile
- 📈 **Leaderboards**: Compete globally

### Technical Features
- 🌐 **WebSocket Communication**: Real-time game state synchronization
- 🎨 **Modern UI**: Beautiful interface with Tailwind CSS
- 🔄 **State Management**: Zustand for efficient state handling
- 🗄️ **PostgreSQL Database**: Robust data persistence
- 🎭 **3D Character Models**: KayKit Adventurer models (Knight, Barbarian, Mage, Ranger, Rogue)

## 🛠️ Tech Stack

### Frontend
- **React** 18.2 - UI framework
- **Vite** - Build tool
- **Three.js** - 3D rendering
- **React Three Fiber** - React renderer for Three.js
- **Zustand** - State management
- **Tailwind CSS** - Styling
- **Socket.io Client** - Real-time communication

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **Socket.io** - WebSocket server
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **PostgreSQL** (v14 or higher)
- **npm** or **yarn**

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Go-On-Hacks
```

### 2. Database Setup

Create a PostgreSQL database:
```bash
createdb sperm_racing
```

The `.env` file already contains the database configuration:
```
DATABASE_URL=postgresql://sukhman@localhost:5432/sperm_racing
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRATION=7d
PORT=3001
SOCKET_PORT=3002
NODE_ENV=development
```

### 3. Install Dependencies

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd frontend
npm install
```

### 4. Database Migration & Seeding

Run the database migrations to create tables:
```bash
cd backend
npm run migrate
```

Seed the database with initial card data:
```bash
npm run seed
```

### 5. Start the Servers

You'll need to run both servers in separate terminal windows:

#### Terminal 1 - API Server
```bash
cd backend
npm run dev
```
The API server will start on `http://localhost:3001`

#### Terminal 2 - Socket.io Server
```bash
cd backend
node src/socketIndex.js
```
The Socket.io server will start on `http://localhost:3002`

#### Terminal 3 - Frontend
```bash
cd frontend
npm run dev
```
The frontend will start on `http://localhost:5173`

## 🎮 How to Play

### 1. Create an Account
- Navigate to `http://localhost:5173`
- Click "Sign Up" and create your account
- You'll receive 10 starter cards automatically

### 2. Build Your Deck
- Go to "Deck" in the navigation
- Click "New Deck"
- Select exactly 8 cards from your collection
- Name your deck and save it

### 3. Start a Battle
- Click "Battle" in the navigation
- Ensure you have a deck selected
- Click "Find Match"
- Wait for matchmaking to find an opponent

### 4. During Battle
- Deploy cards by clicking on them, then clicking on the arena
- Each card costs elixir (shown on the card)
- Elixir regenerates automatically (1 per 2.8 seconds, max 10)
- Destroy enemy towers to win
- Battle lasts 3 minutes
- Destroying the King Tower (center) results in instant victory

### 5. Post-Battle
- Earn trophies and gold based on performance
- Use gold to upgrade your cards
- Climb the leaderboard!

## 📁 Project Structure

```
/
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── Navbar.jsx
│   │   │   ├── BattleArena.jsx
│   │   │   └── BattleUI.jsx
│   │   ├── game/            # Three.js game logic
│   │   │   ├── AssetLoader.js
│   │   │   ├── BattleScene.js
│   │   │   └── CombatSystem.js
│   │   ├── pages/           # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── Battle.jsx
│   │   │   ├── DeckBuilder.jsx
│   │   │   ├── CardCollection.jsx
│   │   │   └── Profile.jsx
│   │   ├── services/        # API & Socket services
│   │   │   ├── api.js
│   │   │   └── socketService.js
│   │   ├── store/           # State management
│   │   │   ├── useAuthStore.js
│   │   │   ├── useGameStore.js
│   │   │   └── useCardStore.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── public/
│       └── models/          # 3D character models
│           └── characters/
├── backend/
│   └── src/
│       ├── config/          # Database & config
│       │   ├── database.js
│       │   ├── migrate.js
│       │   └── seed.js
│       ├── middleware/      # Express middleware
│       │   └── authMiddleware.js
│       ├── models/          # Database models
│       │   ├── UserModel.js
│       │   ├── CardModel.js
│       │   ├── DeckModel.js
│       │   └── MatchModel.js
│       ├── routes/          # API routes
│       │   ├── authRoutes.js
│       │   ├── cardRoutes.js
│       │   ├── deckRoutes.js
│       │   └── userRoutes.js
│       ├── services/        # Business logic
│       │   └── matchmakingService.js
│       ├── websocket/       # Socket.io handlers
│       │   └── battleHandler.js
│       ├── index.js         # API server
│       └── socketIndex.js   # Socket.io server
└── KayKit_Adventurers_2.0_FREE/  # 3D assets
```

## 🎴 Card Types

### Troops
- **Knight** (Common, 3 elixir) - Balanced melee fighter
- **Barbarian** (Common, 5 elixir) - High damage warrior
- **Mage** (Rare, 4 elixir) - Ranged spellcaster with area damage
- **Ranger** (Rare, 3 elixir) - Swift archer with long range
- **Rogue** (Epic, 4 elixir) - Fast assassin with burst damage
- **Giant** (Rare, 5 elixir) - Massive tank
- **Archers** (Common, 3 elixir) - Pair of ranged attackers
- **Elite Barbarian** (Epic, 6 elixir) - Fast and powerful
- **Wizard** (Legendary, 5 elixir) - Powerful splash damage

### Spells
- **Fireball** (Rare, 4 elixir) - Area damage
- **Freeze** (Epic, 4 elixir) - Freezes enemies
- **Heal** (Common, 3 elixir) - Heals friendly troops

### Buildings
- **Arrow Tower** (Common, 3 elixir) - Defensive tower
- **Cannon** (Common, 3 elixir) - Ground defense

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Cards
- `GET /api/cards` - Get all cards
- `GET /api/cards/user` - Get user's card collection
- `POST /api/cards/:id/upgrade` - Upgrade a card

### Decks
- `GET /api/decks` - Get user's decks
- `POST /api/decks` - Create new deck
- `PUT /api/decks/:id` - Update deck
- `DELETE /api/decks/:id` - Delete deck

### Users
- `GET /api/users/:id` - Get user profile
- `GET /api/users/leaderboard/top` - Get leaderboard
- `GET /api/users/:id/matches` - Get match history

## 🎯 WebSocket Events

### Client → Server
- `matchmaking:join` - Join matchmaking queue
- `matchmaking:leave` - Leave matchmaking queue
- `battle:deploy` - Deploy a card
- `battle:emote` - Send emote
- `battle:surrender` - Surrender match

### Server → Client
- `matchmaking:found` - Match found
- `battle:elixir_update` - Elixir updated
- `battle:unit_deployed` - Unit deployed
- `battle:tower_damaged` - Tower took damage
- `battle:tower_destroyed` - Tower destroyed
- `battle:timer_update` - Time remaining updated
- `battle:end` - Match ended

## 🎨 3D Models

The game uses the KayKit Adventurers 2.0 FREE pack with the following characters:
- Knight (Knight.glb)
- Barbarian (Barbarian.glb)
- Mage (Mage.glb)
- Ranger (Ranger.glb)
- Rogue (Rogue.glb / Rogue_Hooded.glb)

Models are automatically loaded from `/frontend/public/models/characters/`

## 🐛 Troubleshooting

### Port Already in Use
If you get a "port already in use" error:
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill

# Kill process on port 3002
lsof -ti:3002 | xargs kill

# Kill process on port 5173
lsof -ti:5173 | xargs kill
```

### Database Connection Issues
Make sure PostgreSQL is running:
```bash
# Check status
pg_ctl status

# Start PostgreSQL
brew services start postgresql
```

### 3D Models Not Loading
Ensure the models are copied to the public folder:
```bash
cd /Users/sukhman/Go-On-Hacks
cp -r KayKit_Adventurers_2.0_FREE/Characters/gltf/* frontend/public/models/characters/
```

### CORS Issues
The backend is configured to allow all origins in development. If you have issues:
- Check that both servers are running
- Verify the proxy configuration in `frontend/vite.config.js`

## 🔐 Security Notes

⚠️ **Important for Production**:
- Change `JWT_SECRET` to a strong, random value
- Enable PostgreSQL SSL
- Add rate limiting
- Implement input validation
- Use environment-specific configurations
- Add HTTPS
- Implement proper CORS policies

## 📝 License

This project uses the KayKit Adventurers 2.0 asset pack. Please review the license in `KayKit_Adventurers_2.0_FREE/License.txt`.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues and questions, please open an issue on the GitHub repository.

## 🎉 Acknowledgments

- KayKit for the amazing 3D character models
- Three.js community for excellent documentation
- Clash Royale by Supercell for the inspiration

---

Made with ❤️ using React, Three.js, and Node.js

