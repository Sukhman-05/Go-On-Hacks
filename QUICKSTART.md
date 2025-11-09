# 🚀 Quick Start Guide

Get up and running in 5 minutes!

## Prerequisites

- Node.js (v16+)
- PostgreSQL (v13+)

## Setup Steps

### 1. Create Database

```bash
createdb sperm_racing
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run migrate
npm run seed
```

### 3. Start Backend (2 terminals)

**Terminal 1 - API Server:**
```bash
cd backend
npm run dev
```

**Terminal 2 - WebSocket Server:**
```bash
cd backend
node src/socketIndex.js
```

### 4. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### 5. Open Browser

Navigate to `http://localhost:3000`

**Test Login:**
- Email: `test1@example.com`
- Password: `password123`

## That's it! 🎉

You should now see the game dashboard with test data.

## Quick Actions

1. **Summon a Racer**: Click "Summon New Racer" (costs 100 DNA Credits)
2. **Race**: Go to Race → Select racer → Start PvE Race
3. **View Leaderboard**: Check rankings
4. **Evolve**: Get a racer to 500 XP to unlock evolution

## Troubleshooting

**Database connection error?**
- Check PostgreSQL is running: `pg_isready`
- Verify DATABASE_URL in backend/.env

**Port already in use?**
- Change PORT in backend/.env
- Change VITE_API_URL in frontend/.env

**WebSocket not connecting?**
- Ensure socketIndex.js is running
- Check SOCKET_PORT (default 3002)

## Architecture

```
Frontend (React)     →  Backend API (Express)  →  PostgreSQL
    ↓                        ↓
Socket.IO Client    →  WebSocket Server
                          (PvP Racing)
```

## Need Help?

Check the full [README.md](./README.md) for detailed documentation.

Happy Racing! 🏁

