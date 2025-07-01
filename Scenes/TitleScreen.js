// TitleScreen Scene
class TitleScreen extends Scene {
    create() {
        // Add background
        this.sceneManager.createBackground('images/background.svg');
        
        // Add logos (from parent class)
        super.create();

        // Add title text
        this.sceneManager.createText(
            'Monkey Snow Fight',
            gameWidth * viewScale / 2,
            gameHeight * viewScale / 2 - 50,
            {
                fontSize: '36px',
                fontWeight: 'bold',
                color: '#ffffff',
                stroke: true
            }
        );

        // Add play button
        this.sceneManager.createText(
            'Click to Enter Lobby',
            gameWidth * viewScale / 2,
            gameHeight * viewScale / 2 + 50,
            {
                fontSize: '24px',
                color: '#4CAF50',
                stroke: true,
                interactive: true,
                onClick: () => {
                    gameManager.startScene('lobby');
                }
            }
        );
    }
}
