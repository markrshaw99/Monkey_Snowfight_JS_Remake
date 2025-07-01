// Simple Scene Manager for Monkey Snow Fight
class SceneManager {
    constructor() {
        this.currentScene = null;
        this.scenes = {};
        this.gameContainer = null;
        this.init();
        this.loadCustomFonts(); // Load fonts when SceneManager is created
    }

    init() {
        // Create game container
        this.gameContainer = document.createElement('div');
        this.gameContainer.id = 'game-container';
        this.gameContainer.style.cssText = `
            position: relative;
            width: ${gameWidth * viewScale}px;
            height: ${gameHeight * viewScale}px;
            margin: 0 auto;
            background: #2c3e50;
            overflow: hidden;
        `;
        document.body.appendChild(this.gameContainer);
    }

    registerScene(name, sceneClass) {
        this.scenes[name] = sceneClass;
    }

    startScene(name, data = {}) {
        // Clear container
        this.gameContainer.innerHTML = '';

        // Start new scene
        if (this.scenes[name]) {
            this.currentScene = new this.scenes[name](this, data);
            this.currentScene.create();
        }
    }

    createImage(imagePath, x, y, width, height) {
        const imgElement = document.createElement('img');
        imgElement.src = imagePath;
        imgElement.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            width: ${width}px;
            height: ${height}px;
            z-index: 5;
        `;
        this.gameContainer.appendChild(imgElement);
        return imgElement;
    }

    createImageCentered(imagePath, x, y, width, height) {
        const imgElement = document.createElement('img');
        imgElement.src = imagePath;
        imgElement.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            width: ${width}px;
            height: ${height}px;
            transform: translate(-50%, 0%);
            z-index: 5;
        `;
        this.gameContainer.appendChild(imgElement);
        return imgElement;
    }

    createBackground(imagePath) {
        const bgElement = document.createElement('div');
        bgElement.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 0;
        `;
        
        // Load SVG content and insert inline
        fetch(imagePath)
            .then(response => response.text())
            .then(svgContent => {
                bgElement.innerHTML = svgContent;
                const svgElement = bgElement.querySelector('svg');
                if (svgElement) {
                    // Configure SVG for proper scaling
                    svgElement.removeAttribute('width');
                    svgElement.removeAttribute('height');
                    svgElement.style.cssText = `
                        width: 100%;
                        height: 100%;
                        shape-rendering: crispEdges;
                    `;
                    
                    svgElement.setAttribute('viewBox', '0 0 612.15 412.1');
                    svgElement.setAttribute('preserveAspectRatio', 'none');
                }
            })
            .catch(error => {
                console.error('Error loading SVG:', error);
            });

        this.gameContainer.appendChild(bgElement);
        return bgElement;
    }

    // Snowfall system using original game assets and exact Flash logic
    createSnowfall() {
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
        
        // Start animation loop
        this.animateSnowfall();
    }

    createFlake(i) {
        // Original Flash makeFlake function logic
        const snowflake = document.createElement('img');
        snowflake.src = 'images/snowflake_1.png'; // Using frame 1 as base
        
        // Random starting position and properties (matching Flash logic)
        const x = Math.random() * this.stageWidth;
        const y = Math.random() * (this.stageHeight * 2) - (this.stageHeight * 2);
        const size = Math.random() * 50 + 50; // 50-100%
        
        snowflake.style.cssText = `
            position: absolute;
            left: ${x * viewScale}px;
            top: ${y * viewScale}px;
            width: ${(size/100) * 20 * viewScale}px;
            height: ${(size/100) * 20 * viewScale}px;
            z-index: 1;
            pointer-events: none;
            opacity: 0.8;
        `;
        
        this.gameContainer.appendChild(snowflake);
        
        // Store snowflake data with Flash properties
        const flakeData = {
            element: snowflake,
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

    animateSnowfall() {
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
            
            // Update DOM element position
            flake.element.style.left = (flake.x * viewScale) + 'px';
            flake.element.style.top = (flake.y * viewScale) + 'px';
            
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
                
                // Update size
                const newSize = (flake.size/100) * 20 * viewScale;
                flake.element.style.width = newSize + 'px';
                flake.element.style.height = newSize + 'px';
            }
        }
        
        // Continue animation (equivalent to Flash's gotoAndPlay)
        requestAnimationFrame(() => this.animateSnowfall());
    }

    stopSnowfall() {
        this.snowfallActive = false;
        
        // Remove all snowflakes
        if (this.snowfallArray) {
            this.snowfallArray.forEach(flake => {
                if (flake && flake.element) {
                    flake.element.remove();
                }
            });
            this.snowfallArray = [];
        }
    }

    createButton(text, x, y, width, height, onClick, style = {}) {
        const button = document.createElement('button');
        button.textContent = text;
        
        const defaultStyle = {
            backgroundColor: '#FF6B35',
            color: 'white',
            border: '2px solid #FF8C42',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontFamily: 'Arial, sans-serif',
            ...style
        };
        
        button.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            width: ${width}px;
            height: ${height}px;
            background-color: ${defaultStyle.backgroundColor};
            color: ${defaultStyle.color};
            border: ${defaultStyle.border};
            border-radius: ${defaultStyle.borderRadius};
            font-size: ${defaultStyle.fontSize};
            font-weight: ${defaultStyle.fontWeight};
            cursor: ${defaultStyle.cursor};
            font-family: ${defaultStyle.fontFamily};
            z-index: 10;
            transition: all 0.2s ease;
        `;
        
        // Hover effects
        button.addEventListener('mouseenter', () => {
            button.style.backgroundColor = '#FF8C42';
            button.style.transform = 'scale(1.05)';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.backgroundColor = defaultStyle.backgroundColor;
            button.style.transform = 'scale(1.0)';
        });
        
        button.addEventListener('click', onClick);
        
        this.gameContainer.appendChild(button);
        return button;
    }

