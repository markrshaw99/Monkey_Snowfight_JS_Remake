// Core Monkey Snowfight Game Implementation
// Based on original Flash ActionScript code analysis

class LocalGame extends Scene {
    constructor(sceneManager, data = {}) {
        super(sceneManager, data);
        this.name = 'LocalGame';
        this.gameState = 'ready'; // 'ready', 'playing', 'gameOver'
        
        // Core physics constants from original Flash ActionScript
        this.GRAVITY = 1.3;
        this.DRAG = 0.9;
        this.HIT_TEST_ITERATIONS = 11;
        this.POWER_BOOST = 1.5;
        this.START_ANGLE = 45;
        this.FIRE_PAUSE = 2500; // ms between shots
        
        // Input state
        this.mouseX = 0;
        this.mouseY = 0;
        this.keys = {};
        
        console.log('LocalGame scene constructed - ready for implementation');
    }

    initializePlayers() {
        this.players = [
            {
                id: 0,
                name: 'Player 1',
                side: 'left',
                cannonX: 100,
                cannonY: 300,
                angle: this.START_ANGLE,
                power: 1,
                snowWeight: 0,
                maxSnow: 46,
                energy: 1, // 1-100 (101 = game over)
                snowballsFired: 0,
                snowballsExploded: 0,
                isStunned: false,
                stunEndTime: 0,
                outOfSnow: false,
                cannonContents: 'snow', // 'snow' or 'nana' (banana bomb)
                wins: 0,
                losses: 0,
                // Animation system
                animator: null, // Will be initialized after assets load
            },
            {
                id: 1,
                name: 'Player 2',
                side: 'right',
                cannonX: 500,
                cannonY: 300,
                angle: this.START_ANGLE,
                power: 1,
                snowWeight: 0,
                maxSnow: 46,
                energy: 1,
                snowballsFired: 0,
                snowballsExploded: 0,
                isStunned: false,
                stunEndTime: 0,
                outOfSnow: false,
                cannonContents: 'snow',
                wins: 0,
                losses: 0,
                // Animation system
                animator: null, // Will be initialized after assets load
            }
        ];
        
        // Set current player (local multiplayer alternates turns)
        this.currentPlayer = 0;
        this.lastFireTime = 0;
        this.canFire = true;
        
        // Define animation sequences based on original Flash sprites
        this.animationStates = {
            'idle': {
                frames: 1,
                loop: false,
                nextState: null
            },
            'angle': {
                frames: 1,
                loop: false,
                nextState: null
            },
            'addSnow': {
                frames: 8,
                loop: false,
                nextState: 'idle',
                frameRate: 80
            },
            'scared': {
                frames: 1,
                loop: false,
                nextState: null
            },
            'prepareExplosion': {
                frames: 6,
                loop: false,
                nextState: 'explosion',
                frameRate: 60
            },
            'explosion': {
                frames: 8,
                loop: false,
                nextState: 'idle',
                frameRate: 50
            },
            'hit': {
                frames: 10,
                loop: false,
                nextState: 'idle',
                frameRate: 80
            },
            'win': {
                frames: 12,
                loop: true,
                nextState: null,
                frameRate: 120
            }
        };
    }

    async onEnter() {
        console.log('Entered LocalGame scene');
        
        // Load assets if not already loaded
        if (!this.assetsLoaded && !assetLoader.isLoaded()) {
            this.gameState = 'loading';
            console.log('Loading game assets...');
            const loadSuccess = await assetLoader.loadAllAssets();
            if (loadSuccess) {
                this.assetsLoaded = true;
                this.initializeAnimators();
                this.gameState = 'playing';
                console.log('Assets loaded, game ready!');
            } else {
                console.error('Failed to load assets, continuing with placeholders');
                this.assetsLoaded = false;
                this.gameState = 'playing';
            }
        } else if (assetLoader.isLoaded() && !this.assetsLoaded) {
            this.assetsLoaded = true;
            this.initializeAnimators();
            this.gameState = 'playing';
        }
        
        // Generate obstacles
        this.generateObstacles();
        
        // Set up input listeners
        this.setupInputListeners();
    }

    initializeAnimators() {
        // Initialize player animators
        this.players.forEach(player => {
            player.animator = new MonkeyCannonAnimator(player.id);
            player.animator.setState('idle');
        });
        
        // Initialize snowpile animators
        this.terrain.snowpiles.forEach(snowpile => {
            snowpile.animator = new SnowpileAnimator(snowpile.id);
        });
    }

    generateObstacles() {
        // Clear existing terrain obstacles
        this.terrain.obstacles = [];
        
        // Generate obstacles similar to original Flash logic
        const obstacleCount = 6;
        
        for (let i = 1; i <= obstacleCount; i++) {
            // Generate random position in valid area (avoiding cannons and snowpiles)
            let x, y;
            let attempts = 0;
            
            do {
                x = 150 + Math.random() * 300; // Keep in center area
                y = 250 + Math.random() * 80;  // Keep in lower area
                attempts++;
            } while (attempts < 50 && this.isPositionTooClose(x, y));
            
            const obstacle = {
                id: i,
                x: x,
                y: y,
                scale: 80 + Math.random() * 40, // 80-120% scale
                frame: Math.floor(Math.random() * 5) + 1, // Random frame 1-5
                hitsLeft: 3,
                size: 30, // Collision radius
                visible: true
            };
            
            this.terrain.obstacles.push(obstacle);
        }
        
        console.log(`Generated ${this.terrain.obstacles.length} terrain obstacles`);
    }

