#!/bin/bash

# Monkey Snowfight - Quick Remote Setup Script
# This script helps you set up the game for remote play using ngrok

echo "🐒 Monkey Snowfight - Remote Play Setup"
echo "========================================"
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok is not installed."
    echo ""
    echo "Please install ngrok first:"
    echo "1. Go to https://ngrok.com/"
    echo "2. Sign up for a free account"
    echo "3. Download and install ngrok"
    echo "4. Run this script again"
    echo ""
    exit 1
fi

echo "✅ ngrok is installed!"
echo ""

# Check if Node.js server is running
echo "🔍 Checking if server is running on port 8080..."
if ! nc -z localhost 8080 2>/dev/null; then
    echo "❌ Server is not running on port 8080"
    echo ""
    echo "Please start your server first:"
    echo "  cd server"
    echo "  node server.js"
    echo ""
    echo "Then run this script again."
    exit 1
fi

echo "✅ Server is running on port 8080!"
echo ""

echo "🚀 Starting ngrok tunnel..."
echo ""
echo "This will create a public URL that your brother can use to connect."
echo "Keep this terminal open while playing!"
echo ""
echo "When ngrok starts, look for a line like:"
echo "  Forwarding    tcp://0.tcp.ngrok.io:12345 -> localhost:8080"
echo ""
echo "Share the ngrok URL (tcp://0.tcp.ngrok.io:12345) with your brother."
echo "He needs to update gameData.js with this URL."
echo ""
echo "Press any key to start ngrok..."
read -n 1 -s

ngrok tcp 8080
