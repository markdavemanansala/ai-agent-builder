@echo off
echo 🚀 AI Agent Builder MVP Setup
echo ==============================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

echo ✅ Node.js detected
node --version

REM Install root dependencies
echo 📦 Installing root dependencies...
call npm install

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
cd frontend
call npm install
cd ..

REM Install backend dependencies
echo 📦 Installing backend dependencies...
cd backend
call npm install
cd ..

echo.
echo 🎉 Setup complete!
echo.
echo Next steps:
echo 1. Set up your Supabase project:
echo    - Create a new Supabase project
echo    - Run the SQL schema from database/schema.sql
echo    - Enable Google OAuth (optional)
echo.
echo 2. Configure environment variables:
echo    - Copy frontend/env.example to frontend/.env
echo    - Copy backend/env.example to backend/.env
echo    - Fill in your Supabase and API keys
echo.
echo 3. Start development servers:
echo    npm run dev
echo.
echo 4. Open http://localhost:3000 in your browser
echo.
echo 📚 See README.md for detailed instructions
pause