    isPositionTooClose(x, y) {
        // Check distance from cannons
        for (let player of this.players) {
            const dist = Math.hypot(x - player.cannonX, y - player.cannonY);
            if (dist < 80) return true;
        }
        
        // Check distance from snowpiles
        for (let pile of this.terrain.snowpiles) {
            const dist = Math.hypot(x - pile.x, y - pile.y);
            if (dist < 60) return true;
        }
        
        // Check distance from other obstacles
        for (let obs of this.terrain.obstacles) {
            const dist = Math.hypot(x - obs.x, y - obs.y);
            if (dist < 50) return true;
        }
        
        return false;
    }

    generateObstaclesOld() {
        this.obstacles = [];
        const obstacleCount = 6;
        
        for (let i = 0; i < obstacleCount; i++) {
            // Generate random position in valid area (avoiding cannons)
            let x, y;
            let validPosition = false;
            let attempts = 0;
            
            while (!validPosition && attempts < 50) {
                x = 150 + Math.random() * 300; // Middle area
                y = 100 + Math.random() * 200;
                
                // Check distance from cannons
                const dist1 = Math.hypot(x - this.players[0].cannonX, y - this.players[0].cannonY);
                const dist2 = Math.hypot(x - this.players[1].cannonX, y - this.players[1].cannonY);
                
                if (dist1 > 80 && dist2 > 80) {
                    validPosition = true;
                }
                attempts++;
            }
            
            // Random obstacle type and size
            const types = ['ice', 'sphere'];
            const type = types[Math.floor(Math.random() * types.length)];
            const size = 50 + Math.random() * 100;
            
            this.obstacles.push({
                x: x || 200 + i * 50,
                y: y || 200,
                type: type,
                size: size,
                hitsLeft: type === 'ice' ? 3 : 1,
                maxHits: type === 'ice' ? 3 : 1
            });
        }
    }

    setupInputListeners() {
        // These will be handled by the main event system
        // Input is processed in handleMouseMove, handleMouseDown, etc.
    }

    update(deltaTime) {
        if (this.gameState === 'loading') {
            return; // Don't update game logic while loading
        }

        const now = Date.now();
        
        // Handle continuous input (like power building)
        this.handleContinuousInput();
        
        // Update stunned players
        this.players.forEach(player => {
            if (player.isStunned && now > player.stunEndTime) {
                player.isStunned = false;
            }
        });
        
        // Update animations
        this.updateAnimations(deltaTime);
        
        // Update snowballs
        this.updateSnowballs(deltaTime);
        
        // Update explosions and effects
        this.updateEffects(deltaTime);
        
        // Check win conditions
        this.checkWinConditions();
    }

    updateSnowballs(deltaTime) {
        for (let i = this.snowballs.length - 1; i >= 0; i--) {
            const ball = this.snowballs[i];
            
            // Apply physics
            ball.vy += this.GRAVITY;
            ball.x += this.DRAG * ball.vx;
            ball.y += this.DRAG * ball.vy;
            
            ball.framesTravelled++;
            
            // Update animation
            ball.animTimer += deltaTime;
            if (ball.animTimer > 50) { // Change frame every 50ms
                ball.animFrame = (ball.animFrame + 1) % 19; // 19 frames for ball sprite
                ball.animTimer = 0;
            }
            
            // Add rotation based on velocity
            ball.rotation += Math.hypot(ball.vx, ball.vy) * 0.02;
            
            // Hit testing with multiple iterations for precision
            for (let iter = 1; iter <= this.HIT_TEST_ITERATIONS; iter++) {
                const testX = ball.x + (ball.x - ball.prevX) * (iter / this.HIT_TEST_ITERATIONS);
                const testY = ball.y + (ball.y - ball.prevY) * (iter / this.HIT_TEST_ITERATIONS);
                
                if (this.checkCollisions(ball, testX, testY, i)) {
                    break;
                }
            }
            
            ball.prevX = ball.x;
            ball.prevY = ball.y;
            
            // Remove if out of bounds or too old
            if (ball.x < -100 || ball.x > 700 || ball.y < -100 || ball.y > 500 || 
                ball.framesTravelled > 300) {
                this.removeSnowball(i, false);
            }
        }
    }

    checkCollisions(ball, testX, testY, ballIndex) {
        // Check terrain collision (simplified - assume bottom of screen)
        if (testY > 350) {
            ball.x = testX;
            ball.y = testY;
            this.removeSnowball(ballIndex, true);
            return true;
        }
        
        // Check obstacle collisions
        for (let obs of this.obstacles) {
            const dist = Math.hypot(testX - obs.x, testY - obs.y);
            if (dist < obs.size / 2 + ball.radius) {
                ball.x = testX;
                ball.y = testY;
                this.hitObstacle(obs, ball);
                this.removeSnowball(ballIndex, true);
                return true;
            }
        }
        
        // Check player collisions
        for (let player of this.players) {
            // Check monkey hit (simplified as circle around cannon)
            const dist = Math.hypot(testX - player.cannonX, testY - player.cannonY);
            if (dist < 40 + ball.radius && ball.framesTravelled > 10) {
                ball.x = testX;
                ball.y = testY;
                this.hitPlayer(player, ball);
                this.removeSnowball(ballIndex, true);
                return true;
            }
        }
        
        return false;
    }

    hitObstacle(obstacle, ball) {
        if (obstacle.type === 'ice') {
            obstacle.hitsLeft -= ball.weight;
            if (obstacle.hitsLeft <= 0) {
                // Remove obstacle
                const index = this.obstacles.indexOf(obstacle);
                if (index > -1) {
                    this.obstacles.splice(index, 1);
                    this.createExplosion(obstacle.x, obstacle.y, 'ice');
                }
            }
        }
    }

    hitPlayer(player, ball) {
        const damage = Math.floor(ball.weight * 8);
        player.energy = Math.min(100, player.energy + damage);
        
        // Stun player
        player.isStunned = true;
        player.stunEndTime = Date.now() + (ball.weight * 500);
        
        // Trigger hit animation
        this.setPlayerAnimation(player, 'hit');
        
        // Adjust cannon angle randomly
        player.angle = Math.min(90, Math.max(0, player.angle + (Math.random() - 0.5) * ball.weight * 9));
        
        this.createExplosion(player.cannonX, player.cannonY, 'hit');
    }

