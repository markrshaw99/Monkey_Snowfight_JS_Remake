// Simple game data management for local and online play
class GameData {
    constructor() {
        this.mode = 'local'; // 'local' or 'online'
        this.playerId = this.generatePlayerId();
        this.subscribers = [];
        
        // Server configuration - automatically detects the right URL
        this.SERVER_URL = this.getServerURL();
        // Auto-detected server URL
        
        this.playerData = {
            profile: {
                name: 'Player' + Math.floor(Math.random() * 1000), // Give each player a unique name
                id: this.playerId
            },
            stats: {
                gamesWon: 0,
                gamesLost: 0,
                rating: 1200,
                playersOnline: 0
            }
        };
        
        this.gameState = {
            inGame: false,
            gameMode: null, // 'local', 'practice', 'online'
            opponent: null
        };
        
        // Room-specific data
        this.roomData = {
            currentRoom: null,
            roomPlayers: [],
            chatMessages: []
        };
        
        // WebSocket connection (for online mode)
        this.socket = null;
        this.connected = false;
        
        // Load saved data
        this.loadFromLocal();
    }
    
    generatePlayerId() {
        return 'player_' + Math.random().toString(36).substr(2, 9);
    }
    
    getServerURL() {
        // Auto-detect the correct WebSocket URL based on current page
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        
        // If we're on localhost, use the standard port
        if (host.includes('localhost') || host.includes('127.0.0.1')) {
            // Using localhost WebSocket
            return 'ws://localhost:8080';
        }
        
        // For deployed versions, use the same host
        const wsUrl = `${protocol}//${host}`;
        // Using deployed WebSocket
        return wsUrl;
    }
    
    // === LOCAL STORAGE ===
    saveToLocal() {
        const saveData = {
            playerData: this.playerData,
            lastSaved: new Date().toISOString()
        };
        localStorage.setItem('monkeySnowfightData', JSON.stringify(saveData));
    }
    
    loadFromLocal() {
        try {
            const saved = localStorage.getItem('monkeySnowfightData');
            if (saved) {
                const data = JSON.parse(saved);
                this.playerData = { ...this.playerData, ...data.playerData };
                
                // Always reset players online count on startup since server connection is fresh
                this.playerData.stats.playersOnline = 0;
            }
        } catch (error) {
            console.warn('Could not load saved data:', error);
        }
    }
    
