@echo off
echo 🔧 Ngrok Test Script
echo ==================
echo.

echo Testing if ngrok is installed and working...
echo.

REM Test if ngrok command exists
where ngrok >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ ERROR: ngrok command not found
    echo.
    echo Make sure ngrok is:
    echo 1. Downloaded from https://ngrok.com/
    echo 2. Extracted to a folder
    echo 3. Added to your PATH, or run from the ngrok folder
    echo.
    echo Alternative: Copy ngrok.exe to this game folder
    goto :error
)

echo ✅ ngrok command found
echo.

echo Testing ngrok version...
ngrok version
echo.

echo Testing your static domain...
echo Command that will be run:
echo   ngrok http --domain=trusting-slug-tolerant.ngrok-free.app 8080
echo.

echo 📋 Before running this:
echo 1. Make sure your server is running: cd server && node server.js
echo 2. Make sure you're logged into ngrok: ngrok authtoken YOUR_TOKEN
echo 3. Make sure your static domain is configured in your ngrok account
echo.

echo Press Y to test ngrok, or any other key to exit...
choice /c YN /n >nul
if errorlevel 2 goto :end

echo.
echo 🚀 Starting ngrok test...
echo (Press Ctrl+C to stop)
echo.

ngrok http --domain=trusting-slug-tolerant.ngrok-free.app 8080

:error
echo.
echo ❌ Something went wrong. Check the messages above.

:end
echo.
echo Press any key to exit...
pause >nul
