# Playing with Remote Players (Different Cities)

## � Using FREE ngrok (Dynamic URLs)

Static ngrok URLs require a paid plan, so we'll use the free version with dynamic URLs.

**How it works:** Each time you restart ngrok, you get a new random URL like `https://abc123.ngrok-free.app`

## Quick Setup (Free ngrok)

### Step 1: Start Your Game Server
```bash
cd server
node server.js
```
Your server should show: `🎮 Monkey Snowfight Server running on ws://localhost:8080`

### Step 2: Start ngrok Tunnel
Run the setup script:
```bash
./setup-remote.bat
```

Or manually:
```bash
ngrok http 8080
```

### Step 3: Get the Dynamic URL
When ngrok starts, you'll see something like:
```
Forwarding    https://abc123.ngrok-free.app -> http://localhost:8080
```

**Copy that HTTPS URL!** (e.g., `https://abc123.ngrok-free.app`)

### Step 4: Update gameData.js
1. Change the HTTPS to WSS: `wss://abc123.ngrok-free.app`
2. Update this line in `gameData.js`:
   ```javascript
   this.SERVER_URL = 'wss://abc123.ngrok-free.app';
   ```

### Step 5: Share with Your Brother
1. Zip up your entire game folder
2. Send it to your brother
3. Tell him to extract it and open `index.html`

**Note:** Each time you restart ngrok, you'll need to update the URL and send the updated game to your brother.

---

## 💡 Alternative: Simpler Approach

Since free ngrok requires URL updates each session, consider these easier options:

### Step 1: Install ngrok
1. Go to https://ngrok.com/
2. Sign up for a free account
3. Download ngrok for Windows
4. Follow their installation instructions

### Step 2: Start Your Game Server
```bash
cd server
node server.js
```
Your server should show: `🎮 Monkey Snowfight Server running on ws://localhost:8080`

### Step 3: Create Public Tunnel with ngrok
Open a new terminal and run:
```bash
ngrok tcp 8080
```

You'll see output like:
```
Forwarding    tcp://0.tcp.ngrok.io:12345 -> localhost:8080
```

### Step 4: Update Your Game Configuration
In your `gameData.js`, you'll need to change the WebSocket URL from `localhost` to the ngrok URL.

**For the host (you):**
- You can keep using `ws://localhost:8080` OR use the ngrok URL

**For remote players (your brother):**
- They need to use the ngrok URL: `ws://0.tcp.ngrok.io:12345`

### Step 5: Share the URL
Send your brother:
1. Your game's `index.html` file (or host it on a simple web server)
2. The ngrok URL from step 3
3. Instructions to modify `gameData.js` with the ngrok URL

---

## Option 2: Port Forwarding (More Permanent)

If you want a more permanent solution and have access to your router:

### Step 1: Find Your Local IP
```bash
ipconfig
```
Look for your IPv4 address (usually something like `192.168.1.xxx`)

### Step 2: Configure Router Port Forwarding
1. Access your router's admin panel (usually `192.168.1.1` or `192.168.0.1`)
2. Find "Port Forwarding" or "Virtual Server" settings
3. Add a new rule:
   - External Port: 8080
   - Internal IP: Your computer's local IP
   - Internal Port: 8080
   - Protocol: TCP

### Step 3: Find Your Public IP
Go to https://whatismyipaddress.com/ to find your public IP address

### Step 4: Share Connection Details
Your brother would connect to: `ws://YOUR_PUBLIC_IP:8080`

**Note:** This method exposes your server to the entire internet, so consider security implications.

---

## Option 3: Cloud Hosting (Most Reliable)

For the most reliable experience, consider deploying your server to a cloud service:

### Free Options:
- **Heroku** (Free tier available)
- **Railway** (Free tier available)  
- **Render** (Free tier available)

### Steps (Example with Railway):
1. Create account at https://railway.app/
2. Connect your GitHub repository
3. Deploy the `server` folder
4. Railway will provide a public URL like `wss://your-app.railway.app`
5. Update `gameData.js` to use this URL

---

## Quick Setup for ngrok

Here's exactly what you need to do:

1. **Install ngrok** and start the tunnel
2. **Modify gameData.js** to allow configurable server URL
3. **Send your brother** the game files and ngrok URL

Let me know which option you'd like to try, and I can help you implement it!
