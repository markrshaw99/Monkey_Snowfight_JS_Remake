// Simple game data management for local and online play
class GameData {
    constructor() {
        this.mode = 'local'; // 'local' or 'online'
        this.playerId = this.generatePlayerId();
        this.subscribers = [];
        
        // Server configuration - automatically detects the right URL
        this.SERVER_URL = this.getServerURL();
        
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
            return 'ws://localhost:8080';
        }
        
        // For deployed versions, use the same host
        return `${protocol}//${host}`;
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
            }
        } catch (error) {
            console.warn('Could not load saved data:', error);
        }
    }
    
    // === ONLINE CONNECTION ===
    async connectToServer(serverUrl = null) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            return; // Already connected
        }
        
        // Use provided URL or default to configured SERVER_URL
        const wsUrl = serverUrl || this.SERVER_URL;
        
        try {
            console.log('Connecting to server:', wsUrl);
            this.socket = new WebSocket(wsUrl);
            
            this.socket.onopen = () => {
                console.log('Connected to game server');
                this.connected = true;
                this.mode = 'online';
                
                // Send player info to server
                this.sendToServer({
                    type: 'playerJoin',
                    player: this.playerData.profile
                });
            };
            
            this.socket.onmessage = (event) => {
                this.handleServerMessage(JSON.parse(event.data));
            };
            
            this.socket.onclose = () => {
                console.log('Disconnected from server');
                this.connected = false;
                this.mode = 'local';
            };
            
            this.socket.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.mode = 'local';
            };
            
        } catch (error) {
            console.error('Failed to connect to server:', error);
            this.mode = 'local';
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
        
        console.log(`Game invite from ${message.fromPlayer} - ${accept ? 'Accepted' : 'Declined'}`);
    }
    
    handleInviteSent(message) {
        console.log(`Invitation sent to ${message.targetPlayer}`);
        // You could show a toast notification here
        alert(`Challenge sent to ${message.targetPlayer}!\nWaiting for their response...`);
    }
    
    handleInviteAccepted(message) {
        console.log(`Invitation accepted by ${message.playerName}`);
        alert(`${message.playerName} accepted your challenge!\nStarting game...`);
    }
    
    handleInviteDeclined(message) {
        console.log(`Invitation declined by ${message.playerName}`);
        alert(`${message.playerName} declined your challenge.`);
    }
    
    handleGameStart(message) {
        this.gameState.inGame = true;
        this.gameState.gameMode = 'online';
        this.gameState.opponent = message.opponent;
        this.gameState.gameId = message.gameId;
        
        console.log('Game starting with opponent:', message.opponent);
        
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
        console.log('Opponent move:', message.move);
    }
    
    handleGameEnd(message) {
        this.endGame(message.result);
    }
    
    handlePlayersList(players) {
        console.log('Received players list from server:', players);
        // Notify lobby scene about updated players list
        if (this.playersListCallback) {
            this.playersListCallback(players);
        }
    }
    
    // Method for lobby to subscribe to players list updates
    onPlayersListUpdate(callback) {
        this.playersListCallback = callback;
    }
    
    // Request current players list from server
    requestPlayersList() {
        console.log('Requesting players list from server...');
        if (this.connected) {
            this.sendToServer({
                type: 'requestPlayersList'
            });
        }
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
