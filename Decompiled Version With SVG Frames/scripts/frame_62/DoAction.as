function clearSnowBalls()
{
   if(arrSnowballs.length > 0)
   {
      var i = 0;
      while(i < arrSnowballs.length)
      {
         mcRemove = eval("mcBall" + arrSnowballs[i]);
         removeSnowball(mcRemove,false,i,true);
         mcRemove.removeMovieClip();
         i++;
      }
      this["mcSnowballExplode" + explodeNumber].removeMovieClip();
   }
}
function removeStuff()
{
   mcChallengeReceived.removeMovieClip();
   mcChallengeDeclined.removeMovieClip();
   mcChallengeSent.removeMovieClip();
   mcCannon0.removeMovieClip();
   mcCannon1.removeMovieClip();
   mcPlayAgain.removeMovieClip();
   clearSpeechBubbles();
}
function resetGame()
{
   localMonkey = new Object();
   remoteMonkey = new Object();
   mcChallengeReceived.removeMovieClip();
   mcChallengeDeclined.removeMovieClip();
   mcChallengeSent.removeMovieClip();
   mcPlayAgain.removeMovieClip();
   Key.removeListener(listenerChat);
   languageWarnings = 0;
   chatInitiated = false;
   conversationStarted = false;
   conversationStartedRemote = false;
   gameIsOver = false;
   receivedGameOver = false;
   localMonkey.cannon.mcAddSnow._visible = true;
   localMonkey.cannon.mcSetPower._visible = true;
   localMonkey.cannon.mcAngle._visible = true;
   localMonkey.cannon.mcSliderKnob._visible = true;
   mcEnergy0.gotoAndStop(1);
   mcEnergy1.gotoAndStop(1);
   opponentWantsToPlayAgain = false;
   localMonkey.snowballsFired = 0;
   localMonkey.snowballsExploded = 0;
   localMonkey.snowpile.snowWeight = 0;
   localMonkey.snowpile.outOfSnow = false;
   localMonkeyOutOfSnow = false;
   remoteMonkeyOutOfSnow = false;
   clearInterval(intervalGameActions);
   iceBlockExplosions = 0;
   gameStarted = false;
   obstacleInPlace = false;
   inLobby = true;
}
clearInterval(intervalBootOut);
clearInterval(ivGetRoomvalues);
clearInterval(ivShowUsers);
inGame = true;
clearInterval(intervalPlayAgain);
obstacleAlreadyMade = false;
startPosY = 378;
startPos0X = 100;
startPos1X = 500;
resetGame();
this.attachMovie("mcCannon","mcCannon0",100000);
this.attachMovie("mcCannon","mcCannon1",100001);
mcTerrain.obstacleCounter = 1;
mcTerrain.mcSnowpile0.gotoAndPlay("in");
mcTerrain.mcSnowpile1.gotoAndPlay("in");
mcCannon0._x = startPos0X;
mcCannon0._y = startPosY;
mcCannon0._xscale = -100;
mcCannon1._x = startPos1X;
mcCannon1._y = startPosY;
gotoAndStop(_currentframe + 1);
stop();
