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
    }

    async create() {
        // Load all required images
        await this.loadImages();
        
        // Try to connect to server (fallback to local if fails)
        await this.tryConnectToServer();
        
        // Subscribe to players list updates
        gameData.onPlayersListUpdate((players) => {
            console.log('Lobby received players list update:', players);
            this.onlinePlayers = players;
        });
        
        // Subscribe to connection status changes
        gameData.subscribe((playerData) => {
            console.log('Lobby: Stats updated -', playerData.stats);
            this.statsData = playerData.stats;
        });
        
        // Subscribe to game start events
        gameData.onGameStart((opponent) => {
            console.log('Game starting! Opponent:', opponent);
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
        } catch (error) {
            console.log('Server unavailable, using local mode');
        }
    }

    async loadImages() {
        const imagePaths = [
            'images/Background.svg',
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
                x: 80 * viewScale,
                y: 260 * viewScale,
                width: 120 * viewScale,
                height: 40 * viewScale,
                text: "Local Game",
                onClick: () => {
                    gameData.startLocalGame();
                    this.sceneManager.startScene('localGame');
                }
            },
            {
                x: 220 * viewScale,
                y: 260 * viewScale,
                width: 120 * viewScale,
                height: 40 * viewScale,
                text: "Practice",
                onClick: () => {
                    gameData.startLocalGame();
                    console.log('Starting practice mode...');
                }
            },
            {
                x: 360 * viewScale,
                y: 260 * viewScale,
                width: 120 * viewScale,
                height: 40 * viewScale,
                text: gameData.connected ? "Find Players" : "Server Offline",
                onClick: () => {
                    console.log('Find Players button clicked. Connected:', gameData.connected);
                    if (gameData.connected) {
                        console.log('Toggling players list. Current state:', this.showPlayersList);
                        this.showPlayersList = !this.showPlayersList;
                        if (this.showPlayersList) {
                            gameData.requestPlayersList();
                        }
                    } else {
                        console.log('Server not available');
                    }
                }
            }
        ];
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

    challengePlayer(playerId, playerName) {
        console.log(`Challenging player ${playerName} (${playerId})`);
        const success = gameData.startOnlineGame(playerId);
        if (success) {
            console.log('Challenge sent successfully');
            // Don't immediately start scene - wait for game to actually start
        } else {
            console.log('Failed to send challenge');
        }
    }

    render(ctx) {
        // Draw background
        this.sceneManager.drawBackground('images/Background.svg');
        
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

        this.sceneManager.drawText(this.statsData.rating, 390 * viewScale, 105 * viewScale, {
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
    }

    drawButtons() {
        // Game mode buttons
        this.sceneManager.drawButton(
            'Local Game',
            80 * viewScale,
            260 * viewScale,
            120 * viewScale,
            40 * viewScale
        );
        
        this.sceneManager.drawButton(
            'Practice',
            220 * viewScale,
            260 * viewScale,
            120 * viewScale,
            40 * viewScale,
            { backgroundColor: '#10b981', borderColor: '#059669' }
        );
        
        // Use the same logic as setupButtons for the third button
        const thirdButtonText = gameData.connected ? "Find Players" : "Server Offline";
        this.sceneManager.drawButton(
            thirdButtonText,
            360 * viewScale,
            260 * viewScale,
            120 * viewScale,
            40 * viewScale,
            { backgroundColor: '#3b82f6', borderColor: '#2563eb' }
        );
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
        this.sceneManager.drawText('Online Players', panelX + 10 * viewScale, panelY + 10 * viewScale, {
            fontSize: 14 * viewScale,
            fontWeight: 'bold'
        });
        
        // Your player info
        this.sceneManager.drawText(`You: ${this.playerName}`, panelX + 10 * viewScale, panelY + 30 * viewScale, {
            fontSize: 11 * viewScale,
            color: 'rgb(0, 120, 0)'
        });
        
        // Other players
        const otherPlayers = this.onlinePlayers.filter(p => p.id !== gameData.playerData.profile.id);
        
        console.log('Debug: All online players:', this.onlinePlayers);
        console.log('Debug: My player ID:', gameData.playerData.profile.id);
        console.log('Debug: Other players:', otherPlayers);
        
        if (otherPlayers.length === 0) {
            this.sceneManager.drawText('No other players online', panelX + 10 * viewScale, panelY + 50 * viewScale, {
                fontSize: 10 * viewScale,
                color: 'rgb(128, 128, 128)'
            });
            
            // Show debug info
            this.sceneManager.drawText(`Total players: ${this.onlinePlayers.length}`, panelX + 10 * viewScale, panelY + 65 * viewScale, {
                fontSize: 9 * viewScale,
                color: 'rgb(128, 128, 128)'
            });
        } else {
            otherPlayers.forEach((player, index) => {
                const yPos = panelY + 50 * viewScale + (index * 20 * viewScale);
                
                // Player name
                this.sceneManager.drawText(player.name, panelX + 10 * viewScale, yPos, {
                    fontSize: 11 * viewScale,
                    color: 'rgb(0, 0, 0)'
                });
                
                // Challenge button
                const buttonX = panelX + 120 * viewScale;
                const buttonY = yPos - 2 * viewScale;
                const buttonWidth = 70 * viewScale;
                const buttonHeight = 16 * viewScale;
                
                this.sceneManager.drawButton(
                    'Challenge',
                    buttonX,
                    buttonY,
                    buttonWidth,
                    buttonHeight,
                    { 
                        backgroundColor: '#10b981', 
                        borderColor: '#059669',
                        fontSize: 9
                    }
                );
                
                // Add button to clickable buttons list
                if (!this.playerButtons) this.playerButtons = [];
                this.playerButtons[index] = {
                    x: buttonX,
                    y: buttonY,
                    width: buttonWidth,
                    height: buttonHeight,
                    onClick: () => this.challengePlayer(player.id, player.name)
                };
            });
        }
        
        // Close button
        const closeX = panelX + panelWidth - 20 * viewScale;
        const closeY = panelY + 5 * viewScale;
        this.sceneManager.drawText('✕', closeX, closeY, {
            fontSize: 14 * viewScale,
            color: 'rgb(200, 0, 0)'
        });
        
        // Add close button to clickable area
        if (!this.closeButton) {
            this.closeButton = {
                x: closeX - 5 * viewScale,
                y: closeY - 5 * viewScale,
                width: 15 * viewScale,
                height: 15 * viewScale,
                onClick: () => { this.showPlayersList = false; }
            };
        }
    }

    // Override handleClick to handle players list interactions
    handleClick(x, y) {
        // Check players list buttons first
        if (this.showPlayersList) {
            // Check close button
            if (this.closeButton && this.isPointInButton(x, y, this.closeButton)) {
                this.closeButton.onClick();
                return;
            }
            
            // Check player challenge buttons
            if (this.playerButtons) {
                for (let button of this.playerButtons) {
                    if (button && this.isPointInButton(x, y, button)) {
                        button.onClick();
                        return;
                    }
                }
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