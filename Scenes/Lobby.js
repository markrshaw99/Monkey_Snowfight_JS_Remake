// Canvas-based Lobby Scene - The main game lobby with logos positioned exactly as in Flash
class Lobby extends Scene {
    constructor(sceneManager, data = {}) {
        super(sceneManager, data);
        
        // Subscribe to game data changes
        this.unsubscribe = gameData.subscribe((playerData) => {
            this.statsData = playerData.stats;
        });
        
        // Initialize with current data
        this.statsData = gameData.playerData.stats;
        this.playerName = gameData.playerData.profile.name;
        
        // Online players list
        this.onlinePlayers = [];
        this.showPlayersList = false;
        
        // Room-based features
        this.roomPlayers = []; // Players in the current room
        this.showRoomChat = false;
        this.chatMessages = [];
        this.chatInput = '';
        this.chatScrollOffset = 0;
        
        // Room selection dropdown
        this.showRoomsDropdown = false;
        this.selectedRoom = 'Battlegrounds';
        this.dropdownScrollOffset = 0; // For scrolling through rooms
        this.hoveredRoomIndex = -1; // Track which room is being hovered over
        this.rooms = [
            { name: 'Aggressive Apes', players: 0 },
            { name: 'Angry Aye-Aye', players: 0 },
            { name: 'Banana Split', players: 0 },
            { name: 'Barking Bushbaby', players: 0 },
            { name: 'Battlegrounds', players: 0 },
            { name: 'Biting Bonobo', players: 0 },
            { name: 'Chilly Chimp', players: 0 },
            { name: 'Clearing', players: 0 },
            { name: 'Cloud Forest', players: 0 },
            { name: 'Coconut Shy', players: 0 },
            { name: 'Cold Mountain', players: 0 },
            { name: 'Crazy Monkeys', players: 0 },
            { name: 'Crystal Lake', players: 0 },
            { name: 'Flinging Lemur', players: 0 },
            { name: 'Frosty Hills', players: 0 },
            { name: 'Frustrated Guenon', players: 0 },
            { name: 'Gibbon Hut', players: 0 },
            { name: 'Great Grivet', players: 0 },
            { name: 'Growling Gelada', players: 0 },
            { name: 'Guenon', players: 0 },
            { name: 'Guereza', players: 0 },
            { name: 'Heat-up Howler', players: 0 },
            { name: 'Ice Palace', players: 0 },
            { name: 'Icicle Village', players: 0 },
            { name: 'Jigokudani', players: 0 },
            { name: 'Jungle', players: 0 },
            { name: 'Lander Woods', players: 0 },
            { name: 'Leary Lar', players: 0 },
            { name: 'Lions Den', players: 0 },
            { name: 'Mad Colobus', players: 0 },
            { name: 'Madagascar', players: 0 },
            { name: 'Mangrove', players: 0 },
            { name: 'Mighty Uakari', players: 0 },
            { name: 'Monkey Carnage', players: 0 },
            { name: 'Nana Tree', players: 0 },
            { name: 'Oasis', players: 0 },
            { name: 'Orabazu Ordeal', players: 0 },
            { name: 'Perturbed Potto', players: 0 },
            { name: 'Playpen', players: 0 },
            { name: 'Pressured Potto', players: 0 },
            { name: 'Ranomafana', players: 0 },
            { name: 'Sanctuary', players: 0 },
            { name: 'Shaking Sifaka', players: 0 },
            { name: 'Sharp Shooters', players: 0 },
            { name: 'Tanga', players: 0 },
            { name: 'The Manor', players: 0 },
            { name: 'Treetops', players: 0 },
            { name: 'Waterhole', players: 0 },
            { name: 'Yakushima', players: 0 },
            { name: 'Yunnan', players: 0 }
        ];
    }

    async create() {
        // Load all required images
        await this.loadImages();
        
        // Try to connect to server (fallback to local if fails)
        await this.tryConnectToServer();
        
        // Subscribe to players list updates
        gameData.onPlayersListUpdate((players) => {
            // Players list updated
            this.onlinePlayers = players;
        });
        
        // Subscribe to room data updates
        gameData.onRoomsUpdate((rooms) => {
            // Rooms list updated
            this.updateRoomPlayerCounts(rooms);
        });
        
        // Subscribe to room joined confirmations
        gameData.onRoomJoined((roomName) => {
            // Successfully joined room
            // The selectedRoom should already be set from the UI click
        });
        
        // Subscribe to room players updates
        gameData.onRoomPlayersUpdate((roomName, players) => {
            // Room players updated
            if (roomName === this.selectedRoom) {
                this.roomPlayers = players;
            }
        });
        
        // Subscribe to room chat messages
        gameData.onRoomChatMessage((message) => {
            // Messages are stored in gameData.roomData.chatMessages automatically
        });
        
        // Subscribe to connection status changes
        gameData.subscribe((playerData) => {
            // Stats updated
            this.statsData = playerData.stats;
            
            // Reset room player counts when server is offline
            if (!gameData.connected) {
                this.resetRoomPlayerCounts();
            }
        });
        
        // Subscribe to game start events
        gameData.onGameStart((opponent) => {
            // Game starting with opponent
            this.sceneManager.startScene('onlineMultiplayer');
        });
        
        // Start snowfall animation using original game assets
        await this.sceneManager.createSnowfall();
        
        // Set up buttons for click handling
        this.setupButtons();
    }

