// Initialize all scenes and start the game
document.addEventListener('DOMContentLoaded', () => {
    // Register all scenes
    gameManager.registerScene('lobby', Lobby);
    gameManager.registerScene('localGame', LocalGame);
    gameManager.registerScene('onlineMultiplayer', OnlineMultiplayer);

    // Start directly in the lobby (no title screen)
    gameManager.startScene('lobby');
    
    // Add quick test shortcut (press L to go directly to local game)
    document.addEventListener('keydown', (e) => {
        if (e.key.toLowerCase() === 'l' && gameManager.currentScene !== 'localGame') {
            console.log('Quick switch to Local Game (shortcut: L)');
            gameManager.startScene('localGame');
        }
    });
});
