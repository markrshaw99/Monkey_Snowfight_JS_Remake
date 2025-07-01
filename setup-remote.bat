@echo off
echo 🐒 Monkey Snowfight - Remote Play Setup (Free ngrok)
echo ===================================================
echo.

echo ℹ️  Using FREE ngrok (dynamic URLs)
echo 🌐 You'll get a new random URL each time you restart
echo.

REM Check if ngrok is available
where ngrok >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ ngrok is not installed.
    echo.
    echo Please install ngrok first:
    echo 1. Go to https://ngrok.com/
    echo 2. Sign up for a free account  
    echo 3. Download and install ngrok
    echo 4. Run this script again
    echo.
    pause
    exit /b 1
)

echo ✅ ngrok is installed!
echo.

REM Check if ngrok is authenticated
echo 🔐 Checking ngrok authentication...
ngrok config check >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ ngrok is not authenticated.
    echo.
    echo You need to set up your ngrok authtoken:
    echo 1. Go to: https://dashboard.ngrok.com/get-started/your-authtoken
    echo 2. Copy your authtoken
    echo 3. Run: ngrok authtoken YOUR_TOKEN_HERE
    echo 4. Run this script again
    echo.
    echo Example: ngrok authtoken 2abc123def456ghi789...
    echo.
    pause
    exit /b 1
)

echo ✅ ngrok is authenticated!
echo.

echo 🔍 Make sure your server is running...
echo If you haven't started it yet, open another terminal and run:
echo   cd server
echo   node server.js
echo.

echo 🚀 Starting ngrok tunnel (free version - dynamic URL)...
echo.
echo ⚠️  IMPORTANT: Look for the HTTPS URL that ngrok shows
echo    It will look like: https://abc123.ngrok-free.app
echo.
echo 📋 Steps after ngrok starts:
echo 1. Copy the HTTPS URL (like https://abc123.ngrok-free.app)
echo 2. Change it to WSS (wss://abc123.ngrok-free.app)
echo 3. Update gameData.js with this WSS URL
echo 4. Share the updated game with your brother
echo.
echo Keep this terminal open while playing!
echo.
echo Press any key to start ngrok tunnel...
pause >nul

echo Starting ngrok tunnel...
echo.

ngrok http 8080

echo.
echo Ngrok has stopped or failed to start.
echo Press any key to exit...
pause >nul