    async tryConnectToServer() {
        try {
            console.log('🌐 Lobby: Attempting to connect to server...');
            await gameData.connectToServer(); // Use auto-detected URL
            console.log('✅ Lobby: Online mode available');
            
            // Request initial room data and players list from server
            gameData.requestRoomsData();
            gameData.requestPlayersList();
            
            // Auto-join the currently selected room
            gameData.joinRoom(this.selectedRoom);
        } catch (error) {
            console.log('Server unavailable, using local mode');
            this.resetRoomPlayerCounts(); // Ensure rooms show 0 players when offline
        }
    }

    async loadImages() {
        const imagePaths = [
            'images/Background2.svg',
            'images/Miniclip.svg',
            'images/Title.svg',
            'images/LobbyTemplate.png',
            'images/MonkeyFace.svg',
            'images/Avatar/EyeWhites/12.svg',
            'images/Avatar/EyeOutline/15.svg',
            'images/Avatar/EyePupils/13.svg',
            'images/Avatar/Eyebrows/9.svg',
            'images/Avatar/Mouths/5.svg',
            'images/snowflake_1.png'
        ];

        for (let path of imagePaths) {
            try {
                await this.sceneManager.loadImage(path);
            } catch (error) {
                console.error(`Failed to load image: ${path}`, error);
            }
        }
    }

    setupButtons() {
        // Add button configurations for click detection
        this.buttons = [
            {
                x: 50 * viewScale,
                y: 345 * viewScale,
                width: 60 * viewScale,
                height: 30 * viewScale,
                text: "Local Game",
                onClick: () => {
                    // Transitioning to Local Game
                    gameData.startLocalGame();
                    this.sceneManager.startScene('localGame');
                }
            },
            {
                x: 120 * viewScale,
                y: 345 * viewScale,
                width: 60 * viewScale,
                height: 30 * viewScale,
                text: "Practice",
                onClick: () => {
                    // Practice mode (single player)
                    gameData.startLocalGame();
                }
            },
            {
                x: 190 * viewScale,
                y: 345 * viewScale,
                width: 60 * viewScale,
                height: 30 * viewScale,
                text: gameData.connected ? "Find Players" : "Server Offline",
                onClick: () => {
                    // Toggle players list
                    if (gameData.connected) {
                        // Toggle players list visibility
                        this.showPlayersList = !this.showPlayersList;
                        if (this.showPlayersList) {
                            gameData.requestPlayersList();
                        }
                    } else {
                        // Server not available for multiplayer
                    }
                }
            },
            // Room Players button
            {
                x: 50 * viewScale,
                y: 200 * viewScale,
                width: 80 * viewScale,
                height: 25 * viewScale,
                text: gameData.connected ? "Room Players" : "Offline",
                onClick: () => {
                    if (gameData.connected) {
                        this.showPlayersList = !this.showPlayersList;
                        if (this.showPlayersList) {
                            gameData.requestRoomPlayers(this.selectedRoom);
                        }
                    }
                }
            }
        ];
        
        // Room selection dropdown button
        this.roomDropdownButton = {
            x: 245 * viewScale,  // Match dropdown area exactly
            y: 174 * viewScale,
            width: 170 * viewScale,
            height: 20 * viewScale,
            onClick: () => {
                this.showRoomsDropdown = !this.showRoomsDropdown;
                // Reset scroll and hover when opening
                if (this.showRoomsDropdown) {
                    this.dropdownScrollOffset = 0;
                    this.hoveredRoomIndex = -1;
                }
            }
        };
    }

    showOnlineOptions() {
        // Simple implementation - you could make this more sophisticated
        const targetPlayer = prompt('Enter your brother\'s player ID:');
        if (targetPlayer) {
            const success = gameData.startOnlineGame(targetPlayer);
            if (success) {
                this.sceneManager.startScene('onlineMultiplayer');
            }
        }
    }

    handleKeyDown(key) {
        // Always handle chat input when connected to server
        if (gameData.connected) {
            if (key === 'Enter') {
                this.sendChatMessage();
            } else if (key === 'Backspace') {
                this.chatInput = this.chatInput.slice(0, -1);
            } else if (key.length === 1 && this.chatInput.length < 50) {
                // Add regular characters (not special keys)
                this.chatInput += key;
            }
        }
    }
    
    challengePlayer(playerId, playerName) {
        // Challenging a player
        if (gameData.connected) {
            gameData.startOnlineGame(playerId);
        }
    }

    async render(ctx) {
        // Draw background
        this.sceneManager.drawBackground('images/Background2.svg');
        
        // Draw snowfall
        this.sceneManager.renderSnowfall();
        
        // Draw logos
        this.drawLogos();
        
        // Draw lobby content
        this.drawLobbyContent();
        
        // Draw buttons
        this.drawButtons();
        
        // Draw players list if shown
        if (this.showPlayersList && gameData.connected) {
            this.drawPlayersList();
        }
    }