    removeSnowball(index, createExplosion = false) {
        const ball = this.snowballs[index];
        if (createExplosion) {
            this.createExplosion(ball.x, ball.y, 'snow');
            
            // Create glitter effect
            for (let i = 0; i < 3; i++) {
                this.glitter.push({
                    x: ball.x + (Math.random() - 0.5) * 20,
                    y: ball.y + (Math.random() - 0.5) * 20,
                    life: 30,
                    maxLife: 30
                });
            }
        }
        this.snowballs.splice(index, 1);
    }

    createExplosion(x, y, type) {
        // Create both sprite-based and simple explosion for compatibility
        if (this.assetsLoaded && assetLoader.isLoaded()) {
            const explosionAnimator = new EffectAnimator('explosion', x, y);
            this.effectAnimators.push(explosionAnimator);
        }
        
        // Also create simple explosion as fallback
        this.explosions.push({
            x: x,
            y: y,
            type: type,
            life: 20,
            maxLife: 20
        });
    }

    updateEffects(deltaTime) {
        // Update explosions
        for (let i = this.explosions.length - 1; i >= 0; i--) {
            this.explosions[i].life--;
            if (this.explosions[i].life <= 0) {
                this.explosions.splice(i, 1);
            }
        }
        
        // Update glitter
        for (let i = this.glitter.length - 1; i >= 0; i--) {
            this.glitter[i].life--;
            if (this.glitter[i].life <= 0) {
                this.glitter.splice(i, 1);
            }
        }
    }

    checkWinConditions() {
        // Check if any player has energy >= 100 (knocked out)
        for (let player of this.players) {
            if (player.energy >= 100) {
                this.gameState = 'gameOver';
                // Winner is the other player
                this.winner = this.players.find(p => p.id !== player.id);
                return;
            }
        }
        
        // Check if both players are out of snow
        const bothOutOfSnow = this.players.every(p => p.outOfSnow);
        if (bothOutOfSnow) {
            this.gameState = 'gameOver';
            // Winner is player with lower energy
            if (this.players[0].energy < this.players[1].energy) {
                this.winner = this.players[0];
            } else if (this.players[1].energy < this.players[0].energy) {
                this.winner = this.players[1];
            } else {
                this.winner = null; // Tie
            }
        }
    }

    fire() {
        const player = this.players[this.currentPlayer];
        const now = Date.now();
        
        if (!this.canFire || player.isStunned || now - this.lastFireTime < this.FIRE_PAUSE) {
            return;
        }
        
        if (player.snowWeight === 0 && player.cannonContents === 'snow') {
            return; // No snow to fire
        }
        
        // Trigger prepareExplosion animation
        this.setPlayerAnimation(player, 'prepareExplosion');
        
        // Delay the actual firing to sync with animation
        setTimeout(() => {
            this.executeFireball(player, now);
        }, 300); // Wait for prepareExplosion animation
    }

    executeFireball(player, fireTime) {
        player.snowballsFired++;
        const ballId = `ball_${player.id}_${player.snowballsFired}`;
        
        // Calculate launch velocity
        let angleRad = -player.angle * Math.PI / 180;
        
        // Flip angle for right-side player (Player 2)
        if (player.side === 'right') {
            angleRad = Math.PI - angleRad; // Mirror the angle
        }
        
        const power = player.power * this.POWER_BOOST;
        const weight = player.cannonContents === 'snow' ? player.snowWeight : 7; // Banana bomb weight
        const vmax = power - weight;
        
        const snowball = {
            id: ballId,
            x: player.cannonX,
            y: player.cannonY,
            prevX: player.cannonX,
            prevY: player.cannonY,
            vx: vmax * Math.cos(angleRad),
            vy: vmax * Math.sin(angleRad),
            weight: weight,
            radius: (50 + weight * 18) / 2,
            size: 50 + weight * 18,
            framesTravelled: 0,
            playerId: player.id,
            type: player.cannonContents,
            // Animation properties
            animFrame: 0,
            animTimer: 0,
            rotation: 0
        };
        
        this.snowballs.push(snowball);
        
        // Reset player state
        player.snowWeight = 0;
        player.power = 1;
        
        // Switch to other player
        this.currentPlayer = 1 - this.currentPlayer;
        this.lastFireTime = fireTime;
    }

    addSnow() {
        const player = this.players[this.currentPlayer];
        if (player.snowWeight >= player.maxSnow || player.isStunned) {
            return; // Can't collect more snow if full or stunned
        }
        
        // Check if player is near a snowpile
        const nearbySnowpile = this.getNearbySnowpile(player);
        if (!nearbySnowpile) {
            // Optional: Show visual feedback that player needs to be near a snowpile
            console.log("No snowpile nearby or snowpile is empty!");
            return;
        }
        
        // Collect snow from the pile
        if (this.collectSnowFromPile(player, nearbySnowpile)) {
            // Trigger addSnow animation
            this.setPlayerAnimation(player, 'addSnow');
            
            if (player.snowWeight >= player.maxSnow) {
                player.outOfSnow = false; // Player is now full, not out of snow
                // Trigger celebration animation when full
                setTimeout(() => {
                    this.setPlayerAnimation(player, 'happy');
                }, 500); // Delay to let addSnow animation finish
            }
        }
    }

