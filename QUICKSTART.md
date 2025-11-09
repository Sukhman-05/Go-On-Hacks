# Quick Start Guide

Get up and running with the Clash Royale 3D Clone in just a few minutes!

## Prerequisites
- Node.js v18+ installed
- PostgreSQL installed and running
- Terminal/Command Line

## Setup (5 minutes)

### Step 1: Install Dependencies
From the project root, run:
```bash
npm install
npm run install:all
```

### Step 2: Setup Database
Make sure PostgreSQL is running, then:
```bash
# Create database (if not exists)
createdb sperm_racing

# Run migrations and seed data
npm run db:migrate
npm run db:seed
```

### Step 3: Start All Servers
```bash
npm start
```

This will start:
- Backend API on `http://localhost:3001`
- Socket.io server on `http://localhost:3002`
- Frontend on `http://localhost:5173`

## First Time Playing

1. Open `http://localhost:5173` in your browser
2. Click "Sign Up" and create an account
3. Go to "Deck" and create your first deck (select 8 cards)
4. Click "Battle" to find a match!

## Manual Server Control

If you prefer to run servers individually:

```bash
# Terminal 1 - Backend API
npm run dev:backend

# Terminal 2 - Socket.io Server
npm run dev:socket

# Terminal 3 - Frontend
npm run dev:frontend
```

## Troubleshooting

### "Port already in use"
```bash
# macOS/Linux
lsof -ti:3001 | xargs kill
lsof -ti:3002 | xargs kill
lsof -ti:5173 | xargs kill

# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### "Cannot connect to database"
```bash
# Check if PostgreSQL is running
pg_ctl status

# Start PostgreSQL (macOS with Homebrew)
brew services start postgresql

# Start PostgreSQL (Linux)
sudo service postgresql start
```

### "3D models not loading"
```bash
# Copy models to public folder
cp -r KayKit_Adventurers_2.0_FREE/Characters/gltf/* frontend/public/models/characters/
```

## Next Steps

- Check out the full [README.md](README.md) for detailed documentation
- Explore the codebase in `/frontend/src` and `/backend/src`
- Customize cards in the database seed file
- Add your own 3D models!

## Need Help?

Open an issue on GitHub or check the troubleshooting section in the main README.

Happy Gaming! 🎮