    drawLogos() {
        // Miniclip logo (characterId=570, depth=263)
        // Flash data: translateX=5988, translateY=534, scaleX=0.4567566, scaleY=0.4567566
        // SVG natural size: 297.1 × 52.4px
        // Flash coordinates: 5988/20 = 299.4, 534/20 = 26.7
        const miniclipScale = 0.4567566;
        const miniclipX = 300 * viewScale;
        const miniclipY = 15 * viewScale;
        
        this.sceneManager.drawImageCentered(
            'images/Miniclip.svg',
            miniclipX,
            miniclipY,
            297.1 * miniclipScale * viewScale, // Natural width * Flash scale * viewScale
            52.4 * miniclipScale * viewScale   // Natural height * Flash scale * viewScale
        );
        
        // Title logo (characterId=568, depth=262)
        // Flash data: translateX=2883, translateY=1075, scale=1.0359192
        // SVG natural size: 306.95 × 30.45px
        const titleScale = 1.0359192;
        const titleX = (300 * viewScale); // 144.15 * viewScale
        const titleY = (1075/20) * viewScale; // 53.75 * viewScale
        
        this.sceneManager.drawImageCentered(
            'images/Title.svg',
            titleX,
            titleY,
            306.95 * 1.0359192 * viewScale, // Natural width * Flash scale * viewScale
            30.45 * 1.0359192 * viewScale   // Natural height * Flash scale * viewScale
        );
    }