    updateAnimations(deltaTime) {
        // Update player animators
        this.players.forEach(player => {
            if (player.animator) {
                player.animator.update(deltaTime);
            }
        });

        // Update effect animators
        for (let i = this.effectAnimators.length - 1; i >= 0; i--) {
            const effectAnimator = this.effectAnimators[i];
            effectAnimator.update(deltaTime);
            
            if (effectAnimator.isCompleted()) {
                this.effectAnimators.splice(i, 1);
            }
        }
    }

    setPlayerAnimation(player, stateName, options = {}) {
        if (player.animator) {
            player.animator.setState(stateName, options);
        }
    }

    render(ctx, canvas, viewScale) {
        if (this.gameState === 'loading') {
            this.renderLoading(ctx, canvas, viewScale);
            return;
        }
        
        if (this.gameState === 'gameOver') {
            this.renderGameOver(ctx, canvas, viewScale);
            return;
        }
        
        // Draw background (same as Lobby)
        this.sceneManager.drawBackground('images/Background.svg');
        
        // Draw snowfall (same as Lobby)
        this.sceneManager.renderSnowfall();
        
        // Draw ground
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 350 * viewScale, canvas.width, canvas.height - 350 * viewScale);
        
        // Draw players/cannons
        this.renderPlayers(ctx, viewScale);
        
        // Draw terrain (obstacles and snowpiles)
        this.renderTerrain(ctx, viewScale);
        
        // Draw obstacles (old system - keep for compatibility)
        this.renderObstacles(ctx, viewScale);
        
        // Draw snowballs
        this.renderSnowballs(ctx, viewScale);
        
        // Draw effects
        this.renderEffects(ctx, viewScale);
        
