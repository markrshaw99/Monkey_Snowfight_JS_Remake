# Monkey Snowfight - Online Multiplayer Setup

## How Your Brother Joins the Game (EASY WAY!)

### 1. Setup (One-time)
```bash
# Install Node.js (if you don't have it)
# Download from: https://nodejs.org

# Navigate to server folder
cd server

# Install dependencies
npm install
```

### 2. Start the Server
```bash
# In the server folder
npm start
```
You should see: "🎮 Monkey Snowfight Server running on ws://localhost:8080"

### 3. Both Players Join
1. **You**: Open `index.html` in your browser
2. **Your Brother**: Open the same `index.html` in his browser
3. Both of you will see "Find Players" button (if connected)

### 4. Challenge Each Other
1. Click "**Find Players**" button
2. You'll see a list with:
   - Your name: "Player123" (example)
   - Other players online: "Player456" (your brother)
3. Click "**Challenge**" next to your brother's name
4. Confirm the challenge
5. Game starts automatically!

### 5. No More Confusing Player IDs!
- ✅ Each player gets a simple name like "Player123"
- ✅ Visual list shows who's online
- ✅ One-click to challenge
- ✅ No typing cryptic IDs

## Example Flow:
```
You: "Player789"          Brother: "Player456"
     ↓                           ↓
[Find Players] → List: "Player456" [Challenge] → GAME STARTS!
```

### 6. For Remote Play (Brother in different location)
- You'll need to expose your server to the internet
- Options:
  - **ngrok** (easiest): `npx ngrok http 8080`
  - **Port forwarding** on your router
  - **Deploy to cloud** (Heroku, Railway, etc.)

## Current Features
- ✅ Local gameplay (works offline)
- ✅ **Visual player list with names**
- ✅ **One-click challenges**
- ✅ **Auto-generated player names**
- ✅ Real-time player count
- ⏳ Game moves synchronization (needs game logic)

## Troubleshooting
- **"Server Offline"**: Make sure `npm start` is running in server folder
- **Empty player list**: Other player needs to also load the game
- **Browser console errors**: Open F12 → Console for details