    drawLobbyContent() {
        // First, add the original lobby template to see it underneath
        this.sceneManager.drawImageCentered(
            'images/LobbyTemplate.png',
            300 * viewScale,  // Center X
            93 * viewScale,  // Center Y 
            531 * viewScale,  // Width
            298 * viewScale   // Height
        );

        // Player info section (top left) - WITH inset border
        this.sceneManager.drawPanel(
            34.5 * viewScale,
            93 * viewScale,
            388 * viewScale,
            56 * viewScale,
            { 
                backgroundColor: 'rgb(255, 255, 255)',
                borderRadius: 12,
                insetBorder: true,
                insetColors: ['rgb(255, 255, 255)', 'rgb(175, 220, 230)'],
                insetWidths: [4, 8]
            }
        );
        
        // Stats panel (top right) - WITH inset border
        this.sceneManager.drawPanel(
            428 * viewScale,
            93 * viewScale,
            137 * viewScale,
            56 * viewScale,
            { 
                backgroundColor: 'rgb(255, 255, 255)',
                borderRadius: 12,
                insetBorder: true,
                insetColors: ['rgb(255, 255, 255)', 'rgb(175, 220, 230)'],
                insetWidths: [4, 8]
            }
        );

        // Game creation section - WITH inset border
        this.sceneManager.drawPanel(
            34.5 * viewScale,
            155 * viewScale,
            531 * viewScale,
            235 * viewScale,
            { 
                backgroundColor: 'rgba(255, 255, 255, 0.88)',
                borderRadius: 12,
                insetBorder: true,
                insetColors: ['rgb(255, 255, 255)', 'rgb(95, 185, 225)'],
                insetWidths: [4, 10]
            }
        );
        // Main Panels End

        //sub panels
         this.sceneManager.drawPanel(
            236 * viewScale,
            102 * viewScale,
            96 * viewScale,
            16 * viewScale,
            { 
                backgroundColor: 'rgb(240, 250, 250)',
                borderRadius: 12,
            }
        );
        
        this.sceneManager.drawPanel(
            236 * viewScale,
            124 * viewScale,
            96 * viewScale,
            16 * viewScale,
            { 
                backgroundColor: 'rgb(240, 250, 250)',
                borderRadius: 12,
            }
        );
        
        this.sceneManager.drawPanel(
            338 * viewScale,
            124 * viewScale,
            74 * viewScale,
            16 * viewScale,
            { 
                backgroundColor: 'rgb(240, 250, 250)',
                borderRadius: 12,
            }
        );
        
        this.sceneManager.drawPanel(
            338 * viewScale,
            102 * viewScale,
            74 * viewScale,
            16 * viewScale,
            { 
                backgroundColor: 'rgb(240, 250, 250)',
                borderRadius: 12,
            }
        );
        
                this.sceneManager.drawPanel(
            438 * viewScale,
            102 * viewScale,
            117 * viewScale,
            16 * viewScale,
            { 
                backgroundColor: 'rgb(240, 250, 250)',
                borderRadius: 12,
            }
        );
        
                this.sceneManager.drawPanel(
            438 * viewScale,
            124 * viewScale,
            72 * viewScale,
            16 * viewScale,
            { 
                backgroundColor: 'rgb(240, 250, 250)',
                borderRadius: 12,
            }
        );
        
                this.sceneManager.drawPanel(
            516 * viewScale,
            124 * viewScale,
            39 * viewScale,
            16 * viewScale,
            { 
                backgroundColor: 'rgb(240, 250, 250)',
                borderRadius: 12,
            }
        );

                this.sceneManager.drawPanel(
            45 * viewScale,
            165 * viewScale,
            377 * viewScale,
            40 * viewScale,
            { 
                backgroundColor: 'rgb(255, 255, 255)',
                borderRadius: 12,
                insetColor:  'rgb(175, 220, 230)',
                borderWidth: '4'
            }
        );
        
                this.sceneManager.drawPanel(
            428 * viewScale,
            165 * viewScale,
            127 * viewScale,
            214 * viewScale,
            { 
                backgroundColor: 'rgb(255, 255, 255)',
                borderRadius: 12,
                insetColor:  'rgb(175, 220, 230)',
                borderWidth: '4'
            }
        );
        
        // Draw permanent chat in the right panel
        this.drawPermanentChat();

                        this.sceneManager.drawPanel(
            45 * viewScale,
            339 * viewScale,
            377 * viewScale,
            40 * viewScale,
            { 
                backgroundColor: 'rgb(255, 255, 255)',
                borderRadius: 12,
                insetColor:  'rgb(175, 220, 230)',
                borderWidth: '4'
            }
        );

        // Sub Panels End

        //Sub Sub Panels

                 this.sceneManager.drawPanel(
            296 * viewScale,
            104 * viewScale,
            34 * viewScale,
            12 * viewScale,
            { 
                backgroundColor: 'rgb(255, 255, 255)',
                borderRadius: 12,
                borderWidth: 0
            }
        );
        
                 this.sceneManager.drawPanel(
            296 * viewScale,
            126 * viewScale,
            34 * viewScale,
            12 * viewScale,
            { 
                backgroundColor: 'rgb(255, 255, 255)',
                borderRadius: 12,
                borderWidth: 0
            }
        );
        
                 this.sceneManager.drawPanel(
            376 * viewScale,
            104 * viewScale,
            34 * viewScale,
            12 * viewScale,
            { 
                backgroundColor: 'rgb(255, 255, 255)',
                borderRadius: 12,
                borderWidth: 0
            }
        );

                 this.sceneManager.drawPanel(
            512 * viewScale,
            104 * viewScale,
            40 * viewScale,
            12 * viewScale,
            { 
                backgroundColor: 'rgb(255, 255, 255)',
                borderRadius: 12,
                borderWidth: 0
            }
        );
        
        //Sub Sub Panels End
        

        // Player name and stats
        this.sceneManager.drawText(this.playerName, 120 * viewScale, 105 * viewScale, {
            fontSize: 16 * viewScale,
        });
        
        this.sceneManager.drawText('★★★☆☆', 118 * viewScale, 124 * viewScale, {
            fontSize: 20 * viewScale,
            fontWeight: 'normal',
            color: 'rgb(55, 180, 255)'
        });
                
        this.sceneManager.drawText('Games won', 242 * viewScale, 105 * viewScale, {
            fontSize: 11 * viewScale,
        });

        this.sceneManager.drawText('Games lost', 242 * viewScale, 127 * viewScale, {
            fontSize: 11 * viewScale,
        });
       
        this.sceneManager.drawText('Rating', 344 * viewScale, 105 * viewScale, {
            fontSize: 11 * viewScale,
        });

        this.sceneManager.drawText('Players Online', 444 * viewScale, 105 * viewScale, {
            fontSize: 11 * viewScale,
        });
                
        this.sceneManager.drawText(this.statsData.gamesWon, 309 * viewScale, 105 * viewScale, {
            fontSize: 11 * viewScale,
            color: 'rgb(0, 0, 0)',
        });

        this.sceneManager.drawText(this.statsData.gamesLost, 309 * viewScale, 127 * viewScale, {
            fontSize: 11 * viewScale,
            color: 'rgb(0, 0, 0)',
        });

        this.sceneManager.drawText(this.statsData.rating, 380 * viewScale, 105 * viewScale, {
            fontSize: 11 * viewScale,
            color: 'rgb(0, 0, 0)',
        });

        this.sceneManager.drawText(this.statsData.playersOnline, 530 * viewScale, 105 * viewScale, {
            fontSize: 11 * viewScale,
            color: 'rgb(0, 0, 0)',
        });

        // Monkey Face Start
        this.sceneManager.drawImage(
            'images/MonkeyFace.svg',
            42 * viewScale,
            103 * viewScale,
            65 * viewScale,
            38 * viewScale
        );

        this.sceneManager.drawImage(
            'images/Avatar/EyeWhites/12.svg',
            60 * viewScale,
            110 * viewScale,
            23.5 * viewScale,
            11.5 * viewScale
        );

        this.sceneManager.drawImage(
            'images/Avatar/EyeOutline/15.svg',
            60 * viewScale,
            109 * viewScale,
            24.5 * viewScale,
            13.5 * viewScale
        );

        this.sceneManager.drawImage(
            'images/Avatar/EyePupils/13.svg',
            62 * viewScale,
            114 * viewScale,
            16 * viewScale,
            5 * viewScale
        );

        this.sceneManager.drawImage(
            'images/Avatar/Mouths/5.svg',
            65 * viewScale,
            132 * viewScale,
            14 * viewScale,
            3 * viewScale
        );
        // Monkey Face End
        
        // Room Selection UI
        this.drawRoomSelection();
    }

