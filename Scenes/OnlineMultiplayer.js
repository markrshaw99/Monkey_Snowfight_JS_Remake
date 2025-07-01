// Canvas-based Online Multiplayer Scene
class OnlineMultiplayer extends Scene {
    async create() {
        // Load background image
        await this.sceneManager.loadImage('images/Background.svg');
        
        // Set up back button for click handling
        this.setupButtons();
    }

    setupButtons() {
        this.buttons = [
            {
                x: (gameWidth * viewScale / 2) - 75,
                y: (gameHeight * viewScale / 2) + 80,
                width: 150,
                height: 40,
                text: "Back to Lobby",
                onClick: () => this.sceneManager.startScene('lobby')
            }
        ];
    }

    render(ctx) {
        // Draw background
        this.sceneManager.drawBackground('images/Background.svg');
        
        // Draw title
        this.sceneManager.drawText(
            'Online Multiplayer Mode',
            gameWidth * viewScale / 2,
            gameHeight * viewScale / 2,
            {
                fontSize: 32 * viewScale,
                color: '#ffffff',
                textAlign: 'center',
                textBaseline: 'middle'
            }
        );

        // Draw buttons
        for (let button of this.buttons) {
            this.sceneManager.drawButton(
                button.text,
                button.x,
                button.y,
                button.width,
                button.height
            );
        }
    }
}
