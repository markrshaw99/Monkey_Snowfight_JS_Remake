// Online Multiplayer Scene
class OnlineMultiplayer extends Scene {
    create() {
        // Add background
        this.sceneManager.createBackground('images/background.svg');
        
        // Add logos (from parent class)
        super.create();

        // Add title
        this.sceneManager.createText(
            'Online Multiplayer Mode',
            gameWidth * viewScale / 2,
            gameHeight * viewScale / 2,
            {
                fontSize: '32px',
                color: '#ffffff',
                stroke: true
            }
        );

        // Add back button
        this.sceneManager.createText(
            'Back to Lobby',
            gameWidth * viewScale / 2,
            gameHeight * viewScale / 2 + 100,
            {
                fontSize: '18px',
                color: '#FF9800',
                stroke: true,
                interactive: true,
                onClick: () => {
                    gameManager.startScene('lobby');
                }
            }
        );
    }
}
