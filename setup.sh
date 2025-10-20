#!/bin/bash

echo "🚀 AI Agent Builder MVP Setup"
echo "=============================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Set up your Supabase project:"
echo "   - Create a new Supabase project"
echo "   - Run the SQL schema from database/schema.sql"
echo "   - Enable Google OAuth (optional)"
echo ""
echo "2. Configure environment variables:"
echo "   - Copy frontend/env.example to frontend/.env"
echo "   - Copy backend/env.example to backend/.env"
echo "   - Fill in your Supabase and API keys"
echo ""
echo "3. Start development servers:"
echo "   npm run dev"
echo ""
echo "4. Open http://localhost:3000 in your browser"
echo ""
echo "📚 See README.md for detailed instructions"
