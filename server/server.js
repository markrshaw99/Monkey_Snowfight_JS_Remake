// Simple WebSocket server for Monkey Snowfight multiplayer
const WebSocket = require('ws');
const http = require('http');
const express = require('express');
const path = require('path');

class GameServer {
    constructor() {
        this.players = new Map(); // playerId -> { ws, playerInfo, room }
        this.games = new Map();   // gameId -> { player1, player2, gameState }
        this.rooms = new Map();   // roomName -> Set of playerIds
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
        // New player connected
        switch (message.type) {
            case 'playerJoin':
                this.handlePlayerJoin(ws, message.player);
                break;
                
            case 'requestPlayersList':
                this.handlePlayersListRequest(ws);
                break;
                
            case 'joinRoom':
                this.handleJoinRoom(ws, message.roomName);
                break;
                
            case 'requestRoomsData':
                this.handleRoomsDataRequest(ws);
                break;
                
            case 'gameRequest':
                this.handleGameRequest(ws, message);
                break;
                
            case 'gameInviteResponse':
                this.handleGameInviteResponse(ws, message);
                break;
                
            case 'requestRoomPlayers':
                this.handleRoomPlayersRequest(ws, message.roomName);
                break;
                
            case 'roomChatMessage':
                this.handleRoomChatMessage(ws, message);
                break;
                
            case 'gameMove':
                this.handleGameMove(ws, message);
                break;
                
            default:
                // Unknown message type
        }
    }
    
    handlePlayerJoin(ws, playerInfo) {
        // Store player info
        this.players.set(playerInfo.id, {
            ws: ws,
            playerInfo: playerInfo,
            room: null // Player starts without a room
        });
        
        // Update online count
        this.playersOnline = this.players.size;
        // Player joined
        
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
        
        // Game request sent
        
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
    
    handleJoinRoom(ws, roomName) {
        const player = this.getPlayerByWs(ws);
        if (!player) return;
        
        // Remove player from their current room (if any)
        if (player.room) {
            const currentRoom = this.rooms.get(player.room);
            if (currentRoom) {
                currentRoom.delete(player.playerInfo.id);
                if (currentRoom.size === 0) {
                    this.rooms.delete(player.room);
                }
            }
        }
        
        // Add player to new room
        if (!this.rooms.has(roomName)) {
            this.rooms.set(roomName, new Set());
        }
        this.rooms.get(roomName).add(player.playerInfo.id);
        player.room = roomName;
        
        // Player joined room
        
        // Broadcast updated room data to all players
        this.broadcastRoomData();
        
        // Send confirmation to the player
        ws.send(JSON.stringify({
            type: 'roomJoined',
            roomName: roomName
        }));
    }
    
    handleRoomsDataRequest(ws) {
        this.sendRoomData(ws);
    }
    
    sendRoomData(ws) {
        const roomsData = {};
        for (const [roomName, playerIds] of this.rooms) {
            roomsData[roomName] = playerIds.size;
        }
        
        ws.send(JSON.stringify({
            type: 'roomsData',
            rooms: roomsData
        }));
    }
    
    broadcastRoomData() {
        const roomsData = {};
        for (const [roomName, playerIds] of this.rooms) {
            roomsData[roomName] = playerIds.size;
        }
        
        this.broadcastToAll({
            type: 'roomsData',
            rooms: roomsData
        });
    }

    handleRoomChatMessage(ws, message) {
        const player = this.getPlayerByWs(ws);
        if (!player || !player.room) {
            // Cannot send chat: player not found or not in room
            return;
        }
        
        // Room chat message
        
        const chatMessage = {
            type: 'roomChatMessage',
            roomName: player.room,
            playerId: player.playerInfo.id,
            playerName: player.playerInfo.name,
            message: message.text,
            timestamp: new Date().toISOString()
        };
        
        // Send message to all players in the same room
        const room = this.rooms.get(player.room);
        if (room) {
            let messagesSent = 0;
            for (const playerId of room) {
                const playerData = this.players.get(playerId);
                if (playerData && playerData.ws.readyState === WebSocket.OPEN) {
                    playerData.ws.send(JSON.stringify(chatMessage));
                    messagesSent++;
                }
            }
            // Chat message sent to room players
        } else {
            // Room not found for chat message
        }
    }

    handlePlayerDisconnect(ws) {
        const player = this.getPlayerByWs(ws);
        if (player) {
            // Player disconnected
            
            // Remove player from their room (if any)
            if (player.room) {
                const room = this.rooms.get(player.room);
                if (room) {
                    room.delete(player.playerInfo.id);
                    if (room.size === 0) {
                        this.rooms.delete(player.room);
                    }
                }
            }
            
            this.players.delete(player.playerInfo.id);
            
            // Update online count
            this.playersOnline = this.players.size;
            
            // Broadcast updated player count and room data
            this.broadcastToAll({
                type: 'playersOnlineUpdate',
                count: this.playersOnline
            });
            this.broadcastRoomData();
            
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
                // Game ended due to player disconnect
            }
        }
    }
    
    handlePlayersListRequest(ws) {
        // Players list requested
        const playersList = Array.from(this.players.values()).map(p => ({
            id: p.playerInfo.id,
            name: p.playerInfo.name
        }));
        
        // Sending players list
        
        ws.send(JSON.stringify({
            type: 'playersList',
            players: playersList
        }));
    }
    
    handleGameInviteResponse(ws, message) {
        const respondingPlayer = this.getPlayerByWs(ws);
        const requestingPlayer = this.players.get(message.fromPlayerId);
        
        if (!respondingPlayer || !requestingPlayer) {
            // Player not found for invite response
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
            
            // Game started between players
        } else {
            // Notify requesting player that invite was declined
            requestingPlayer.ws.send(JSON.stringify({
                type: 'inviteDeclined',
                playerName: respondingPlayer.playerInfo.name
            }));
            
            // Game invite declined
        }
    }
    
    generateGameId() {
        return 'game_' + Math.random().toString(36).substr(2, 9);
    }
}

// Start the server
new GameServer();
