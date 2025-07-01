// Simple WebSocket server for Monkey Snowfight multiplayer
const WebSocket = require('ws');
const http = require('http');
const express = require('express');
const path = require('path');

class GameServer {
    constructor() {
        this.players = new Map(); // playerId -> { ws, playerInfo }
        this.games = new Map();   // gameId -> { player1, player2, gameState }
        this.playersOnline = 0;
        
        // Create Express app to serve game files
        this.app = express();
        
        // Serve static files from parent directory (game files)
        this.app.use(express.static(path.join(__dirname, '..')));
        
        // Create HTTP server
        const port = process.env.PORT || 8080;
        this.server = http.createServer(this.app);
        
        // Create WebSocket server attached to HTTP server
        this.wss = new WebSocket.Server({ server: this.server });
        
        console.log(`🎮 Monkey Snowfight Server running on port ${port}`);
        console.log(`🌐 Game available at: http://localhost:${port}`);
        
        this.wss.on('connection', (ws) => {
            console.log('New player connected');
            
            ws.on('message', (data) => {
                try {
                    const message = JSON.parse(data);
                    this.handleMessage(ws, message);
                } catch (error) {
                    console.error('Invalid message:', error);
                }
            });
            
            ws.on('close', () => {
                this.handlePlayerDisconnect(ws);
            });
        });
        
        // Start the server
        this.server.listen(port, () => {
            console.log(`🚀 Server started successfully on port ${port}`);
        });
    }
    
    handleMessage(ws, message) {
        console.log('Server received message:', message.type);
        switch (message.type) {
            case 'playerJoin':
                this.handlePlayerJoin(ws, message.player);
                break;
                
            case 'requestPlayersList':
                this.handlePlayersListRequest(ws);
                break;
                
            case 'gameRequest':
                this.handleGameRequest(ws, message);
                break;
                
            case 'gameInviteResponse':
                this.handleGameInviteResponse(ws, message);
                break;
                
            case 'gameMove':
                this.handleGameMove(ws, message);
                break;
                
            default:
                console.log('Unknown message type:', message.type);
        }
    }
    
    handlePlayerJoin(ws, playerInfo) {
        // Store player info
        this.players.set(playerInfo.id, {
            ws: ws,
            playerInfo: playerInfo
        });
        
        // Update online count
        this.playersOnline = this.players.size;
        console.log(`Player ${playerInfo.name} joined. Players online: ${this.playersOnline}`);
        
        // Broadcast updated player count to all players
        this.broadcastToAll({
            type: 'playersOnlineUpdate',
            count: this.playersOnline
        });
        
        // Send welcome message to new player
        ws.send(JSON.stringify({
            type: 'welcome',
            playerId: playerInfo.id,
            playersOnline: this.playersOnline
        }));
    }
    
