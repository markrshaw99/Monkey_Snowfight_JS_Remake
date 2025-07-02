MiniclipGameEvent("StartPenaliseQuitting");
clearInterval(ivCheckObstacle);
localMonkey.cannon.mcAddSnow.gotoAndStop(1);
obstacleAlreadyMade = false;
gameStarted = true;
if(localMonkey.toTheLeft)
{
   mcTerrain.mcSnowpile1.mcBonusPipe.play();
}
else
{
   mcTerrain.mcSnowpile0.mcBonusPipe.play();
}
Key.addListener(listenerChat);
intervalGameActions = setInterval(doGameActions,31);
stop();
