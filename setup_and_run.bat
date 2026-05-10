@echo off
title Ayurvritta Ayurveda Hospital - Setup
color 0a

echo.
echo ============================================
echo    Ayurvritta Ayurveda Hospital Setup
echo ============================================
echo.

REM Check for Node.js
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js found
echo.

REM Check for npm
npm -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed!
    pause
    exit /b 1
)

echo [OK] npm found
echo.

REM Install dependencies
echo ----------------------------------------
echo Installing dependencies...
echo ----------------------------------------
call npm install

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Failed to install dependencies!
    pause
    exit /b 1
)

echo.
echo [OK] Dependencies installed successfully
echo.

REM Start development server
echo ----------------------------------------
echo Starting development server...
echo ----------------------------------------
echo.
echo Open your browser and go to:
echo http://localhost:5173
echo.
echo Press Ctrl+C to stop the server
echo.

call npm run dev

pause