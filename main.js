// Canvas-based Scene Manager for Monkey Snow Fight
class SceneManager {
    constructor() {
        this.currentScene = null;
        this.scenes = {};
        this.canvas = null;
        this.ctx = null;
        this.images = {}; // Cache for loaded images
        this.fontsLoaded = false;
        this.init();
        this.loadCustomFonts(); // Load fonts when SceneManager is created
    }

    init() {
        // Get canvas element and set size
        this.canvas = document.getElementById('gameCanvas');
        this.canvas.width = gameWidth * viewScale;
        this.canvas.height = gameHeight * viewScale;
        
        this.ctx = this.canvas.getContext('2d');
        
        // Set up canvas for crisp pixel art
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.webkitImageSmoothingEnabled = false;
        this.ctx.mozImageSmoothingEnabled = false;
        this.ctx.msImageSmoothingEnabled = false;
        
        // Set up click handling
        this.setupClickHandling();
        
        // Start render loop
        this.startRenderLoop();
    }

    startRenderLoop() {
        let lastTime = 0;
        const render = (currentTime) => {
            const deltaTime = currentTime - lastTime;
            lastTime = currentTime;
            
            // Update game logic
            if (this.currentScene && this.currentScene.update) {
                this.currentScene.update(deltaTime);
            }
            
            // Clear canvas
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Draw current scene if it exists
            if (this.currentScene && this.currentScene.render) {
                this.currentScene.render(this.ctx, this.canvas, viewScale);
            }
            
            requestAnimationFrame(render);
        };
        render(0);
    }

    registerScene(name, sceneClass) {
        this.scenes[name] = sceneClass;
    }

    switchTo(sceneName, data = {}) {
        // Alias for startScene for backwards compatibility
        this.startScene(sceneName, data);
    }

    startScene(name, data = {}) {
        // Clean up current scene
        if (this.currentScene && this.currentScene.destroy) {
            this.currentScene.destroy();
        }
        
        // Call onExit if it exists
        if (this.currentScene && this.currentScene.onExit) {
            this.currentScene.onExit();
        }

        // Start new scene
        if (this.scenes[name]) {
            this.currentScene = new this.scenes[name](this, data);
            if (this.currentScene.create) {
                this.currentScene.create();
            }
            if (this.currentScene.onEnter) {
                this.currentScene.onEnter();
            }
        }
    }

