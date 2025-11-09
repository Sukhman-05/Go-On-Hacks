#!/bin/bash

echo "🎮 Clash Royale 3D Clone - Setup Script"
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18+ first."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL first."
    exit 1
fi

echo "✅ PostgreSQL found"

# Install root dependencies
echo ""
echo "📦 Installing root dependencies..."
npm install

# Install backend dependencies
echo ""
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies
echo ""
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Create database if it doesn't exist
echo ""
echo "🗄️  Setting up database..."
if psql -lqt | cut -d \| -f 1 | grep -qw sperm_racing; then
    echo "✅ Database 'sperm_racing' already exists"
else
    echo "Creating database 'sperm_racing'..."
    createdb sperm_racing
    echo "✅ Database created"
fi

# Run migrations
echo ""
echo "🔄 Running database migrations..."
cd backend
npm run migrate

# Seed database
echo ""
echo "🌱 Seeding database with initial data..."
npm run seed
cd ..

# Copy 3D models
echo ""
echo "🎭 Copying 3D character models..."
mkdir -p frontend/public/models/characters
cp -r KayKit_Adventurers_2.0_FREE/Characters/gltf/* frontend/public/models/characters/
echo "✅ Models copied"

echo ""
echo "======================================"
echo "✨ Setup Complete!"
echo "======================================"
echo ""
echo "To start the game, run:"
echo "  npm start"
echo ""
echo "Or start servers individually:"
echo "  Terminal 1: npm run dev:backend"
echo "  Terminal 2: npm run dev:socket"
echo "  Terminal 3: npm run dev:frontend"
echo ""
echo "The game will be available at: http://localhost:5173"
echo ""
echo "Happy Gaming! 🎮"