    createPanel(x, y, width, height, style = {}) {
        const panel = document.createElement('div');
        
        const defaultStyle = {
            ...style
        };
        
        panel.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            width: ${width}px;
            height: ${height}px;
            background-color: ${defaultStyle.backgroundColor};
            border: ${defaultStyle.border};
            border-radius: ${defaultStyle.borderRadius};
            box-shadow: ${defaultStyle.boxShadow};
            z-index: 3;
        `;
        
        this.gameContainer.appendChild(panel);
        return panel;
    }

    createText(text, x, y, style = {}) {
        const textElement = document.createElement('div');
        textElement.textContent = text;
        
        const defaultStyle = {
            color: 'rgb(38, 87, 136)', // Dark slate gray
            fontSize: '18px',
            fontWeight: 'bold',
            fontFamily: "'Trade Gothic Bold', sans-serif", // Corrected font name and added fallback
            textAlign: 'left',
            ...style
        };
        
        textElement.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            color: ${defaultStyle.color}; // Use the variable, not a hardcoded string
            font-size: ${defaultStyle.fontSize};
            font-weight: ${defaultStyle.fontWeight};
            font-family: ${defaultStyle.fontFamily};
            text-align: ${defaultStyle.textAlign};
            z-index: 5;
            pointer-events: none;
        `;
        
        this.gameContainer.appendChild(textElement);
        return textElement;
    }

    // Load custom fonts from assets
    loadCustomFonts() {
        const fontFaces = [
            { name: 'Distant Galaxy', file: 'assets/Fonts/262_Distant Galaxy.ttf' },
            { name: 'Trade Gothic Bold', file: 'assets/Fonts/2_TradeGothic Bold.ttf' },
            { name: 'Sans 12pt', file: 'assets/Fonts/66__sans_12pt_st.ttf' },
            { name: 'VAG Rounded', file: 'assets/Fonts/79_VAGRounded BT.ttf' }
        ];

        fontFaces.forEach(font => {
            const fontFace = new FontFace(font.name, `url("${font.file}")`);
            fontFace.load().then(loadedFont => {
                document.fonts.add(loadedFont);
                console.log(`Font ${font.name} loaded successfully`);
            }).catch(error => {
                console.error(`Failed to load font ${font.name}:`, error);
            });
        });
    }
}

// Base Scene class
class Scene {
    constructor(sceneManager, data = {}) {
        this.sceneManager = sceneManager;
        this.data = data;
    }

    create() {
        // Override in subclasses
    }
}

// Initialize the game
const gameManager = new SceneManager();