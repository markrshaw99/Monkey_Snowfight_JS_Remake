// AssetLoader.js - Handles loading and managing sprite assets
class AssetLoader {
    constructor() {
        this.assets = {
            cannon: {
                frames: [],
                loaded: false,
                totalFrames: 91
            },
            explosion: {
                frames: [],
                loaded: false,
                totalFrames: 13
            },
            ball: {
                frames: [],
                loaded: false,
                totalFrames: 19
            },
            obstacle: {
                frames: [],
                loaded: false,
                totalFrames: 5
            },
            snowpile: {
                frames: [],
                loaded: false,
                totalFrames: 92
            }
        };
        this.loadPromises = [];
    }

    async loadAllAssets() {
        console.log('Starting to load assets...');
        
        // Load cannon frames (1-91)
        this.loadPromises.push(this.loadSpriteFrames('cannon', 'Decompiled Flash Version/sprites/DefineSprite_411_mcCannon', 91));
        
        // Load explosion frames (1-13)
        this.loadPromises.push(this.loadSpriteFrames('explosion', 'Decompiled Flash Version/sprites/DefineSprite_556_mcExplosion', 13));
        
        // Load ball frames (1-19)
        this.loadPromises.push(this.loadSpriteFrames('ball', 'Decompiled Flash Version/sprites/DefineSprite_495_mcBall', 19));

        // Load obstacle frames (1-5)
        this.loadPromises.push(this.loadSpriteFrames('obstacle', 'Decompiled Flash Version/sprites/DefineSprite_548_mcObstacle', 5));
        
        // Load snowpile frames (1-92)
        this.loadPromises.push(this.loadSpriteFrames('snowpile', 'Decompiled Flash Version/sprites/DefineSprite_519_mcSnowpile', 92));

        try {
            await Promise.all(this.loadPromises);
            console.log('All assets loaded successfully!');
            return true;
        } catch (error) {
            console.error('Error loading assets:', error);
            return false;
        }
    }

    async loadSpriteFrames(assetName, basePath, frameCount) {
        const asset = this.assets[assetName];
        const loadPromises = [];

        console.log(`Loading ${frameCount} frames for ${assetName} from ${basePath}`);

        for (let i = 1; i <= frameCount; i++) {
            const img = new Image();
            const promise = new Promise((resolve, reject) => {
                img.onload = () => {
                    asset.frames[i - 1] = img;
                    console.log(`Loaded ${assetName} frame ${i}`);
                    resolve();
                };
                img.onerror = () => {
                    console.warn(`Failed to load ${assetName} frame ${i} from ${basePath}/${i}.png, using placeholder`);
                    // Create a placeholder colored rectangle
                    const canvas = document.createElement('canvas');
                    canvas.width = 100;
                    canvas.height = 100;
                    const ctx = canvas.getContext('2d');
                    ctx.fillStyle = assetName === 'cannon' ? '#8B4513' : (assetName === 'explosion' ? '#FF6600' : '#FFFFFF');
                    ctx.fillRect(0, 0, 100, 100);
                    
                    // Add some visual distinction for placeholders
                    ctx.fillStyle = '#000000';
                    ctx.font = '12px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText(assetName, 50, 40);
                    ctx.fillText(`${i}`, 50, 55);
                    
                    asset.frames[i - 1] = canvas;
                    resolve();
                };
            });
            
            img.src = `${basePath}/${i}.png`;
            loadPromises.push(promise);
        }

        await Promise.all(loadPromises);
        asset.loaded = true;
        console.log(`${assetName} frames loaded: ${asset.frames.length}`);
    }

    getCannonFrame(angle) {
        if (!this.assets.cannon.loaded) return null;
        
        // Convert angle to frame index
        // Original game uses startAngle = 45, and we have 91 frames
        // Assuming frames cover angles from 0 to 90 degrees
        const frameIndex = Math.floor((angle / 90) * (this.assets.cannon.totalFrames - 1));
        return this.assets.cannon.frames[Math.max(0, Math.min(frameIndex, this.assets.cannon.totalFrames - 1))];
    }

    getExplosionFrame(frameIndex) {
        if (!this.assets.explosion.loaded) return null;
        const index = Math.max(0, Math.min(frameIndex, this.assets.explosion.totalFrames - 1));
        return this.assets.explosion.frames[index];
    }

    getBallFrame(frameIndex) {
        if (!this.assets.ball.loaded) return null;
        const index = Math.max(0, Math.min(frameIndex, this.assets.ball.totalFrames - 1));
        return this.assets.ball.frames[index];
    }

    getObstacleFrame(frameIndex) {
        if (!this.assets.obstacle.loaded) return null;
        const index = Math.max(0, Math.min(frameIndex, this.assets.obstacle.totalFrames - 1));
        return this.assets.obstacle.frames[index];
    }

    getSnowpileFrame(frameIndex) {
        if (!this.assets.snowpile.loaded) return null;
        const index = Math.max(0, Math.min(frameIndex, this.assets.snowpile.totalFrames - 1));
        return this.assets.snowpile.frames[index];
    }

    isLoaded() {
        return Object.values(this.assets).every(asset => asset.loaded);
    }
}

// Create global asset loader instance
window.assetLoader = new AssetLoader();
