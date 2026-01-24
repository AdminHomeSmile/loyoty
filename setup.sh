#!/bin/bash

# Quick Start Script for Loyalty Rewards Hub Analytics Dashboard

echo "🚀 Setting up Loyalty Rewards Hub Analytics Dashboard..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
echo "This may take a few minutes..."
echo ""

npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "✅ Dependencies installed successfully!"
echo ""

# Create backend .env file if it doesn't exist
if [ ! -f backend/.env ]; then
    echo "⚙️  Creating backend .env file..."
    cp backend/.env.example backend/.env
    echo "✅ Backend .env file created"
fi

echo ""
echo "✨ Setup complete! You can now start the application."
echo ""
echo "To start the application in development mode:"
echo "  npm run dev"
echo ""
echo "This will start:"
echo "  - Backend API on http://localhost:3001"
echo "  - Frontend Dashboard on http://localhost:3000"
echo ""
echo "Visit http://localhost:3000 to view the Analytics Dashboard"
echo ""