    // === ONLINE CONNECTION ===
    async connectToServer(serverUrl = null) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            // Already connected
            return; // Already connected
        }
        
        // Use provided URL or default to configured SERVER_URL
        const wsUrl = serverUrl || this.SERVER_URL;
        
        try {
            // Attempting to connect to server
            this.socket = new WebSocket(wsUrl);
            
            this.socket.onopen = () => {
                console.log('✅ Connected to game server successfully!');
                this.connected = true;
                this.mode = 'online';
                
                // Notify UI about connection status change
                this.notifySubscribers();
                
                // Send player info to server
                this.sendToServer({
                    type: 'playerJoin',
                    player: this.playerData.profile
                });
            };
            
            this.socket.onmessage = (event) => {
                this.handleServerMessage(JSON.parse(event.data));
            };
            
            this.socket.onclose = (event) => {
                console.log('❌ Disconnected from server. Code:', event.code, 'Reason:', event.reason);
                this.connected = false;
                this.mode = 'local';
                
                // Reset players online count when disconnected
                this.updateStats({ playersOnline: 0 });
                
                // Notify UI about connection status change
                this.notifySubscribers();
                this.notifySubscribers('connectionStatus', { connected: false });
            };
            
            this.socket.onerror = (error) => {
                console.error('❌ WebSocket error:', error);
                console.error('❌ Failed to connect to:', wsUrl);
                this.connected = false;
                this.mode = 'local';
                
                // Reset players online count when connection fails
                this.updateStats({ playersOnline: 0 });
                
                // Notify UI about connection status change
                this.notifySubscribers();
                this.notifySubscribers('connectionStatus', { connected: false, error: 'Connection failed' });
            };
            
        } catch (error) {
            console.error('Failed to connect to server:', error);
            this.connected = false;
            this.mode = 'local';
            
            // Reset players online count when connection fails
            this.updateStats({ playersOnline: 0 });
            
            // Notify UI about connection status change
            this.notifySubscribers();
            throw error; // Re-throw so the caller knows connection failed
        }
    }
    
    sendToServer(message) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(message));
        }
    }
    
    handleServerMessage(message) {
        switch (message.type) {
            case 'playersOnlineUpdate':
                this.updateStats({ playersOnline: message.count });
                break;
                
            case 'playersList':
                this.handlePlayersList(message.players);
                break;
                
            case 'roomsData':
                this.handleRoomsUpdate(message.rooms);
                break;
                
            case 'roomJoined':
                this.handleRoomJoined(message);
                break;
                
            case 'roomPlayers':
                this.handleRoomPlayers(message);
                break;
                
            case 'roomChatMessage':
                this.handleRoomChatMessage(message);
                break;
                
            case 'gameInvite':
                this.handleGameInvite(message);
                break;
                
            case 'inviteSent':
                this.handleInviteSent(message);
                break;
                
            case 'inviteAccepted':
                this.handleInviteAccepted(message);
                break;
                
            case 'inviteDeclined':
                this.handleInviteDeclined(message);
                break;
                
            case 'gameStart':
                this.handleGameStart(message);
                break;
                
            case 'gameMove':
                this.handleOpponentMove(message);
                break;
                
            case 'gameEnd':
                this.handleGameEnd(message);
                break;
        }
    }
    
    // === GAME ACTIONS ===
    updateStats(newStats) {
        this.playerData.stats = { ...this.playerData.stats, ...newStats };
        this.saveToLocal();
        
        // Notify subscribers (lobby scene, etc.)
        this.notifySubscribers();
    }
    
    startLocalGame() {
        this.gameState.inGame = true;
        this.gameState.gameMode = 'local';
        this.gameState.opponent = null;
    }
    
    startOnlineGame(opponentId) {
        if (!this.connected) {
            console.warn('Not connected to server');
            return false;
        }
        
        this.sendToServer({
            type: 'gameRequest',
            targetPlayer: opponentId,
            gameMode: 'snowfight'
        });
        
        return true;
    }
    
    sendGameMove(moveData) {
        if (this.gameState.gameMode === 'online' && this.connected) {
            this.sendToServer({
                type: 'gameMove',
                move: moveData,
                gameId: this.gameState.gameId
            });
        }
    }
    
    endGame(result) {
        // Update stats based on result
        if (result === 'won') {
            this.updateStats({ 
                gamesWon: this.playerData.stats.gamesWon + 1 
            });
        } else if (result === 'lost') {
            this.updateStats({ 
                gamesLost: this.playerData.stats.gamesLost + 1 
            });
        }
        
        // Reset game state
        this.gameState.inGame = false;
        this.gameState.gameMode = null;
        this.gameState.opponent = null;
    }
    
    // === EVENT HANDLING ===
    handleGameInvite(message) {
        // Show invitation popup
        const accept = confirm(`${message.fromPlayer} wants to challenge you to a snowball fight!\n\nAccept the challenge?`);
        
        // Send response to server
        this.sendToServer({
            type: 'gameInviteResponse',
            fromPlayerId: message.fromPlayerId,
            accepted: accept
        });
        
        // Game invite response
    }
    
    handleInviteSent(message) {
        // Invitation sent
        // You could show a toast notification here
        alert(`Challenge sent to ${message.targetPlayer}!\nWaiting for their response...`);
    }
    
    handleInviteAccepted(message) {
        // Invitation accepted
        alert(`${message.playerName} accepted your challenge!\nStarting game...`);
    }
    
    handleInviteDeclined(message) {
        // Invitation declined
        alert(`${message.playerName} declined your challenge.`);
    }
    
    handleGameStart(message) {
        this.gameState.inGame = true;
        this.gameState.gameMode = 'online';
        this.gameState.opponent = message.opponent;
        this.gameState.gameId = message.gameId;
        
        // Game starting
        
        // Notify the scene manager to switch to game scene
        if (this.gameStartCallback) {
            this.gameStartCallback(message.opponent);
        }
    }
    
    // Method for scenes to subscribe to game start events
    onGameStart(callback) {
        this.gameStartCallback = callback;
    }
    
    handleOpponentMove(message) {
        // Handle opponent's move in the game
        // Opponent move received
    }
    
    handleGameEnd(message) {
        this.endGame(message.result);
    }
    
    handlePlayersList(players) {
        // Players list received
        // Notify lobby scene about updated players list
        if (this.playersListCallback) {
            this.playersListCallback(players);
        }
    }
    
    handleRoomsUpdate(rooms) {
        // Rooms data received
        // Notify lobby scene about updated room data
        if (this.roomsUpdateCallback) {
            this.roomsUpdateCallback(rooms);
        }
    }
    
    // Method for lobby to subscribe to players list updates
    onPlayersListUpdate(callback) {
        this.playersListCallback = callback;
    }
    
    // Method for lobby to subscribe to room updates
    onRoomsUpdate(callback) {
        this.roomsUpdateCallback = callback;
    }
    
    // Request current players list from server
    requestPlayersList() {
        // Requesting players list
        if (this.connected) {
            this.sendToServer({
                type: 'requestPlayersList'
            });
        }
    }
    
    // Request current room data from server
    requestRoomsData() {
        // Requesting rooms data
        if (this.connected) {
            this.sendToServer({
                type: 'requestRoomsData'
            });
        }
    }
    
    // Join a specific room
    joinRoom(roomName) {
        // Joining room
        if (this.connected) {
            this.sendToServer({
                type: 'joinRoom',
                roomName: roomName
            });
        }
    }
    
    handleRoomJoined(message) {
        // Successfully joined room
        
        // Update current room data
        this.roomData.currentRoom = message.roomName;
        this.roomData.chatMessages = []; // Clear chat when changing rooms
        
        // Request players in the new room
        this.requestRoomPlayers(message.roomName);
        
        // Notify lobby scene about successful room join
        if (this.roomJoinedCallback) {
            this.roomJoinedCallback(message.roomName);
        }
    }
    
    // Method for lobby to subscribe to room join confirmations
    onRoomJoined(callback) {
        this.roomJoinedCallback = callback;
    }
    
    // === ROOM-BASED FEATURES ===
    
    // Request players in a specific room
    requestRoomPlayers(roomName) {
        // Requesting players in room
        if (this.connected) {
            this.sendToServer({
                type: 'requestRoomPlayers',
                roomName: roomName
            });
        }
    }
    
    // Send a chat message to the current room
    sendRoomChatMessage(text) {
        if (this.connected && this.roomData.currentRoom && text.trim()) {
            this.sendToServer({
                type: 'roomChatMessage',
                text: text.trim()
            });
        }
    }
    
    // Handle room players list update
    handleRoomPlayers(message) {
        // Received room players
        this.roomData.roomPlayers = message.players;
        
        // Notify lobby about updated room players
        if (this.roomPlayersCallback) {
            this.roomPlayersCallback(message.roomName, message.players);
        }
    }
    
    // Handle incoming room chat message
    handleRoomChatMessage(message) {
        // Room chat message received
        
        // Add to chat history
        this.roomData.chatMessages.push({
            playerId: message.playerId,
            playerName: message.playerName,
            message: message.message,
            timestamp: message.timestamp
        });
        
        // Keep only last 50 messages
        if (this.roomData.chatMessages.length > 50) {
            this.roomData.chatMessages = this.roomData.chatMessages.slice(-50);
        }
        
        // Notify lobby about new chat message
        if (this.roomChatCallback) {
            this.roomChatCallback(message);
        }
    }
    
    // Callback subscriptions for room features
    onRoomPlayersUpdate(callback) {
        this.roomPlayersCallback = callback;
    }
    
    onRoomChatMessage(callback) {
        this.roomChatCallback = callback;
    }

    // === OBSERVER PATTERN ===
    subscribe(callback) {
        this.subscribers.push(callback);
        return () => {
            this.subscribers = this.subscribers.filter(sub => sub !== callback);
        };
    }
    
    notifySubscribers() {
        this.subscribers.forEach(callback => callback(this.playerData));
    }
}

// Global instance
const gameData = new GameData();
