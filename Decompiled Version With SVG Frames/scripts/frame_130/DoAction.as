function playAgain()
{
   var _loc1_ = new Object();
   _loc1_.id = "pA";
   es.sendMove([opponent],_loc1_);
   if(opponentWantsToPlayAgain)
   {
      clearInterval(intervalPlayAgain);
      iWantToPlayAgain = false;
      gotoAndStop("Game");
   }
   else
   {
      iWantToPlayAgain = true;
   }
}
obstacleInPlace = false;
clearInterval(intervalGameActions);
Key.removeListener(listenerChat);
playAgain();
stop();