    // Load and cache images
    async loadImage(imagePath) {
        if (this.images[imagePath]) {
            return this.images[imagePath];
        }

        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.images[imagePath] = img;
                resolve(img);
            };
            img.onerror = reject;
            img.src = imagePath;
        });
    }

    // Canvas drawing methods
    drawImage(imagePath, x, y, width, height) {
        const img = this.images[imagePath];
        if (img) {
            this.ctx.drawImage(img, x, y, width, height);
        }
    }

    drawImageCentered(imagePath, x, y, width, height) {
        const img = this.images[imagePath];
        if (img) {
            this.ctx.drawImage(img, x - width/2, y, width, height);
        }
    }

    drawBackground(imagePath) {
        const img = this.images[imagePath];
        if (img) {
            this.canvas.style.shapeRendering = 'crispEdges';
            this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
        }
    }

    // Canvas-based Snowfall system using original game assets and exact Flash logic
    async createSnowfall() {
        // Load snowflake image first
        await this.loadImage('images/snowflake_1.png');
        
        // Original Flash parameters from frame_37/PlaceObject2_567_259
        this.snowFlakes = 5;
        this.stageWidth = 600;
        this.stageHeight = 400;
        this.snowSpeed = 0.08;
        this.snowDistance = 16;
        
        this.snowfallArray = [];
        this.snowfallActive = true;
        
        // Create initial snowflakes
        for (let i = 0; i < this.snowFlakes; i++) {
            this.createFlake(i);
        }
    }

    createFlake(i) {
        // Original Flash makeFlake function logic
        const x = Math.random() * this.stageWidth;
        const y = Math.random() * (this.stageHeight * 2) - (this.stageHeight * 2);
        const size = Math.random() * 50 + 50; // 50-100%
        
        // Store snowflake data with Flash properties
        const flakeData = {
            x: x,
            y: y,
            size: size,
            originalPosition: x,
            vin: x + Math.random() * 10 - 5,
            snowSpeed: this.snowSpeed * ((Math.random() * 100 - 50) / 80),
            fallSpeed: Math.random() * (this.snowSpeed * 15) + 1
        };
        
        this.snowfallArray[i] = flakeData;
    }

    updateSnowfall() {
        if (!this.snowfallActive) return;
        
        // Original Flash frame_3 animation logic - CORRECTED
        for (let i = 0; i < this.snowFlakes; i++) {
            const flake = this.snowfallArray[i];
            if (!flake) continue;
            
            // Flash logic: 
            // temp_y = sin(vin) * snowDistance + originalPosition
            // _x = snowDistance + temp_y  (horizontal sway)
            // _y += fallSpeed             (vertical fall)
            // vin += snowSpeed            (increment sine wave)
            
            const temp_y = Math.sin(flake.vin) * this.snowDistance + flake.originalPosition;
            flake.x = this.snowDistance + temp_y;  // Horizontal position with sway
            flake.y += flake.fallSpeed;            // Vertical position - steady fall
            flake.vin += flake.snowSpeed;          // Increment sine wave counter
            
            // Reset flake if it falls off screen
            if (flake.y > this.stageHeight + 10) {
                // Reset using makeFlake logic
                flake.x = Math.random() * this.stageWidth;
                flake.y = Math.random() * (this.stageHeight * 2) - (this.stageHeight * 2);
                flake.size = Math.random() * 50 + 50;
                flake.originalPosition = flake.x;
                flake.vin = flake.x + Math.random() * 10 - 5;
                flake.snowSpeed = this.snowSpeed * ((Math.random() * 100 - 50) / 80);
                flake.fallSpeed = Math.random() * (this.snowSpeed * 15) + 1;
            }
        }
    }

    renderSnowfall() {
        if (!this.snowfallActive || !this.snowfallArray) return;
        
        const snowImg = this.images['images/snowflake_1.png'];
        if (!snowImg) return;
        
        this.ctx.globalAlpha = 0.8;
        
        for (let i = 0; i < this.snowFlakes; i++) {
            const flake = this.snowfallArray[i];
            if (!flake) continue;
            
            const size = (flake.size/100) * 20 * viewScale;
            this.ctx.drawImage(
                snowImg,
                flake.x * viewScale - size/2,
                flake.y * viewScale - size/2,
                size,
                size
            );
        }
        
        this.ctx.globalAlpha = 1.0;
    }

    stopSnowfall() {
        this.snowfallActive = false;
        this.snowfallArray = [];
    }

    // Canvas drawing methods for UI elements
    drawButton(text, x, y, width, height, style = {}) {
        const defaultStyle = {
            backgroundColor: '#FF6B35',
            color: 'white',
            borderColor: '#FF8C42',
            borderWidth: 2,
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 'bold',
            fontFamily: 'Arial, sans-serif',
            ...style
        };
        
        // Draw button background
        this.ctx.fillStyle = defaultStyle.backgroundColor;
        this.drawRoundedRect(x, y, width, height, defaultStyle.borderRadius);
        this.ctx.fill();
        
        // Draw button border
        this.ctx.strokeStyle = defaultStyle.borderColor;
        this.ctx.lineWidth = defaultStyle.borderWidth;
        this.drawRoundedRect(x, y, width, height, defaultStyle.borderRadius);
        this.ctx.stroke();
        
        // Draw button text
        this.ctx.fillStyle = defaultStyle.color;
        this.ctx.font = `${defaultStyle.fontWeight} ${defaultStyle.fontSize}px ${defaultStyle.fontFamily}`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(text, x + width/2, y + height/2);
        
        return { x, y, width, height }; // Return bounds for click detection
    }

    drawPanel(x, y, width, height, style = {}) {
        const defaultStyle = {
            backgroundColor: 'rgb(255, 255, 255)',
            borderColor: 'rgb(175, 220, 230)',
            borderWidth: 4,
            borderRadius: 12,
            insetBorder: false,
            insetColors: ['rgb(255, 255, 255)', 'rgb(175, 220, 230)'],
            insetWidths: [4, 7],
            ...style
        };
        
        // Draw panel background
        this.ctx.fillStyle = defaultStyle.backgroundColor;
        this.drawRoundedRect(x, y, width, height, defaultStyle.borderRadius);
        this.ctx.fill();
        
        // Draw inset borders if specified
        if (defaultStyle.insetBorder && defaultStyle.insetColors && defaultStyle.insetWidths) {
            for (let i = defaultStyle.insetColors.length - 1; i >= 0; i--) {
                const insetWidth = defaultStyle.insetWidths[i];
                const insetColor = defaultStyle.insetColors[i];
                
                this.ctx.strokeStyle = insetColor;
                this.ctx.lineWidth = insetWidth;
                this.drawRoundedRect(
                    x + (insetWidth / 2), 
                    y + (insetWidth / 2), 
                    width - insetWidth, 
                    height - insetWidth, 
                    defaultStyle.borderRadius
                );
                this.ctx.stroke();
            }
        } else if (defaultStyle.borderWidth > 0) {
            // Draw regular border
            this.ctx.strokeStyle = defaultStyle.borderColor;
            this.ctx.lineWidth = defaultStyle.borderWidth;
            this.drawRoundedRect(x, y, width, height, defaultStyle.borderRadius);
            this.ctx.stroke();
        }
    }

    drawText(text, x, y, style = {}) {
        const defaultStyle = {
            color: 'rgb(38, 87, 136)',
            fontSize: 10,
            fontFamily: "'Trade Gothic Bold', sans-serif",
            fontWeight: 'normal',
            textAlign: 'left',
            textBaseline: 'top',
            ...style
        };
        
        this.ctx.fillStyle = defaultStyle.color;
        this.ctx.font = `${defaultStyle.fontWeight} ${defaultStyle.fontSize}px ${defaultStyle.fontFamily}`;
        this.ctx.textAlign = defaultStyle.textAlign;
        this.ctx.textBaseline = defaultStyle.textBaseline;
        this.ctx.fillText(text, x, y);
    }

    // Helper method to draw rounded rectangles
    drawRoundedRect(x, y, width, height, radius) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();
    }

    // Load custom fonts from assets
    loadCustomFonts() {
        const fontFaces = [
            { name: 'Distant Galaxy', file: 'assets/Fonts/262_Distant Galaxy.ttf' },
            { name: 'Trade Gothic Bold', file: 'assets/Fonts/2_TradeGothic Bold.ttf' },
            { name: 'Sans 12pt', file: 'assets/Fonts/66__sans_12pt_st.ttf' },
            { name: 'VAG Rounded', file: 'assets/Fonts/79_VAGRounded BT.ttf' }
        ];

        const fontPromises = fontFaces.map(font => {
            const fontFace = new FontFace(font.name, `url("${font.file}")`);
            return fontFace.load().then(loadedFont => {
                document.fonts.add(loadedFont);
                console.log(`Font ${font.name} loaded successfully`);
                return loadedFont;
            }).catch(error => {
                console.error(`Failed to load font ${font.name}:`, error);
            });
        });

        Promise.all(fontPromises).then(() => {
            this.fontsLoaded = true;
        });
    }

    // Add click handling for canvas
    setupClickHandling() {
        // Mouse click events
        this.canvas.addEventListener('click', (event) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            const viewScale = Math.min(this.canvas.width / 600, this.canvas.height / 400);
            
            if (this.currentScene && this.currentScene.handleClick) {
                this.currentScene.handleClick(x, y);
            }
            
            // Also handle mouseDown for LocalGame compatibilitybackground
            if (this.currentScene && this.currentScene.handleMouseDown) {
                this.currentScene.handleMouseDown(x, y, this.canvas, viewScale);
            }
        });

        // Mouse down events
        this.canvas.addEventListener('mousedown', (event) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            const viewScale = Math.min(this.canvas.width / 600, this.canvas.height / 400);
            
            if (this.currentScene && this.currentScene.handleMouseDown) {
                this.currentScene.handleMouseDown(x, y, this.canvas, viewScale);
            }
        });

        // Mouse up events  
        this.canvas.addEventListener('mouseup', (event) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            const viewScale = Math.min(this.canvas.width / 600, this.canvas.height / 400);
            
            if (this.currentScene && this.currentScene.handleMouseUp) {
                this.currentScene.handleMouseUp(x, y, this.canvas, viewScale);
            }
        });

        // Add wheel event handling for scrolling
        this.canvas.addEventListener('wheel', (event) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            
            if (this.currentScene && this.currentScene.handleWheel) {
                event.preventDefault(); // Prevent page scrolling
                this.currentScene.handleWheel(x, y, event.deltaY);
            }
        });

        // Add mouse move event handling for hover effects
        this.canvas.addEventListener('mousemove', (event) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            
            if (this.currentScene && this.currentScene.handleMouseMove) {
                this.currentScene.handleMouseMove(x, y, this.canvas, viewScale);
            }
        });

        // Add keyboard event handling
        document.addEventListener('keydown', (event) => {
            if (this.currentScene && this.currentScene.handleKeyDown) {
                this.currentScene.handleKeyDown(event.key);
            }
        });

        document.addEventListener('keyup', (event) => {
            if (this.currentScene && this.currentScene.handleKeyUp) {
                this.currentScene.handleKeyUp(event.key);
            }
        });
    }
}

// Base Scene class for canvas rendering
class Scene {
    constructor(sceneManager, data = {}) {
        this.sceneManager = sceneManager;
        this.data = data;
        this.buttons = []; // Store button bounds for click detection
    }

    create() {
        // Override in subclasses
    }

    render(ctx) {
        // Override in subclasses
        // This is called every frame to draw the scene
    }

    update() {
        // Override in subclasses for game logic updates
        if (this.sceneManager.snowfallActive) {
            this.sceneManager.updateSnowfall();
        }
    }

    handleClick(x, y) {
        // Override in subclasses for click handling
        // Check if click is within any button bounds
        for (let button of this.buttons) {
            if (x >= button.x && x <= button.x + button.width &&
                y >= button.y && y <= button.y + button.height) {
                if (button.onClick) {
                    button.onClick();
                }
            }
        }
    }

    destroy() {
        // Override in subclasses for cleanup
        this.buttons = [];
    }
}

// Initialize the game
// Global instances
const gameManager = new SceneManager();
const sceneManager = gameManager; // Alias for compatibility