    handleGameRequest(ws, message) {
        const requestingPlayer = this.getPlayerByWs(ws);
        const targetPlayer = this.players.get(message.targetPlayer);
        
        if (!requestingPlayer || !targetPlayer) {
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Player not found'
            }));
            return;
        }
        
        console.log(`Game request from ${requestingPlayer.playerInfo.name} to ${targetPlayer.playerInfo.name}`);
        
        // Send invitation to target player
        targetPlayer.ws.send(JSON.stringify({
            type: 'gameInvite',
            fromPlayer: requestingPlayer.playerInfo.name,
            fromPlayerId: requestingPlayer.playerInfo.id,
            gameMode: message.gameMode || 'snowfight'
        }));
        
        // Notify requesting player that invite was sent
        requestingPlayer.ws.send(JSON.stringify({
            type: 'inviteSent',
            targetPlayer: targetPlayer.playerInfo.name
        }));
    }
    
    handleGameMove(ws, message) {
        const game = this.games.get(message.gameId);
        if (!game) return;
        
        const player = this.getPlayerByWs(ws);
        if (!player) return;
        
        // Find opponent
        const opponentId = game.player1 === player.playerInfo.id ? game.player2 : game.player1;
        const opponent = this.players.get(opponentId);
        
        if (opponent) {
            // Forward move to opponent
            opponent.ws.send(JSON.stringify({
                type: 'gameMove',
                move: message.move,
                gameId: message.gameId
            }));
        }
    }
    
    handlePlayerDisconnect(ws) {
        const player = this.getPlayerByWs(ws);
        if (player) {
            console.log(`Player ${player.playerInfo.name} disconnected`);
            this.players.delete(player.playerInfo.id);
            
            // Update online count
            this.playersOnline = this.players.size;
            
            // Broadcast updated player count
            this.broadcastToAll({
                type: 'playersOnlineUpdate',
                count: this.playersOnline
            });
            
            // End any games this player was in
            this.endPlayerGames(player.playerInfo.id);
        }
    }
    
    getPlayerByWs(ws) {
        for (const [playerId, playerData] of this.players) {
            if (playerData.ws === ws) {
                return playerData;
            }
        }
        return null;
    }
    
    broadcastToAll(message) {
        const messageStr = JSON.stringify(message);
        this.players.forEach(playerData => {
            if (playerData.ws.readyState === WebSocket.OPEN) {
                playerData.ws.send(messageStr);
            }
        });
    }
    
    endPlayerGames(playerId) {
        // Find and end any games involving this player
        for (const [gameId, game] of this.games) {
            if (game.player1 === playerId || game.player2 === playerId) {
                const opponentId = game.player1 === playerId ? game.player2 : game.player1;
                const opponent = this.players.get(opponentId);
                
                if (opponent) {
                    opponent.ws.send(JSON.stringify({
                        type: 'gameEnd',
                        reason: 'opponentDisconnected',
                        result: 'won'
                    }));
                }
                
                this.games.delete(gameId);
                console.log(`Game ${gameId} ended due to player disconnect`);
            }
        }
    }
    
    handlePlayersListRequest(ws) {
        console.log('Server: Players list requested');
        const playersList = Array.from(this.players.values()).map(p => ({
            id: p.playerInfo.id,
            name: p.playerInfo.name
        }));
        
        console.log('Server: Sending players list:', playersList);
        
        ws.send(JSON.stringify({
            type: 'playersList',
            players: playersList
        }));
    }
    
    handleGameInviteResponse(ws, message) {
        const respondingPlayer = this.getPlayerByWs(ws);
        const requestingPlayer = this.players.get(message.fromPlayerId);
        
        if (!respondingPlayer || !requestingPlayer) {
            console.log('Player not found for invite response');
            return;
        }
        
        if (message.accepted) {
            // Start the game
            const gameId = this.generateGameId();
            
            this.games.set(gameId, {
                player1: requestingPlayer.playerInfo.id,
                player2: respondingPlayer.playerInfo.id,
                gameState: 'starting'
            });
            
            // First, notify requesting player that invite was accepted
            requestingPlayer.ws.send(JSON.stringify({
                type: 'inviteAccepted',
                playerName: respondingPlayer.playerInfo.name
            }));
            
            // Then notify both players about game start
            const gameStartMessage = {
                type: 'gameStart',
                gameId: gameId
            };
            
            requestingPlayer.ws.send(JSON.stringify({
                ...gameStartMessage,
                opponent: respondingPlayer.playerInfo
            }));
            
            respondingPlayer.ws.send(JSON.stringify({
                ...gameStartMessage,
                opponent: requestingPlayer.playerInfo
            }));
            
            console.log(`Game ${gameId} started between ${requestingPlayer.playerInfo.name} and ${respondingPlayer.playerInfo.name}`);
        } else {
            // Notify requesting player that invite was declined
            requestingPlayer.ws.send(JSON.stringify({
                type: 'inviteDeclined',
                playerName: respondingPlayer.playerInfo.name
            }));
            
            console.log(`${respondingPlayer.playerInfo.name} declined invite from ${requestingPlayer.playerInfo.name}`);
        }
    }
    
    generateGameId() {
        return 'game_' + Math.random().toString(36).substr(2, 9);
    }
}

// Start the server
new GameServer();