        // Draw UI
        this.renderUI(ctx, canvas, viewScale);
    }

    renderLoading(ctx, canvas, viewScale) {
        // Clear screen
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Loading text
        ctx.fillStyle = '#FFD700';
        ctx.font = `${Math.floor(32 * viewScale)}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText('Loading Monkey Snowfight Assets...', canvas.width / 2, canvas.height / 2);
        
        // Show which assets are loading
        if (assetLoader) {
            ctx.font = `${Math.floor(16 * viewScale)}px Arial`;
            let yOffset = 50 * viewScale;
            
            Object.entries(assetLoader.assets).forEach(([name, asset]) => {
                const status = asset.loaded ? '✓ Loaded' : '⟳ Loading...';
                const color = asset.loaded ? '#4CAF50' : '#FFA500';
                ctx.fillStyle = color;
                ctx.fillText(`${name}: ${status}`, canvas.width / 2, canvas.height / 2 + yOffset);
                yOffset += 25 * viewScale;
            });
        }
        
        // Simple loading animation
        const dots = '.'.repeat((Math.floor(Date.now() / 500) % 4));
        ctx.fillStyle = '#FFD700';
        ctx.font = `${Math.floor(24 * viewScale)}px Arial`;
        ctx.fillText(dots, canvas.width / 2, canvas.height / 2 + 150 * viewScale);
    }

    renderPlayers(ctx, viewScale) {
        this.players.forEach((player, index) => {
            const x = player.cannonX * viewScale;
            const y = player.cannonY * viewScale;
            
            // Use sprite-based rendering if assets are loaded
            if (this.assetsLoaded && assetLoader.isLoaded()) {
                this.renderCannonSprite(ctx, player, x, y, viewScale);
            } else {
                // Fallback to simple rendering
                this.renderSimpleCannon(ctx, player, x, y, viewScale);
            }
            
            // Current player indicator
            if (index === this.currentPlayer && !player.isStunned) {
                ctx.strokeStyle = '#FFD700';
                ctx.lineWidth = 3 * viewScale;
                ctx.beginPath();
                ctx.arc(x, y, 30 * viewScale, 0, Math.PI * 2);
                ctx.stroke();
            }
        });
    }

    renderCannonSprite(ctx, player, x, y, viewScale) {
        // Get the cannon sprite frame based on angle
        const cannonFrame = assetLoader.getCannonFrame(player.angle);
        
        if (cannonFrame) {
            ctx.save();
            
            // Flip for player 2 (right side)
            if (player.side === 'right') {
                ctx.scale(-1, 1);
                x = -x;
            }
            
            // Add slight tint based on player state
            if (player.isStunned) {
                ctx.globalAlpha = 0.7;
                ctx.fillStyle = 'rgba(255, 107, 107, 0.3)';
                ctx.fillRect(x - 50 * viewScale, y - 50 * viewScale, 100 * viewScale, 100 * viewScale);
            }
            
            // Draw the cannon sprite
            const spriteSize = 100 * viewScale;
            ctx.drawImage(
                cannonFrame,
                x - spriteSize / 2,
                y - spriteSize / 2,
                spriteSize,
                spriteSize
            );
            
            ctx.restore();
        } else {
            // Fallback if sprite not available
            this.renderSimpleCannon(ctx, player, x, y, viewScale);
        }
    }

    renderSimpleCannon(ctx, player, x, y, viewScale) {
        // Draw cannon base
        ctx.fillStyle = player.isStunned ? '#FF6B6B' : '#8B4513';
        ctx.beginPath();
        ctx.arc(x, y, 25 * viewScale, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw cannon barrel
        const barrelLength = 40 * viewScale;
        let angleRad = -player.angle * Math.PI / 180;
        
        // Flip angle for right-side player (Player 2)
        if (player.side === 'right') {
            angleRad = Math.PI - angleRad; // Mirror the angle
        }
        
        const barrelEndX = x + Math.cos(angleRad) * barrelLength;
        const barrelEndY = y + Math.sin(angleRad) * barrelLength;
        
        ctx.strokeStyle = player.isStunned ? '#FF6B6B' : '#654321';
        ctx.lineWidth = 8 * viewScale;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(barrelEndX, barrelEndY);
        ctx.stroke();
        
        // Draw simple monkey with animation states
        this.renderSimpleMonkey(ctx, player, x, y, viewScale);
    }

    renderSimpleMonkey(ctx, player, cannonX, cannonY, viewScale) {
        if (!player.animator) return;
        
        const animator = player.animator;
        const state = animator.getCurrentState();
        const visualState = animator.visualState;
        
        // Monkey position
        const monkeyX = cannonX - 15 * viewScale;
        const monkeyY = cannonY - 20 * viewScale;
        const monkeyRadius = 12 * viewScale;
        
        // Base monkey color varies by state
        let monkeyColor = '#8B4513';
        let eyeColor = '#000000';
        let mouthShape = 'normal';
        let headRotation = animator.headRotation;
        
        switch (state) {
            case 'idle':
                monkeyColor = '#8B4513';
                break;
                
            case 'angle':
                monkeyColor = '#A0522D'; // Slightly lighter when aiming
                break;
                
            case 'addSnow':
                // Animated snow-adding action
                monkeyColor = animator.isPlaying() ? '#A0522D' : '#8B4513';
                if (visualState.mouthOpen) {
                    eyeColor = '#FFFFFF';
                }
                break;
                
            case 'scared':
                monkeyColor = '#CD853F'; // Pale when scared
                eyeColor = '#FFFFFF'; // Wide eyes
                mouthShape = 'scared';
                break;
                
            case 'prepareExplosion':
                // Anticipation animation
                monkeyColor = animator.isPlaying() ? '#654321' : '#8B4513';
                if (visualState.eyesSquinted) {
                    eyeColor = '#FFFFFF'; // Focused
                }
                break;
                
            case 'explosion':
                // Recoil animation
                monkeyColor = '#654321';
                if (animator.isPlaying()) {
                    // Recoil back
                    monkeyX -= 5 * viewScale;
                }
                if (visualState.mouthOpen) {
                    mouthShape = 'open';
                }
                break;
                
            case 'hit':
                // Hit reaction animation
                monkeyColor = visualState.scared ? '#FF6B6B' : '#CD853F';
                eyeColor = '#FF0000';
                mouthShape = 'hurt';
                // Shake effect
                if (animator.isPlaying()) {
                    const shakeX = (Math.random() - 0.5) * 4 * viewScale;
                    const shakeY = (Math.random() - 0.5) * 4 * viewScale;
                    monkeyX += shakeX;
                    monkeyY += shakeY;
                }
                break;
                
            case 'win':
                // Victory animation
                monkeyColor = '#FFD700'; // Golden victory color
                eyeColor = '#000000';
                mouthShape = 'happy';
                // Bounce effect
                if (visualState.celebrating && animator.isPlaying()) {
                    monkeyY -= 3 * viewScale;
                }
                break;
        }
        
        // Save context for rotation
        ctx.save();
        ctx.translate(monkeyX, monkeyY);
        ctx.rotate(headRotation * Math.PI / 180);
        
        // Draw monkey head
        ctx.fillStyle = monkeyColor;
        ctx.beginPath();
        ctx.arc(0, 0, monkeyRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw eyes based on visual state
        ctx.fillStyle = eyeColor;
        const eyeSize = visualState.eyesSquinted ? 1 * viewScale : 2 * viewScale;
        ctx.beginPath();
        ctx.arc(-4 * viewScale, -3 * viewScale, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(4 * viewScale, -3 * viewScale, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw mouth based on state
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1 * viewScale;
        ctx.beginPath();
        
        switch (mouthShape) {
            case 'normal':
                ctx.arc(0, 3 * viewScale, 3 * viewScale, 0, Math.PI);
                break;
            case 'open':
                ctx.arc(0, 3 * viewScale, 4 * viewScale, 0, Math.PI * 2);
                break;
            case 'scared':
                ctx.arc(0, 3 * viewScale, 4 * viewScale, 0, Math.PI * 2);
                break;
            case 'hurt':
                ctx.moveTo(-3 * viewScale, 5 * viewScale);
                ctx.lineTo(3 * viewScale, 5 * viewScale);
                break;
            case 'happy':
                ctx.arc(0, 2 * viewScale, 4 * viewScale, 0, Math.PI);
                break;
        }
        ctx.stroke();
        
        // Restore context
        ctx.restore();
    }

    renderObstacles(ctx, viewScale) {
        this.obstacles.forEach(obs => {
            const x = obs.x * viewScale;
            const y = obs.y * viewScale;
            const size = obs.size * viewScale;
            
            if (obs.type === 'ice') {
                // Ice block - draw as blue rectangle with damage
                const alpha = obs.hitsLeft / obs.maxHits;
                ctx.fillStyle = `rgba(173, 216, 230, ${alpha})`;
                ctx.fillRect(x - size/2, y - size/2, size, size);
                ctx.strokeStyle = '#B0E0E6';
                ctx.lineWidth = 2 * viewScale;
                ctx.strokeRect(x - size/2, y - size/2, size, size);
            } else {
                // Sphere - draw as gray circle
                ctx.fillStyle = '#808080';
                ctx.beginPath();
                ctx.arc(x, y, size/2, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#A0A0A0';
                ctx.lineWidth = 2 * viewScale;
                ctx.stroke();
            }
        });
    }

    renderTerrain(ctx, viewScale) {
        // Render terrain obstacles
        this.terrain.obstacles.forEach(obstacle => {
            if (!obstacle.visible) return;
            
            const x = obstacle.x * viewScale;
            const y = obstacle.y * viewScale;
            const scale = (obstacle.scale / 100) * viewScale;
            
            if (this.assetsLoaded && assetLoader.isLoaded()) {
                const obstacleFrame = assetLoader.getObstacleFrame(obstacle.frame - 1);
                if (obstacleFrame) {
                    ctx.save();
                    ctx.translate(x, y);
                    
                    const spriteSize = 50 * scale;
                    ctx.drawImage(
                        obstacleFrame,
                        -spriteSize / 2,
                        -spriteSize / 2,
                        spriteSize,
                        spriteSize
                    );
                    
                    ctx.restore();
                } else {
                    this.renderSimpleObstacle(ctx, obstacle, x, y, scale);
                }
            } else {
                this.renderSimpleObstacle(ctx, obstacle, x, y, scale);
            }
        });
        
        // Render snowpiles
        this.terrain.snowpiles.forEach(snowpile => {
            const x = snowpile.x * viewScale;
            const y = snowpile.y * viewScale;
            const size = (snowpile.size || 60) * viewScale;
            
            // Update snowpile animation based on pile's own snow level
            if (snowpile.animator) {
                snowpile.animator.updateSnowLevel(snowpile.currentSnow, snowpile.maxSnow);
                snowpile.frame = snowpile.animator.getCurrentFrame();
            }
            
            if (this.assetsLoaded && assetLoader.isLoaded()) {
                const snowpileFrame = assetLoader.getSnowpileFrame(snowpile.frame - 1);
                if (snowpileFrame) {
                    ctx.save();
                    
                    ctx.drawImage(
                        snowpileFrame,
                        x - size / 2,
                        y - size / 2,
                        size,
                        size
                    );
                    
                    ctx.restore();
                } else {
                    this.renderSimpleSnowpile(ctx, snowpile, x, y, viewScale);
                }
            } else {
                this.renderSimpleSnowpile(ctx, snowpile, x, y, viewScale);
            }
        });
        
        // Draw proximity indicators for snowpiles
        this.terrain.snowpiles.forEach(snowpile => {
            const player = this.players[this.currentPlayer];
            if (this.getNearbySnowpile(player) === snowpile) {
                const x = snowpile.x * viewScale;
                const y = snowpile.y * viewScale;
                const indicatorRadius = 50 * viewScale;
                
                // Draw pulsing circle to indicate player can collect snow
                const pulseIntensity = Math.sin(Date.now() * 0.01) * 0.3 + 0.7;
                ctx.strokeStyle = `rgba(0, 255, 0, ${pulseIntensity})`;
                ctx.lineWidth = 3;
                ctx.setLineDash([5, 5]);
                ctx.beginPath();
                ctx.arc(x, y, indicatorRadius, 0, Math.PI * 2);
                ctx.stroke();
                ctx.setLineDash([]);
            }
        });
    }

    renderSimpleObstacle(ctx, obstacle, x, y, scale) {
        // Fallback rendering for obstacles
        const size = 25 * scale;
        const colors = ['#8B4513', '#A0522D', '#D2B48C', '#DEB887', '#F4A460'];
        
        ctx.fillStyle = colors[obstacle.frame - 1] || '#8B4513';
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    renderSimpleSnowpile(ctx, snowpile, x, y, viewScale) {
        // Fallback rendering for snowpiles
        const size = (snowpile.size || 30) * viewScale; // Use configurable size or default
        
        // Show snow level based on snowpile's current snow
        const snowLevel = snowpile.currentSnow / snowpile.maxSnow;
        const currentRadius = size * snowLevel;
        
        // Draw the snowpile with size proportional to snow amount
        if (snowLevel > 0) {
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(x, y, currentRadius, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.strokeStyle = '#E0E0E0';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        
        // Draw outline to show maximum size
        ctx.strokeStyle = '#CCCCCC';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    renderSnowballs(ctx, viewScale) {
        this.snowballs.forEach(ball => {
            const x = ball.x * viewScale;
            const y = ball.y * viewScale;
            const radius = ball.radius * viewScale;
            
            // Use sprite-based rendering if assets are loaded
            if (this.assetsLoaded && assetLoader.isLoaded()) {
                const ballFrame = assetLoader.getBallFrame(ball.animFrame || 0);
                if (ballFrame) {
                    ctx.save();
                    ctx.translate(x, y);
                    ctx.rotate(ball.rotation || 0);
                    
                    const spriteSize = radius * 2.5; // Make sprite a bit larger than the collision radius
                    ctx.drawImage(
                        ballFrame,
                        -spriteSize / 2,
                        -spriteSize / 2,
                        spriteSize,
                        spriteSize
                    );
                    
                    ctx.restore();
                } else {
                    this.renderSimpleSnowball(ctx, ball, x, y, radius, viewScale);
                }
            } else {
                this.renderSimpleSnowball(ctx, ball, x, y, radius, viewScale);
            }
        });
    }

    renderSimpleSnowball(ctx, ball, x, y, radius, viewScale) {
        if (ball.type === 'snow') {
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#E0E0E0';
            ctx.lineWidth = 1 * viewScale;
            ctx.stroke();
        } else if (ball.type === 'nana') {
            // Banana bomb - yellow
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#FFA500';
            ctx.lineWidth = 2 * viewScale;
            ctx.stroke();
        }
    }

    renderEffects(ctx, viewScale) {
        // Render effect animators (explosions with sprites)
        this.effectAnimators.forEach(effectAnimator => {
            const x = effectAnimator.x * viewScale;
            const y = effectAnimator.y * viewScale;
            
            if (effectAnimator.type === 'explosion' && this.assetsLoaded && assetLoader.isLoaded()) {
                const explosionFrame = assetLoader.getExplosionFrame(effectAnimator.getCurrentFrame());
                if (explosionFrame) {
                    ctx.save();
                    ctx.translate(x, y);
                    ctx.scale(effectAnimator.scale, effectAnimator.scale);
                    ctx.rotate(effectAnimator.rotation);
                    ctx.globalAlpha = effectAnimator.alpha;
                    
                    const spriteSize = 100 * viewScale;
                    ctx.drawImage(
                        explosionFrame,
                        -spriteSize / 2,
                        -spriteSize / 2,
                        spriteSize,
                        spriteSize
                    );
                    
                    ctx.restore();
                } else {
                    this.renderSimpleExplosion(ctx, effectAnimator, x, y, viewScale);
                }
            }
        });
        
        // Draw simple explosions (fallback)
        this.explosions.forEach(exp => {
            this.renderSimpleExplosion(ctx, exp, exp.x * viewScale, exp.y * viewScale, viewScale);
        });
        
        // Draw glitter
        this.glitter.forEach(g => {
            const x = g.x * viewScale;
            const y = g.y * viewScale;
            const alpha = g.life / g.maxLife;
            
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.beginPath();
            ctx.arc(x, y, 2 * viewScale, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    renderUI(ctx, canvas, viewScale) {
        const player = this.players[this.currentPlayer];
        
        // Draw player info
        ctx.fillStyle = '#000000';
        ctx.font = `${Math.floor(16 * viewScale)}px Arial`;
        ctx.textAlign = 'left';
        ctx.fillText(`Current: ${player.name}`, 10 * viewScale, 30 * viewScale);
        
        // Draw energy bars
        this.players.forEach((p, index) => {
            const barX = 10 * viewScale + index * 300 * viewScale;
            const barY = 50 * viewScale;
            const barWidth = 200 * viewScale;
            const barHeight = 20 * viewScale;
            
            // Background
            ctx.fillStyle = '#CCCCCC';
            ctx.fillRect(barX, barY, barWidth, barHeight);
            
            // Energy fill (red = more damage)
            const energyPercent = p.energy / 100;
            ctx.fillStyle = `rgb(${Math.floor(255 * energyPercent)}, ${Math.floor(255 * (1 - energyPercent))}, 0)`;
            ctx.fillRect(barX, barY, barWidth * energyPercent, barHeight);
            
            // Label
            ctx.fillStyle = '#000000';
            ctx.font = `${Math.floor(12 * viewScale)}px Arial`;
            ctx.fillText(`${p.name}: ${p.energy}/100`, barX, barY - 5 * viewScale);
        });
        
        // Draw controls
        if (!player.isStunned) {
            ctx.fillStyle = '#000000';
            ctx.font = `${Math.floor(14 * viewScale)}px Arial`;
            ctx.textAlign = 'left';
            const controlY = canvas.height - 100 * viewScale;
            ctx.fillText('Controls:', 10 * viewScale, controlY);
            ctx.fillText('• Move mouse to aim', 10 * viewScale, controlY + 20 * viewScale);
            ctx.fillText('• Hold SPACE to build power, release to fire', 10 * viewScale, controlY + 40 * viewScale);
            ctx.fillText('• Press A near snowpile to collect snow', 10 * viewScale, controlY + 60 * viewScale);
            
            // Show proximity status
            const nearbySnowpile = this.getNearbySnowpile(player);
            if (nearbySnowpile) {
                ctx.fillStyle = '#00AA00';
                ctx.fillText(`• Near snowpile (${nearbySnowpile.currentSnow}/${nearbySnowpile.maxSnow} snow)`, 10 * viewScale, controlY + 80 * viewScale);
            } else {
                ctx.fillStyle = '#AA0000';
                ctx.fillText('• Move near a snowpile to collect snow', 10 * viewScale, controlY + 80 * viewScale);
            }
            
            // Show current stats
            ctx.fillStyle = '#000000';
            ctx.textAlign = 'right';
            ctx.fillText(`Angle: ${Math.floor(player.angle)}°`, canvas.width - 10 * viewScale, controlY);
            ctx.fillText(`Power: ${Math.floor(player.power)}`, canvas.width - 10 * viewScale, controlY + 20 * viewScale);
            ctx.fillText(`Snow: ${player.snowWeight}/${player.maxSnow}`, canvas.width - 10 * viewScale, controlY + 40 * viewScale);
        }
        
        // Back button
        const buttonWidth = 100 * viewScale;
        const buttonHeight = 30 * viewScale;
        const buttonX = canvas.width - buttonWidth - 10 * viewScale;
        const buttonY = 10 * viewScale;
        
        ctx.fillStyle = '#FF6B6B';
        ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `${Math.floor(14 * viewScale)}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText('Back', buttonX + buttonWidth / 2, buttonY + buttonHeight / 2 + 5 * viewScale);
    }

    renderGameOver(ctx, canvas, viewScale) {
        // Semi-transparent overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Game Over text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `${Math.floor(36 * viewScale)}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 60 * viewScale);
        
        // Winner text
        if (this.winner) {
            ctx.font = `${Math.floor(24 * viewScale)}px Arial`;
            ctx.fillText(`${this.winner.name} Wins!`, canvas.width / 2, canvas.height / 2 - 20 * viewScale);
        } else {
            ctx.font = `${Math.floor(24 * viewScale)}px Arial`;
            ctx.fillText('It\'s a Tie!', canvas.width / 2, canvas.height / 2 - 20 * viewScale);
        }
        
        // Buttons
        const buttonWidth = 150 * viewScale;
        const buttonHeight = 40 * viewScale;
        const spacing = 20 * viewScale;
        
        // Play Again button
        const playAgainX = canvas.width / 2 - buttonWidth - spacing / 2;
        const buttonY = canvas.height / 2 + 20 * viewScale;
        
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(playAgainX, buttonY, buttonWidth, buttonHeight);
        
        // Back to Lobby button
        const lobbyX = canvas.width / 2 + spacing / 2;
        ctx.fillStyle = '#FF6B6B';
        ctx.fillRect(lobbyX, buttonY, buttonWidth, buttonHeight);
        
        // Button text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `${Math.floor(16 * viewScale)}px Arial`;
        ctx.fillText('Play Again', playAgainX + buttonWidth / 2, buttonY + buttonHeight / 2 + 6 * viewScale);
        ctx.fillText('Back to Lobby', lobbyX + buttonWidth / 2, buttonY + buttonHeight / 2 + 6 * viewScale);
    }

    renderSimpleExplosion(ctx, explosion, x, y, viewScale) {
        const alpha = explosion.life ? explosion.life / explosion.maxLife : 0.5;
        const size = explosion.life ? (explosion.maxLife - explosion.life) * 3 * viewScale : 20 * viewScale;
        
        ctx.fillStyle = `rgba(255, 100, 100, ${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }

    handleMouseMove(x, y, canvas, viewScale) {
        this.mouseX = x / viewScale;
        this.mouseY = y / viewScale;
        
        const player = this.players[this.currentPlayer];
        if (!player.isStunned && this.gameState === 'playing') {
            // Calculate angle from cannon to mouse
            const dx = Math.abs(this.mouseX - player.cannonX);
            const dy = Math.abs(this.mouseY - player.cannonY);
            
            if (dx > 0 && this.mouseY <= player.cannonY) {
                let angle = Math.atan(dy / dx) * 180 / Math.PI;
                
                // Constrain angle based on player side
                if (player.side === 'left' && this.mouseX >= player.cannonX ||
                    player.side === 'right' && this.mouseX <= player.cannonX) {
                    player.angle = Math.max(0, Math.min(90, angle));
                    
                    // Trigger angle animation when aiming
                    if (player.animation.currentState === 'idle') {
                        this.setPlayerAnimation(player, 'angle');
                    }
                }
            } else {
                // Return to idle when not aiming properly
                if (player.animation.currentState === 'angle') {
                    this.setPlayerAnimation(player, 'idle');
                }
            }
        }
    }

    handleMouseDown(x, y, canvas, viewScale) {
        this.leftMouseDown = true;
        
        if (this.gameState === 'gameOver') {
            this.handleGameOverClick(x, y, canvas, viewScale);
            return;
        }
        
        // Check back button
        const buttonWidth = 100 * viewScale;
        const buttonHeight = 30 * viewScale;
        const buttonX = canvas.width - buttonWidth - 10 * viewScale;
        const buttonY = 10 * viewScale;
        
        if (x >= buttonX && x <= buttonX + buttonWidth && 
            y >= buttonY && y <= buttonY + buttonHeight) {
            sceneManager.switchTo('Lobby');
            return;
        }
    }

    handleMouseUp(x, y, canvas, viewScale) {
        this.leftMouseDown = false;
    }

    handleGameOverClick(x, y, canvas, viewScale) {
        const buttonWidth = 150 * viewScale;
        const buttonHeight = 40 * viewScale;
        const spacing = 20 * viewScale;
        const buttonY = canvas.height / 2 + 20 * viewScale;
        
        const playAgainX = canvas.width / 2 - buttonWidth - spacing / 2;
        const lobbyX = canvas.width / 2 + spacing / 2;
        
        if (x >= playAgainX && x <= playAgainX + buttonWidth && 
            y >= buttonY && y <= buttonY + buttonHeight) {
            // Play Again
            this.gameState = 'playing';
            this.winner = null;
            this.initializePlayers();
            this.snowballs = [];
            this.explosions = [];
            this.glitter = [];
            this.generateObstacles();
        } else if (x >= lobbyX && x <= lobbyX + buttonWidth && 
                   y >= buttonY && y <= buttonY + buttonHeight) {
            // Back to Lobby
            sceneManager.switchTo('Lobby');
        }
    }

    handleKeyDown(key) {
        this.keys[key] = true;
        
        if (this.gameState !== 'playing') return;
        
        const player = this.players[this.currentPlayer];
        
        if (key === ' ' || key === 'Space') {
            // Start building power
            if (!player.isStunned && player.power < 50) {
                // Power builds over time - handled in power building logic
            }
        } else if (key === 'a' || key === 'A') {
            this.addSnow();
        }
    }

    handleKeyUp(key) {
        this.keys[key] = false;
        
        if (this.gameState !== 'playing') return;
        
        if (key === ' ' || key === 'Space') {
            // Fire when space is released
            this.fire();
        }
    }

    // Handle continuous key presses (like space for power)
    handleContinuousInput() {
        if (this.gameState !== 'playing') return;
        
        const player = this.players[this.currentPlayer];
        
        // Build power while space is held
        if ((this.keys[' '] || this.keys['Space']) && !player.isStunned) {
            player.power = Math.min(50, player.power + 0.5);
        }
    }

    onExit() {
        console.log('Exited LocalGame scene');
        // Clean up any intervals or listeners if needed
    }

    // Check if player is near a snowpile
    getNearbySnowpile(player) {
        const proximityDistance = 50; // Pixels - adjust as needed
        
        for (let snowpile of this.terrain.snowpiles) {
            const dx = player.x - snowpile.x;
            const dy = player.y - snowpile.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= proximityDistance && snowpile.currentSnow > 0) {
                return snowpile;
            }
        }
        return null;
    }
    
    // Collect snow from a snowpile
    collectSnowFromPile(player, snowpile) {
        if (snowpile.currentSnow > 0 && player.snowWeight < player.maxSnow) {
            // Remove snow from pile
            snowpile.currentSnow--;
            
            // Add snow to player
            player.snowWeight++;
            
            // Update snowpile animation
            if (snowpile.animator) {
                snowpile.animator.updateSnowLevel(snowpile.currentSnow, snowpile.maxSnow);
                snowpile.frame = snowpile.animator.getCurrentFrame();
                
                // Play depleting animation if pile is getting low
                if (snowpile.currentSnow <= snowpile.maxSnow * 0.2) {
                    snowpile.animator.playDepletingAnimation();
                }
            }
            
            return true;
        }
        return false;
    }
}
