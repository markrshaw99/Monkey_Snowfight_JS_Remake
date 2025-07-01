// Initialize all scenes and start the game
document.addEventListener('DOMContentLoaded', () => {
    // Register all scenes
    gameManager.registerScene('lobby', Lobby);
    gameManager.registerScene('localGame', LocalGame);
    gameManager.registerScene('onlineMultiplayer', OnlineMultiplayer);

    // Start directly in the lobby (no title screen)
    gameManager.startScene('lobby');
});
