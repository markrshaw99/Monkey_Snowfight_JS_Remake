// Lobby Scene - The main game lobby with logos positioned exactly as in Flash
class Lobby extends Scene {
    create() {
        // Add background if you have one
        // this.sceneManager.createBackground('images/lobby-bg.svg');
        this.sceneManager.createBackground('images/Background.svg');
        
        // Start snowfall animation using original game assets
        this.sceneManager.createSnowfall();
        
        // Add logos (full size, only in lobby)
        this.addLogos();
        // Add lobby content
        this.addLobbyContent();
    }
    // Miniclip Title and Monkey Snowfight Logos
    addLogos() {
        // Miniclip logo (characterId=570, depth=263)
        // Flash data: translateX=5988, translateY=534, scaleX=0.4567566, scaleY=0.4567566
        // SVG natural size: 297.1 × 52.4px
        // Flash coordinates: 5988/20 = 299.4, 534/20 = 26.7
        const miniclipScale = 0.4567566;
        const miniclipX = 299.4 * viewScale;
        const miniclipY = 15 * viewScale;
        
        const miniclipLogo = this.sceneManager.createImageCentered(
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
        
        this.sceneManager.createImageCentered(
            'images/Title.svg',
            titleX,
            titleY,
            306.95 * 1.0359192 * viewScale, // Natural width * Flash scale * viewScale
            30.45 * 1.0359192 * viewScale   // Natural height * Flash scale * viewScale
        );
    }
    // Template for panels
    addLobbyContent() {
        // First, add the original lobby template to see it underneath
        this.sceneManager.createImageCentered(
            'images/LobbyTemplate.png',
            300 * viewScale,  // Center X
            93 * viewScale,  // Center Y 
            531 * viewScale,  // Width
            298 * viewScale   // Height
        );
        //Panels

        // Player info section (top left) - WITH inner border
        this.sceneManager.createPanel(
            34.5 * viewScale,
            93 * viewScale,
            388 * viewScale,
            56 * viewScale,
            { 
                backgroundColor: 'rgb(255, 255, 255)',
                border: '0px solidrgb(255, 255, 255)',
                borderRadius: '12px',
                boxShadow: 'inset 0 0 0 4px rgb(255, 255, 255), inset 0 0 0 7px rgb(175, 220, 230)'
            }
        );
        
        // Monkey Face Start
        this.sceneManager.createImage(
            'images/MonkeyFace.svg', // Using play button as placeholder avatar
            42 * viewScale,
            103 * viewScale,
            65 * viewScale,
            38 * viewScale
        );

        this.sceneManager.createImage(
            'images/Avatar/EyeWhites/12.svg', // Using play button as placeholder avatar
            60 * viewScale,
            110 * viewScale,
            23.5 * viewScale,
            11.5 * viewScale
        );

        this.sceneManager.createImage(
            'images/Avatar/EyeOutline/15.svg', // Using play button as placeholder avatar
            60 * viewScale,
            109 * viewScale,
            24.5 * viewScale,
            13.5 * viewScale
        );

        this.sceneManager.createImage(
            'images/Avatar/EyePupils/13.svg', // Using play button as placeholder avatar
            62 * viewScale,
            114 * viewScale,
            16 * viewScale,
            5 * viewScale
        );

        this.sceneManager.createImage(
            'images/Avatar/Mouths/5.svg', // Using play button as placeholder avatar
            65 * viewScale,
            132 * viewScale,
            14 * viewScale,
            3 * viewScale
        );
        // Monkey Face End

        // Player name and stats
        this.sceneManager.createText('Player Name', 120 * viewScale, 105 * viewScale, {
            fontSize: '18px',
            fontWeight: 'bold',
        });
        
        this.sceneManager.createText('★★★☆☆', 118 * viewScale, 114 * viewScale, {
            fontSize: '38px',
            fontWeight: 'normal', // Add this to prevent bolding issues with star characters
            color: 'rgb(55, 180, 255)' // Dark blue color
        });
        
        // Stats panel (top right) - WITH different inner border style
        this.sceneManager.createPanel(
            428 * viewScale,
            93 * viewScale,
            137 * viewScale,
            56 * viewScale,
            { 
                backgroundColor: 'rgb(255, 255, 255)',
                border: '0px dashedrgb(255, 255, 255)',
                borderRadius: '12px',
                boxShadow: 'inset 0 0 0 4px rgb(255, 255, 255), inset 0 0 0 7px rgb(175, 220, 230)'
            }
        );
        
        this.sceneManager.createText('Games won: 0', 320 * viewScale, 145 * viewScale);
        this.sceneManager.createText('Games lost: 0', 320 * viewScale, 165 * viewScale);
        this.sceneManager.createText('Rating: 1200', 430 * viewScale, 145 * viewScale);
        this.sceneManager.createText('Players Online: 42', 430 * viewScale, 165 * viewScale);
        
        // Game creation section - WITH partial inner border
        this.sceneManager.createPanel(
            34.5 * viewScale,
            155 * viewScale,
            531 * viewScale,
            235 * viewScale,
            { 
                backgroundColor: 'rgba(255, 255, 255, 0.88)',
                border: '0px solidrgb(255, 255, 255)',
                borderRadius: '12px',
                boxShadow: 'inset 0 0 0 4px rgb(255, 255, 255), inset 0 0 0 9px rgb(95, 185, 225)'
            }
        );
        
        // Game mode buttons
        this.sceneManager.createButton(
            'Local Game',
            80 * viewScale,
            260 * viewScale,
            120 * viewScale,
            40 * viewScale,
            () => {
                console.log('Starting local game...');
                this.sceneManager.startScene('localGame');
            }
        );
        
        this.sceneManager.createButton(
            'Practice',
            220 * viewScale,
            260 * viewScale,
            120 * viewScale,
            40 * viewScale,
            () => {
                console.log('Starting practice mode...');
                // Add practice mode logic here
            },
            { backgroundColor: '#10b981', border: '2px solid #059669' }
        );
        
        this.sceneManager.createButton(
            'Online Match',
            360 * viewScale,
            260 * viewScale,
            120 * viewScale,
            40 * viewScale,
            () => {
                console.log('Starting online match...');
                this.sceneManager.startScene('onlineMultiplayer');
            },
            { backgroundColor: '#3b82f6', border: '2px solid #2563eb' }
        );
        
    }
}