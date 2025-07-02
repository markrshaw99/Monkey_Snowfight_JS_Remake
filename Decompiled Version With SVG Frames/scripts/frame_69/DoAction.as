function sendObstacleCoordinates()
{
   var _loc1_;
   if(gameHost)
   {
      debug(" [G] Sent obstacles to opponent: " + opponent);
      _loc1_ = new Object();
      _loc1_.id = "obs";
      if(obstacleTotal > 0)
      {
         _loc1_.x = arrObstacleX;
         _loc1_.y = arrObstacleY;
         _loc1_.s = arrObstacleS;
         _loc1_.f = arrObstacleF;
         _loc1_.a = obstacleTotal;
      }
      es.sendMove([opponent],_loc1_);
   }
}
function checkObstacle()
{
   if(!obstacleInPlace)
   {
      if(getTimer() >= syncErrorTimer)
      {
         clearInterval(ivCheckObstacle);
         gameOver("opponentLeft");
      }
   }
   else
   {
      clearInterval(ivCheckObstacle);
      gotoAndStop("vs");
      play();
   }
}
var userList = es.getUserList();
localUserName = es.getUser().Name.value;
i = 0;
while(i < userList.length)
{
   var user = userList[i];
   if(user.Name.value != localUserName)
   {
      opponent = user.Name.value;
      var arrUserVariables = user.userVariables.v.split(",");
      var gamesWon = arrUserVariables[0];
      var gamesLost = arrUserVariables[1];
      var rating = arrUserVariables[2];
      remoteLosses = gamesLost;
      remoteWins = gamesWon;
   }
   else if(user.isGameMaster)
   {
      gameHost = true;
   }
   i++;
}
var myUserNumber = es.getUser().AssignedNumber.value;
if(myUserNumber == 0)
{
   localMonkey.toTheLeft = true;
   localMonkey.cannon = mcCannon0;
   localMonkey.snowpile = mcTerrain.mcSnowpile0;
   localMonkey.cannonX = mcCannon0._x;
   localMonkey.cannonY = mcCannon0._y;
   remoteMonkey.cannon = mcCannon1;
   remoteMonkey.snowpile = mcTerrain.mcSnowpile1;
   remoteMonkey.cannonX = mcCannon1._x;
   remoteMonkey.cannonY = mcCannon1._y;
}
else if(myUserNumber == 1)
{
   localMonkey.toTheLeft = false;
   localMonkey.cannon = mcCannon1;
   localMonkey.snowpile = mcTerrain.mcSnowpile1;
   localMonkey.cannonX = mcCannon1._x;
   localMonkey.cannonY = mcCannon1._y;
   remoteMonkey.cannon = mcCannon0;
   remoteMonkey.snowpile = mcTerrain.mcSnowpile0;
   remoteMonkey.cannonX = mcCannon0._x;
   remoteMonkey.cannonY = mcCannon0._y;
}
if(localMonkey.toTheLeft)
{
   mcCannon1.mcSetPower._visible = false;
   mcCannon1.mcAddSnow._visible = false;
   mcCannon1.mcAngle._visible = false;
   mcCannon1.mcSliderKnob._visible = false;
   mcTerrain.mcSnowpile0.mcBonusPipe._visible = false;
   mcEnergy0.txtName1 = localUserName;
   mcEnergy0.txtName2 = localUserName;
   mcEnergy1.txtName1 = opponent;
   mcEnergy1.txtName2 = opponent;
   txtMonkey1.text = localUserName;
   txtMonkey2.text = opponent;
   mcEnergy0.txtWins.text = totalLocalWins;
   mcEnergy1.txtWins.text = remoteWins;
   mcEnergy0.txtLosses.text = totalLocalLosses;
   mcEnergy1.txtLosses.text = remoteLosses;
}
else
{
   mcCannon0.mcSetPower._visible = false;
   mcCannon0.mcAddSnow._visible = false;
   mcCannon0.mcAngle._visible = false;
   mcCannon0.mcSliderKnob._visible = false;
   mcTerrain.mcSnowpile1.mcBonusPipe._visible = false;
   mcEnergy0.txtName1 = opponent;
   mcEnergy0.txtName2 = opponent;
   mcEnergy1.txtName1 = localUserName;
   mcEnergy1.txtName2 = localUserName;
   txtMonkey1.text = opponent;
   txtMonkey2.text = localUserName;
   mcEnergy0.txtWins.text = remoteWins;
   mcEnergy1.txtWins.text = totalLocalWins;
   mcEnergy0.txtLosses.text = remoteLosses;
   mcEnergy1.txtLosses.text = totalLocalLosses;
}
firePause = 2500;
powerBoost = 1.5;
buildingPower = false;
cannonHasBeenFired = true;
localMonkey.cannon.mcSetPower.mcScale.gotoAndStop(1);
localMonkey.snowpile.snowWeight = 0;
produceObstacle();
sendCounter = 1000;
inLobby = false;
syncErrorTimer = getTimer() + 10000;
sendObstacleCoordinates();
ivCheckObstacle = setInterval(checkObstacle,100);
debug(" [G] Game has started. " + localUserName + " (me) v. " + opponent);
stop();
