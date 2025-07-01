@echo off
echo 🔐 Ngrok Authentication Setup
echo =============================
echo.

echo This script will help you authenticate ngrok.
echo.

REM Check if ngrok is available
where ngrok >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ ngrok is not installed.
    echo Please install ngrok first from https://ngrok.com/
    goto :end
)

echo ✅ ngrok is installed!
echo.

echo 📋 Steps to authenticate ngrok:
echo.
echo 1. Go to: https://dashboard.ngrok.com/get-started/your-authtoken
echo 2. Sign in to your ngrok account (or create one if needed)
echo 3. Copy your authtoken from the page
echo 4. Come back here and paste it
echo.

echo Opening the ngrok authtoken page in your browser...
start https://dashboard.ngrok.com/get-started/your-authtoken
echo.

set /p "authtoken=Paste your authtoken here and press Enter: "

if "%authtoken%"=="" (
    echo ❌ No authtoken provided.
    goto :end
)

echo.
echo 🔧 Setting up your authtoken...
ngrok authtoken %authtoken%

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Success! Your authtoken has been configured.
    echo.
    echo You can now run setup-remote.bat to start your game server tunnel.
) else (
    echo.
    echo ❌ Failed to set authtoken. Please check that you copied it correctly.
)

:end
echo.
echo Press any key to exit...
pause >nul