    drawButtons() {
        // Game mode buttons
        this.sceneManager.drawButton(
            'Local Game',
            50 * viewScale,
            345 * viewScale,
            60 * viewScale,
            30 * viewScale
        );
        
        this.sceneManager.drawButton(
            'Practice',
            120 * viewScale,
            345 * viewScale,
            60 * viewScale,
            30 * viewScale,
            { backgroundColor: '#10b981', borderColor: '#059669' }
        );
        
        // Use the same logic as setupButtons for the third button
        const thirdButtonText = gameData.connected ? "Find Players" : "Server Offline";
        this.sceneManager.drawButton(
            thirdButtonText,
            190 * viewScale,
            345 * viewScale,
            60 * viewScale,
            30 * viewScale,
            { backgroundColor: '#3b82f6', borderColor: '#2563eb' }
        );
        
        // Room-based feature buttons
        const roomPlayersText = gameData.connected ? "Room Players" : "Offline";
        this.sceneManager.drawButton(
            roomPlayersText,
            260 * viewScale,
            345 * viewScale,
            50 * viewScale,
            30 * viewScale,
            { 
                backgroundColor: this.showPlayersList ? '#059669' : '#10b981', 
                borderColor: '#047857',
                fontSize: 12 * viewScale
            }
        );
    }

    drawRoomSelection() {
        // Current room title (dynamically shows selected room)
        this.sceneManager.drawText(this.selectedRoom, 55 * viewScale, 177 * viewScale, {
            fontSize: 14 * viewScale,
            fontWeight: 'bold',
        });
        
        // Room dropdown button area
        const dropdownX = 245 * viewScale;
        const dropdownY = 174 * viewScale;
        const dropdownWidth = 170 * viewScale;
        const dropdownHeight = 20 * viewScale;
        
        // Dropdown button background
        this.sceneManager.drawPanel(
            dropdownX,
            dropdownY,
            dropdownWidth,
            dropdownHeight,
            { 
                backgroundColor: 'rgb(255, 255, 255)',
                borderRadius: 4,
                insetBorder: true,
                insetColors: ['rgb(200, 200, 200)', 'rgb(240, 240, 240)'],
                insetWidths: [1, 2]
            }
        );
        
        // Current selection text - show selected room name and player count
        const currentRoom = this.rooms.find(room => room.name === this.selectedRoom);
        const displayText = currentRoom ? `${currentRoom.name} (${currentRoom.players} players)` : 'Select a room';
        
        this.sceneManager.drawText(displayText, dropdownX + 5 * viewScale, dropdownY + 3 * viewScale, {
            fontSize: 10 * viewScale,
        });
        
        // Dropdown arrow
        this.sceneManager.drawText('▼', dropdownX + dropdownWidth - 15 * viewScale, dropdownY + 3 * viewScale, {
            fontSize: 10 * viewScale,
            color: 'rgb(100, 100, 100)'
        });
        
        // Show dropdown list if open
        if (this.showRoomsDropdown) {
            this.drawRoomsDropdown(dropdownX, dropdownY + dropdownHeight);
        }
    }

