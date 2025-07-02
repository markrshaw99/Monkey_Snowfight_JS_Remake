function sendMove()
{
   var _loc1_ = new Object();
   if(localMonkey.cannonContents == "snow")
   {
      _loc1_.w = int(localMonkey.snowpile.snowWeight);
   }
   else if(localMonkey.cannonContents == "nana")
   {
      _loc1_.w = 7;
   }
   _loc1_.a = int(localMonkey.cannon._currentframe - 1);
   _loc1_.p = int(localMonkey.cannon.mcSetPower.mcScale._currentframe * powerBoost);
   _loc1_.t = getTimer();
   _loc1_.id = 1;
   _loc1_.type = localMonkey.cannonContents;
   if(!localMonkey.toTheLeft)
   {
      _loc1_.a = 180 - _loc1_.a;
   }
   es.sendMove([opponent],_loc1_);
}
function gameMoveReceived(type, ob, from)
{
   var _loc3_;
   var _loc4_;
   var _loc1_;
   if(localUserName != from)
   {
      if(ob.id == 1)
      {
         if(localMonkey.toTheLeft)
         {
            _loc3_ = 180 - ob.a;
         }
         else
         {
            _loc3_ = ob.a;
         }
         ob.fireTime = getTimer() + firePause;
         remoteMonkey.cannon.gotoAndStop(_loc3_);
         if(ob.type == "snow")
         {
            remoteMonkey.snowpile.gotoAndStop(remoteMonkey.snowpile._currentframe + ob.w);
         }
         fire(remoteMonkey,ob.a,ob.w,ob.p,ob);
         ob.id = 2;
         es.sendMove([opponent],ob);
      }
      else if(ob.id == 2)
      {
         _loc4_ = int((getTimer() - ob.t) / 2);
         ob.fireTime = getTimer() + (firePause - _loc4_);
         fire(localMonkey,ob.a,ob.w,ob.p,ob);
      }
      else if(ob.id == "obs")
      {
         debug(" [G] Received obstacles from opponent: " + from);
         _loc1_ = 1;
         while(_loc1_ <= ob.a)
         {
            mcTerrain.attachMovie("mcObstacle","mcObstacle" + _loc1_,_loc1_);
            mcTerrain["mcObstacle" + _loc1_]._x = ob.x[_loc1_];
            mcTerrain["mcObstacle" + _loc1_]._y = ob.y[_loc1_];
            mcTerrain["mcObstacle" + _loc1_]._xscale = ob.s[_loc1_];
            mcTerrain["mcObstacle" + _loc1_]._yscale = ob.s[_loc1_];
            mcTerrain["mcObstacle" + _loc1_].gotoAndStop(ob.f[_loc1_]);
            mcTerrain["mcObstacle" + _loc1_].hitsLeft = 3;
            if(_loc1_ > 100)
            {
               debug(" [G] Building obstacles after received them failed.");
               break;
            }
            _loc1_ = _loc1_ + 1;
         }
         ob = new Object();
         ob.id = "go";
         ob.g = 3000 - currentLag;
         es.sendMove([opponent],ob);
         gameStartSync = getTimer() + 3000;
         obstacleInPlace = true;
      }
      else if(ob.id == "go")
      {
         gameStartSync = getTimer() + (ob.g - currentLag);
         obstacleInPlace = true;
      }
      else if(ob.id == "pA")
      {
         if(iWantToPlayAgain)
         {
            iWantToPlayAgain = false;
            opponentWantsToPlayAgain = false;
            gotoAndStop("Game");
            play();
         }
         opponentWantsToPlayAgain = true;
      }
      else if(ob.id == "z")
      {
         mcPlayAgain.gotoAndStop(3);
         clearSnowballs();
      }
      else if(ob.id == "nS")
      {
         remoteMonkeyOutOfSnow = true;
      }
      else if(ob.id == "bE")
      {
         if(localMonkey.toTheLeft)
         {
            mcEnergy1.gotoAndStop(ob.e);
         }
         else
         {
            mcEnergy0.gotoAndStop(ob.e);
         }
      }
      else if(ob.id == "gOv")
      {
         receivedGameOver = true;
         if(ob.w == localUserName)
         {
            gameOver(localUserName);
         }
         else if(ob.w == opponent)
         {
            gameOver(opponent);
         }
         else
         {
            gameOver();
         }
      }
      else if(ob.id == "bS")
      {
         if(localMonkey.toTheLeft)
         {
            mcTerrain.mcSnowpile1.gotoAndStop(ob.e);
         }
         else
         {
            mcTerrain.mcSnowpile0.gotoAndStop(ob.e);
         }
      }
   }
}
function produceObstacle()
{
   obstacleTotal = 6;
   mcTerrain.mcHugeIcicle._y = 175;
   var _loc2_;
   var _loc3_;
   var _loc4_;
   var _loc1_;
   var _loc5_;
   if(gameHost && !obstacleAlreadyMade)
   {
      mcTerrain.attachMovie("mcObstacleArea","mcObstacleArea",1000);
      _loc2_ = 1;
      while(_loc2_ <= obstacleTotal)
      {
         mcTerrain.attachMovie("mcObstacle","mcObstacle" + _loc2_,_loc2_);
         goto = 0;
         while(goto < 2)
         {
            var goto = int(random(mcTerrain["mcObstacle" + _loc2_]._totalframes) + 1);
         }
         mcTerrain["mcObstacle" + _loc2_].gotoAndStop(goto);
         if(_loc2_ > 100)
         {
            debug(" [G] Building obstacles (from scratch) failed.");
            break;
         }
         _loc2_ = _loc2_ + 1;
      }
      if(obstacleTotal > 0)
      {
         _loc3_ = 1;
         while(_loc3_ <= obstacleTotal)
         {
            _loc4_ = mcTerrain["mcObstacle" + _loc3_];
            while(!mcTerrain.mcObstacleArea.hitTest(obstacleX,obstacleY,true))
            {
               var obstacleX = random(600);
               var obstacleY = random(400);
            }
            _loc4_._x = obstacleX;
            _loc4_._y = obstacleY;
            obstacleX = 0;
            obstacleY = 0;
            if(_loc2_ > 100)
            {
               debug(" [G] Moving obstacles around failed.");
               break;
            }
            _loc3_ = _loc3_ + 1;
         }
      }
      mcTerrain.mcObstacleArea.removeMovieClip();
      arrObstacleX = new Array();
      arrObstacleY = new Array();
      arrObstacleS = new Array();
      arrObstacleF = new Array();
      _loc1_ = 1;
      while(_loc1_ <= obstacleTotal)
      {
         if(mcTerrain["mcObstacle" + _loc1_]._currentframe < 5)
         {
            _loc5_ = random(3);
            if(_loc5_ == 0)
            {
               mcTerrain["mcObstacle" + _loc1_].size = 100;
               mcTerrain["mcObstacle" + _loc1_].hitsLeft = 3;
            }
            else if(_loc5_ == 1)
            {
               mcTerrain["mcObstacle" + _loc1_].size = 150;
               mcTerrain["mcObstacle" + _loc1_].hitsLeft = 3;
            }
            else
            {
               mcTerrain["mcObstacle" + _loc1_].size = 200;
               mcTerrain["mcObstacle" + _loc1_].hitsLeft = 3;
            }
            mcTerrain["mcObstacle" + _loc1_]._xscale = mcTerrain["mcObstacle" + _loc1_].size;
            mcTerrain["mcObstacle" + _loc1_]._yscale = mcTerrain["mcObstacle" + _loc1_].size;
         }
         else if(mcTerrain["mcObstacle" + _loc1_]._currentframe == 5)
         {
            mcTerrain["mcObstacle" + _loc1_].size = random(100) + 100;
            mcTerrain["mcObstacle" + _loc1_]._xscale = mcTerrain["mcObstacle" + _loc1_].size;
            mcTerrain["mcObstacle" + _loc1_]._yscale = mcTerrain["mcObstacle" + _loc1_].size;
         }
         arrObstacleX[_loc1_] = mcTerrain["mcObstacle" + _loc1_]._x;
         arrObstacleY[_loc1_] = mcTerrain["mcObstacle" + _loc1_]._y;
         arrObstacleS[_loc1_] = mcTerrain["mcObstacle" + _loc1_]._xscale;
         arrObstacleF[_loc1_] = mcTerrain["mcObstacle" + _loc1_]._currentframe;
         if(_loc2_ > 100)
         {
            debug(" [G] Setting obstacle sizes failed.");
            break;
         }
         _loc1_ = _loc1_ + 1;
      }
      obstacleAlreadyMade = true;
   }
}
function userListUpdated(userList, type, userReference)
{
   if(type != "all")
   {
      if(type == "userjoined")
      {
         debug(" [G] New user joined.");
      }
      else if(type == "userleft")
      {
         debug(" [G] Opponent left.");
         mcPlayAgain.gotoAndStop(3);
         gameOver("opponentLeft");
      }
   }
}
var room = es.getRoom();
gameIsOver = false;
var so = readCookie();
totalLocalWins = so.data.totalLocalWins;
totalLocalLosses = so.data.totalLocalLosses;
es.userListUpdated = userListUpdated;
es.moveReceived = gameMoveReceived;
es.messageReceived = gotMessage;
gotoAndStop("ObstacleSync");