    drawRoomsDropdown(x, y) {
        const dropdownWidth = 170 * viewScale;
        const itemHeight = 18 * viewScale;
        const maxVisibleItems = 8; // Reduced to make scrolling more apparent
        const totalItems = this.rooms.length;
        const visibleItems = Math.min(totalItems, maxVisibleItems);
        const dropdownHeight = visibleItems * itemHeight;
        
        // Calculate scroll bounds
        const maxScrollOffset = Math.max(0, totalItems - maxVisibleItems);
        this.dropdownScrollOffset = Math.max(0, Math.min(this.dropdownScrollOffset, maxScrollOffset));
        
        // Dropdown background
        this.sceneManager.drawPanel(
            x,
            y,
            dropdownWidth,
            dropdownHeight,
            { 
                backgroundColor: 'rgb(255, 255, 255)',
                borderRadius: 4,
                insetBorder: true,
                insetColors: ['rgb(150, 150, 150)', 'rgb(255, 255, 255)'],
                insetWidths: [1, 1]
            }
        );
        
        // Room items
        this.roomDropdownItems = [];
        for (let i = 0; i < visibleItems; i++) {
            const roomIndex = i + this.dropdownScrollOffset;
            if (roomIndex >= totalItems) break;
            
            const room = this.rooms[roomIndex];
            const itemY = y + (i * itemHeight);
            
            // Highlight selected room or hovered room
            const isSelected = room.name === this.selectedRoom;
            const isHovered = roomIndex === this.hoveredRoomIndex;
            
            if (isSelected || isHovered) {
                this.sceneManager.drawPanel(
                    x + 1,
                    itemY,
                    dropdownWidth - 2,
                    itemHeight,
                    { 
                        backgroundColor: 'rgb(200, 230, 255)',
                        borderRadius: 0
                    }
                );
            }
            
            // Room name
            this.sceneManager.drawText(room.name, x + 5 * viewScale, itemY + 3 * viewScale, {
                fontSize: 10 * viewScale,
                color: (isSelected || isHovered) ? 'rgb(0, 0, 100)' : 'rgb(38, 87, 136)'
            });
            
            // Player count
            this.sceneManager.drawText(`(${room.players})`, x + dropdownWidth - 25 * viewScale, itemY + 3 * viewScale, {
                fontSize: 10 * viewScale,
                color: 'rgb(100, 100, 100)'
            });
            
            // Store clickable area
            this.roomDropdownItems.push({
                x: x,
                y: itemY,
                width: dropdownWidth,
                height: itemHeight,
                room: room,
                onClick: () => {
                    // Room selected
                    this.selectedRoom = room.name;
                    this.showRoomsDropdown = false;
                    this.dropdownScrollOffset = 0; // Reset scroll when selection changes
                    // Update selected room
                    
                    // Join the room on the server if connected
                    if (gameData.connected) {
                        gameData.joinRoom(room.name);
                    }
                }
            });
        }
        
        // Draw scroll indicators if needed
        if (totalItems > maxVisibleItems) {
            const scrollbarWidth = 8 * viewScale;
            const scrollbarX = x + dropdownWidth - scrollbarWidth - 2 * viewScale;
            const scrollUpY = y - 12 * viewScale;
            const scrollDownY = y + dropdownHeight + 4 * viewScale;
            
            // Scroll track
            this.sceneManager.drawPanel(
                scrollbarX,
                y + 2 * viewScale,
                scrollbarWidth,
                dropdownHeight - 4 * viewScale,
                { 
                    backgroundColor: 'rgb(230, 230, 230)',
                    borderRadius: 2
                }
            );
            
            // Scroll thumb
            const thumbHeight = Math.max(20 * viewScale, (dropdownHeight * maxVisibleItems) / totalItems);
            const thumbY = y + 2 * viewScale + ((dropdownHeight - 4 * viewScale - thumbHeight) * this.dropdownScrollOffset) / maxScrollOffset;
            
            this.sceneManager.drawPanel(
                scrollbarX + 1 * viewScale,
                thumbY,
                scrollbarWidth - 2 * viewScale,
                thumbHeight,
                { 
                    backgroundColor: 'rgb(150, 150, 150)',
                    borderRadius: 2
                }
            );
            
            // Scroll arrows with clickable areas
            this.sceneManager.drawText('▲', scrollbarX, scrollUpY, {
                fontSize: 8 * viewScale,
                color: this.dropdownScrollOffset > 0 ? 'rgb(100, 100, 100)' : 'rgb(200, 200, 200)'
            });
            
            this.sceneManager.drawText('▼', scrollbarX, scrollDownY, {
                fontSize: 8 * viewScale,
                color: this.dropdownScrollOffset < maxScrollOffset ? 'rgb(100, 100, 100)' : 'rgb(200, 200, 200)'
            });
            
            // Store scroll arrow clickable areas
            this.scrollUpButton = {
                x: scrollbarX - 2 * viewScale,
                y: scrollUpY - 2 * viewScale,
                width: 12 * viewScale,
                height: 12 * viewScale,
                onClick: () => {
                    if (this.dropdownScrollOffset > 0) {
                        this.dropdownScrollOffset--;
                    }
                }
            };
            
            this.scrollDownButton = {
                x: scrollbarX - 2 * viewScale,
                y: scrollDownY - 2 * viewScale,
                width: 12 * viewScale,
                height: 12 * viewScale,
                onClick: () => {
                    if (this.dropdownScrollOffset < maxScrollOffset) {
                        this.dropdownScrollOffset++;
                    }
                }
            };
        } else {
            // Clear scroll buttons if not needed
            this.scrollUpButton = null;
            this.scrollDownButton = null;
        }
        
        // Store dropdown bounds for scroll detection
        this.dropdownBounds = {
            x: x,
            y: y,
            width: dropdownWidth,
            height: dropdownHeight,
            maxScrollOffset: maxScrollOffset
        };
    }

    drawPlayersList() {
        // Draw players list panel
        const panelX = 200 * viewScale;
        const panelY = 320 * viewScale;
        const panelWidth = 200 * viewScale;
        const panelHeight = 150 * viewScale;
        
        this.sceneManager.drawPanel(
            panelX,
            panelY,
            panelWidth,
            panelHeight,
            { 
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: 12,
                insetBorder: true,
                insetColors: ['rgb(255, 255, 255)', 'rgb(95, 185, 225)'],
                insetWidths: [2, 4]
            }
        );
        
        // Title
        this.sceneManager.drawText(`Players in ${this.selectedRoom}`, panelX + 10 * viewScale, panelY + 10 * viewScale, {
            fontSize: 12 * viewScale,
            fontWeight: 'bold'
        });
        
        // Your player info
        this.sceneManager.drawText(`You: ${this.playerName}`, panelX + 10 * viewScale, panelY + 30 * viewScale, {
            fontSize: 11 * viewScale,
            color: 'rgb(0, 120, 0)'
        });
        
        // Other players in the room
        const otherRoomPlayers = this.roomPlayers.filter(p => p.id !== gameData.playerData.profile.id);
        
        if (otherRoomPlayers.length === 0) {
            this.sceneManager.drawText('No other players in this room', panelX + 10 * viewScale, panelY + 50 * viewScale, {
                fontSize: 10 * viewScale,
                color: 'rgb(128, 128, 128)'
            });
        } else {
            let yOffset = 50;
            otherRoomPlayers.forEach((player, index) => {
                if (yOffset < panelHeight - 30) {
                    // Player name
                    this.sceneManager.drawText(player.name, panelX + 10 * viewScale, panelY + yOffset * viewScale, {
                        fontSize: 10 * viewScale
                    });
                    
                    // Challenge button
                    const challengeButtonX = panelX + 120 * viewScale;
                    const challengeButtonY = panelY + (yOffset - 5) * viewScale;
                    const challengeButtonW = 60 * viewScale;
                    const challengeButtonH = 18 * viewScale;
                    
                    this.sceneManager.drawButton(
                        'Challenge',
                        challengeButtonX,
                        challengeButtonY,
                        challengeButtonW,
                        challengeButtonH,
                        { 
                            backgroundColor: '#f59e0b',
                            borderColor: '#d97706',
                            fontSize: 8 * viewScale
                        }
                    );
                    
                    // Store button for click detection
                    if (!this.challengeButtons) this.challengeButtons = [];
                    this.challengeButtons[index] = {
                        x: challengeButtonX,
                        y: challengeButtonY,
                        width: challengeButtonW,
                        height: challengeButtonH,
                        playerId: player.id,
                        playerName: player.name,
                        onClick: () => this.challengePlayer(player.id, player.name)
                    };
                    
                    yOffset += 20;
                }
            });
        }
    }

    drawPermanentChat() {
        // Chat area coordinates - using the right panel space
        const panelX = 428 * viewScale;
        const panelY = 165 * viewScale;
        const panelWidth = 127 * viewScale;
        const panelHeight = 214 * viewScale;
        
        // Chat header with debug info
        this.sceneManager.drawText(`${this.selectedRoom} Chat`, panelX + 5 * viewScale, panelY + 15 * viewScale, {
            fontSize: 10 * viewScale,
            fontWeight: 'bold',
            color: gameData.connected ? 'rgb(0, 120, 0)' : 'rgb(128, 128, 128)'
        });
        
        if (!gameData.connected) {
            this.sceneManager.drawText('Server Offline', panelX + 5 * viewScale, panelY + 35 * viewScale, {
                fontSize: 9 * viewScale,
                color: 'rgb(200, 0, 0)'
            });
            return;
        }
        
        // Get chat messages safely
        const chatMessages = gameData.roomData?.chatMessages || [];
        
        // Chat messages area
        let yOffset = 35; // Adjusted for debug line
        const maxMessages = 11; // Reduced by 1 for debug line
        const startIndex = Math.max(0, chatMessages.length - maxMessages);
        
        for (let i = startIndex; i < chatMessages.length; i++) {
            const msg = chatMessages[i];
            if (yOffset < panelHeight - 35) {
                // Player name and message
                const isOwnMessage = msg.playerId === gameData.playerData.profile.id;
                const nameColor = isOwnMessage ? 'rgb(0, 120, 0)' : 'rgb(0, 0, 120)';
                
                this.sceneManager.drawText(`${msg.playerName}:`, panelX + 5 * viewScale, panelY + yOffset * viewScale, {
                    fontSize: 8 * viewScale,
                    fontWeight: 'bold',
                    color: nameColor
                });
                
                // Wrap message text to fit panel width
                const maxChars = 18; // Adjusted for narrower panel
                const wrappedMessage = msg.message.length > maxChars ? 
                    msg.message.substring(0, maxChars) + '...' : msg.message;
                
                this.sceneManager.drawText(wrappedMessage, panelX + 5 * viewScale, panelY + (yOffset + 8) * viewScale, {
                    fontSize: 7 * viewScale,
                    color: 'rgb(50, 50, 50)'
                });
                
                yOffset += 15; // Tighter spacing
            }
        }
        
        if (chatMessages.length === 0) {
            this.sceneManager.drawText('No messages yet...', panelX + 5 * viewScale, panelY + 45 * viewScale, {
                fontSize: 8 * viewScale,
                color: 'rgb(128, 128, 128)'
            });
        }
        
        // Chat input area - at bottom of panel
        const inputY = panelY + panelHeight - 25 * viewScale;
        const inputWidth = panelWidth - 35 * viewScale;
        
        this.sceneManager.drawPanel(
            panelX + 3 * viewScale,
            inputY,
            inputWidth,
            15 * viewScale,
            { backgroundColor: 'white', borderRadius: 3 }
        );
        
        // Input text with cursor
        const displayText = this.chatInput + (Date.now() % 1000 < 500 ? '|' : '');
        this.sceneManager.drawText(displayText, panelX + 5 * viewScale, inputY + 10 * viewScale, {
            fontSize: 7 * viewScale
        });
        
        // Send button
        this.sceneManager.drawButton(
            'Send',
            panelX + panelWidth - 28 * viewScale,
            inputY,
            25 * viewScale,
            15 * viewScale,
            { 
                backgroundColor: '#3b82f6',
                borderColor: '#2563eb',
                fontSize: 6 * viewScale
            }
        );
        
        // Store send button for click detection
        this.sendChatButton = {
            x: panelX + panelWidth - 28 * viewScale,
            y: inputY,
            width: 25 * viewScale,
            height: 15 * viewScale,
            onClick: () => this.sendChatMessage()
        };
        
        // Store chat input area for click detection
        this.chatInputArea = {
            x: panelX + 3 * viewScale,
            y: inputY,
            width: inputWidth,
            height: 15 * viewScale,
            onClick: () => {
                // Chat input focused
            }
        };
    }
    
    sendChatMessage() {
        if (this.chatInput.trim() && gameData.connected) {
            gameData.sendRoomChatMessage(this.chatInput.trim());
            this.chatInput = '';
        }
    }
    


    // Override handleClick to handle players list interactions
    handleClick(x, y) {
        // Check room dropdown first
        if (this.showRoomsDropdown) {
            // Check scroll arrows first
            if (this.scrollUpButton && this.isPointInButton(x, y, this.scrollUpButton)) {
                this.scrollUpButton.onClick();
                return;
            }
            if (this.scrollDownButton && this.isPointInButton(x, y, this.scrollDownButton)) {
                this.scrollDownButton.onClick();
                return;
            }
            
            // Check dropdown items
            if (this.roomDropdownItems) {
                for (let item of this.roomDropdownItems) {
                    if (this.isPointInButton(x, y, item)) {
                        item.onClick();
                        return;
                    }
                }
            }
            
            // Click outside dropdown to close it
            this.showRoomsDropdown = false;
            this.hoveredRoomIndex = -1; // Clear hover when closing
            return;
        }
        
        // Check room dropdown button
        if (this.roomDropdownButton && this.isPointInButton(x, y, this.roomDropdownButton)) {
            this.roomDropdownButton.onClick();
            return;
        }
        
        // Check players list buttons
        if (this.showPlayersList) {
            // Check challenge buttons
            if (this.challengeButtons) {
                for (let button of this.challengeButtons) {
                    if (button && this.isPointInButton(x, y, button)) {
                        button.onClick();
                        return;
                    }
                }
            }
        }
        
        // Check permanent chat buttons (always available when connected)
        if (gameData.connected) {
            // Check send chat button
            if (this.sendChatButton && this.isPointInButton(x, y, this.sendChatButton)) {
                this.sendChatButton.onClick();
                return;
            }
            
            // Check chat input area
            if (this.chatInputArea && this.isPointInButton(x, y, this.chatInputArea)) {
                this.chatInputArea.onClick();
                return;
            }
        }
        
        // Call parent handleClick for regular buttons
        super.handleClick(x, y);
    }
    
    isPointInButton(x, y, button) {
        return x >= button.x && 
               x <= button.x + button.width && 
               y >= button.y && 
               y <= button.y + button.height;
    }

    // Handle wheel scrolling for dropdown
    handleWheel(x, y, deltaY) {
        // Only handle wheel events if dropdown is open and mouse is over dropdown area
        if (this.showRoomsDropdown && this.dropdownBounds) {
            const isOverDropdown = x >= this.dropdownBounds.x && 
                                 x <= this.dropdownBounds.x + this.dropdownBounds.width &&
                                 y >= this.dropdownBounds.y && 
                                 y <= this.dropdownBounds.y + this.dropdownBounds.height;
            
            if (isOverDropdown) {
                // Scroll up/down based on wheel direction
                const scrollDirection = deltaY > 0 ? 1 : -1;
                const newScrollOffset = this.dropdownScrollOffset + scrollDirection;
                
                // Clamp to bounds
                this.dropdownScrollOffset = Math.max(0, Math.min(newScrollOffset, this.dropdownBounds.maxScrollOffset));
            }
        }
    }

    // Handle mouse movement for hover effects
    handleMouseMove(x, y) {
        // Only handle hover if dropdown is open
        if (this.showRoomsDropdown && this.roomDropdownItems) {
            let newHoveredIndex = -1;
            
            // Check which room item is being hovered
            for (let i = 0; i < this.roomDropdownItems.length; i++) {
                const item = this.roomDropdownItems[i];
                if (this.isPointInButton(x, y, item)) {
                    newHoveredIndex = i + this.dropdownScrollOffset;
                    break;
                }
            }
            
            // Update hovered index if it changed
            if (newHoveredIndex !== this.hoveredRoomIndex) {
                this.hoveredRoomIndex = newHoveredIndex;
            }
        } else {
            // Clear hover when dropdown is closed
            this.hoveredRoomIndex = -1;
        }
    }

    // Helper methods to update stats (now using gameData)
    updateGamesWon(value) {
        gameData.updateStats({ gamesWon: parseInt(value) });
    }

    updateGamesLost(value) {
        gameData.updateStats({ gamesLost: parseInt(value) });
    }

    updateRating(value) {
        gameData.updateStats({ rating: parseInt(value) });
    }

    updatePlayersOnline(value) {
        gameData.updateStats({ playersOnline: parseInt(value) });
    }

    // Get current stats values
    getStats() {
        return gameData.playerData.stats;
    }

    // Update multiple stats at once
    updateStats(newStats) {
        gameData.updateStats(newStats);
    }

    // Update room player counts (called when server data is received)
    updateRoomPlayerCounts(roomData) {
        // Updating room player counts
        if (roomData && typeof roomData === 'object') {
            // roomData is an object like { "Battlegrounds": 2, "Jungle": 1 }
            this.rooms.forEach(room => {
                if (roomData.hasOwnProperty(room.name)) {
                    room.players = roomData[room.name];
                    // Room player count updated
                } else {
                    // Room not in server data means 0 players
                    room.players = 0;
                }
            });
        }
    }

    // Reset all room player counts to 0 (called when server is offline)
    resetRoomPlayerCounts() {
        this.rooms.forEach(room => {
            room.players = 0;
        });
    }

    destroy() {
        // Unsubscribe from game data updates
        if (this.unsubscribe) {
            this.unsubscribe();
        }
        
        // Stop snowfall when leaving lobby
        this.sceneManager.stopSnowfall();
        super.destroy();
    }
}