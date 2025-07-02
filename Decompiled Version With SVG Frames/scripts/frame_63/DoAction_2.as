function resetCannon()
{
   degrees = startAngle;
   localMonkey.angle = startAngle;
   mcCannon0.gotoAndStop(startAngle);
   mcCannon1.gotoAndStop(startAngle);
   mcCannon0.mcSliderKnob.mcSliderDirection._rotation = startAngle;
   mcCannon1.mcSliderKnob.mcSliderDirection._rotation = startAngle;
   localMonkey.cannon.mcSliderKnob.mcSliderDirection._rotation = int(degrees) + 1;
}
function fire(from, angle, weight, power, ob)
{
   if(!gameIsOver)
   {
      localMonkey.snowballsFired = localMonkey.snowballsFired + 1;
      mc = "mcBall" + localMonkey.snowballsFired;
      if(ob.type == "snow")
      {
         attachMovie("mcBall",mc,localMonkey.snowballsFired);
      }
      else if(ob.type == "nana")
      {
         attachMovie("mcBananaBomb",mc,localMonkey.snowballsFired);
      }
      this[mc].fireSnowBallTimeOut = getTimer() + 10000;
      this[mc].fireTime = ob.fireTime;
      this[mc]._x = from.cannonX;
      this[mc]._y = from.cannonY;
      this[mc].snowballSize = 50 + weight * 18;
      this[mc]._xscale = this[mc].snowballSize;
      this[mc]._yscale = this[mc].snowballSize;
      this[mc].weight = weight;
      this[mc].vmax = power - weight;
      this[mc].drag = 0.9;
      this[mc].hitTestIterations = hitTestIterations;
      this[mc].energyLoss = int(weight * 8);
      this[mc].radius = mc._width / 2;
      this[mc].x = this[mc]._x;
      this[mc].y = this[mc]._y;
      this[mc].angle = - angle;
      this[mc].angle = this[mc].angle * 3.141592653589793 / 180;
      this[mc].vx = this[mc].vmax * Math.cos(this[mc].angle);
      this[mc].vy = this[mc].vmax * Math.sin(this[mc].angle);
      this[mc].id = ob.id;
      this[mc].from = from;
      this[mc].scaleHasBeenReset = false;
      arrSnowballs.push(localMonkey.snowballsFired);
      this[mc]._visible = false;
      from.cannon.mcCannonAndMonkey.gotoAndPlay("prepareExplosion");
      from.cannon.mcBarrel.gotoAndStop(int(ob.p / powerBoost));
      if(localMonkey.toTheLeft && this[mc]._x < 300 or !localMonkey.toTheLeft && this[mc]._x > 300)
      {
         this[mc].fromLocalMonkey = true;
      }
      else
      {
         this[mc].fromLocalMonkey = false;
      }
   }
}
function addSnow()
{
   localMonkey.cannonContents = "snow";
   localMonkey.snowpile.snowWeight = localMonkey.snowpile.snowWeight + 1;
   localMonkey.cannon.mcCannonAndMonkey.gotoAndPlay("addSnow");
   if(localMonkey.snowpile.outOfSnow)
   {
      localMonkey.cannon.mcAddSnow.gotoAndStop(2);
      localMonkey.cannon.mcCannonAndMonkey.gotoAndStop("scared");
   }
}
function doGameActions()
{
   if(!gameIsOver)
   {
      if(arrSnowballs.length > 0)
      {
         var i = 0;
         while(i <= arrSnowballs.length)
         {
            mc = eval("mcBall" + arrSnowballs[i]);
            if(getTimer() >= mc.fireTime)
            {
               if(!mc.scaleHasBeenReset && mc.scaleHasBeenReset != undefined)
               {
                  mc._visible = true;
                  var from = mc.from;
                  from.snowpile.snowWeight = 0;
                  from.cannon.mcAddSnow.mcSnowScale.gotoAndStop(1);
                  mc.scaleHasBeenReset = true;
                  from.cannon.mcSetPower.mcScale.gotoAndStop(1);
                  from.cannon.mcSliderKnob.gotoAndStop(1);
                  from.cannon.mcBarrel.gotoAndStop(1);
                  if(!localMonkey.snowpile.outOfSnow)
                  {
                     from.cannon.mcAddSnow.gotoAndStop(1);
                  }
                  else
                  {
                     from.cannon.mcAddSnow.gotoAndStop(2);
                     from.cannon.mcSliderKnob.gotoAndStop(2);
                  }
                  from.cannon.mcCannonAndMonkey.gotoAndPlay("explosion");
                  mc.framesTravelled = 0;
               }
               mc.vy += gravity;
               mc.x += mc.drag * mc.vx;
               mc.y += mc.drag * mc.vy;
               mc.hitTestDistanceX = int((mc.x - mc._x) / mc.hitTestIterations);
               mc.hitTestDistanceY = int((mc.y - mc._y) / mc.hitTestIterations);
               mc.framesTravelled = mc.framesTravelled + 1;
               if(mc.hitTestIterations > 0)
               {
                  var b = 1;
                  while(b <= mc.hitTestIterations)
                  {
                     mc.hitTestXTemp = mc.hitTestX;
                     mc.hitTestYTemp = mc.hitTestY;
                     mc.hitTestX = int(mc._x + mc.hitTestDistanceX * b);
                     mc.hitTestY = int(mc._y + mc.hitTestDistanceY * b);
                     if(mc.scaleHasBeenReset)
                     {
                        doSnowBallHitTests(mc,i);
                     }
                     if(b > 100)
                     {
                        debug(" [G] Broke for loop 7.");
                        break;
                     }
                     b++;
                  }
               }
               if(!mc.hitSomething)
               {
                  mc._x = mc.x;
                  mc._y = mc.y;
               }
            }
            else if(getTimer() > mc.fireSnowBallTimeOut)
            {
               gameOver("opponentLeft");
            }
            if(i > 1000)
            {
               debug(" [G] Broke for loop 1.");
               break;
            }
            if(i > 1000)
            {
               debug(" [G] Broke for loop 6.");
               break;
            }
            i++;
         }
      }
      if(!localMonkey.cannon.monkeyIsDown)
      {
         if(leftMouseButtonIsDown)
         {
            var angle = Math.atan(Math.abs(_root._ymouse - localMonkey.cannon._y) / Math.abs(_root._xmouse - localMonkey.cannon._x));
            degrees = angle * 180 / 3.141592653589793;
            localMonkey.angle = degrees;
            if(_root._ymouse <= localMonkey.cannon._y && !localMonkey.toTheLeft && _root._xmouse <= localMonkey.cannon._x or _root._ymouse <= localMonkey.cannon._y && localMonkey.toTheLeft && _root._xmouse >= localMonkey.cannon._x)
            {
               localMonkey.cannon.gotoAndStop(int(degrees) + 1);
               localMonkey.cannon.mcSliderKnob.mcSliderDirection._rotation = int(degrees) + 1;
               localMonkey.cannon.mcCannonAndMonkey.gotoAndStop("angle");
               localMonkey.cannon.mcCannonAndMonkey.mcMonkeyHead._rotation = - int(degrees / 2) + 20;
               monkeyAlreadyIdle = false;
            }
            else if(_root._ymouse > localMonkey.cannon._y)
            {
               localMonkey.cannon.gotoAndStop(1);
            }
            else if(_root._xmouse > localMonkey.cannon._x or localMonkey.toTheLeft && _root._xmouse < localMonkey.cannon._x)
            {
               localMonkey.cannon.gotoAndStop(91);
            }
         }
         else
         {
            if(!monkeyAlreadyIdle)
            {
               localMonkey.cannon.mcCannonAndMonkey.gotoAndStop("idle");
               monkeyAlreadyIdle = true;
            }
            localMonkey.cannon.mcSliderKnob.mcSliderDirection._rotation = int(degrees) + 1;
         }
      }
      else
      {
         leftMouseButtonIsDown = false;
         monkeyAlreadyIdle = true;
      }
      if(localMonkey.cannon.mcSetPower.mcScale._currentframe != 1)
      {
         localMonkey.cannon.mcBarrel.gotoAndStop(localMonkey.cannon.mcSetPower.mcScale._currentframe);
      }
   }
}
function removeSnowball(mc, isMonkeyOrCannon, i, noExplosion)
{
   mc.hitSomething = true;
   var _loc4_;
   if(localMonkey.snowpile.outOfSnow && mc.fromLocalMonkey)
   {
      localMonkeyOutOfSnow = true;
      _loc4_ = new Object();
      _loc4_.id = "nS";
      es.sendMove([opponent],_loc4_);
   }
   localMonkey.snowballsExploded = localMonkey.snowballsExploded + 1;
   var _loc2_ = localMonkey.snowballsFired + localMonkey.snowballsExploded;
   attachMovie("mcBall","mcSnowballExplode" + _loc2_,_loc2_);
   this["mcSnowballExplode" + _loc2_]._x = mc._x;
   this["mcSnowballExplode" + _loc2_]._y = mc._y;
   this["mcSnowballExplode" + _loc2_]._xscale = mc._xscale;
   this["mcSnowballExplode" + _loc2_]._yscale = mc._yscale;
   this["mcSnowballExplode" + _loc2_]._rotation = random(360);
   this["mcSnowballExplode" + _loc2_].explode = true;
   this["mcSnowballExplode" + _loc2_].swapDepths(200000 + random(100));
   mc._visible = false;
   if(noExplosion)
   {
      this["mcSnowballExplode" + _loc2_]._visible = false;
   }
   arrSnowballs.splice(i,1);
   if(isMonkeyOrCannon)
   {
      this["mcSnowballExplode" + _loc2_].gotoAndPlay("explode2");
   }
   else
   {
      this["mcSnowballExplode" + _loc2_].gotoAndPlay("explode");
   }
   checkIfGameOver();
}
function doExplosion(mc)
{
   var _loc11_ = mc._x;
   var _loc12_ = mc._y;
   localMonkey.snowballsExploded = localMonkey.snowballsExploded + 1;
   var _loc4_ = localMonkey.snowballsFired + localMonkey.snowballsExploded;
   attachMovie("mcExplosion","mcExplosion" + _loc4_,_loc4_);
   this["mcExplosion" + _loc4_]._x = _loc11_;
   this["mcExplosion" + _loc4_]._y = _loc12_;
   var _loc8_ = mcTerrain.hitTest(this["mcExplosion" + _loc4_]);
   var _loc10_ = remoteMonkey.cannon.mcCannonAndMonkey.mcHitTestMonkey.hitTest(this["mcExplosion" + _loc4_]) or localMonkey.cannon.mcCannonAndMonkey.mcHitTestMonkey.hitTest(this["mcExplosion" + _loc4_]);
   var _loc9_ = (remoteMonkey.cannon.mcCannonAndMonkey.mcHitTestCannon.hitTest(this["mcExplosion" + _loc4_]) or localMonkey.cannon.mcCannonAndMonkey.mcHitTestCannon.hitTest(this["mcExplosion" + _loc4_])) && mc.framesTravelled > 10;
   var _loc2_;
   var _loc6_;
   var _loc5_;
   var _loc3_;
   if(_loc8_ or _loc10_ or _loc9_)
   {
      if(_loc8_)
      {
         if(mcTerrain.mcHugeIcicle.hitTest(this["mcExplosion" + _loc4_]))
         {
            if(mcTerrain.mcHugeIcicle._y + 64 < 300 && mcTerrain.mcHugeIcicle._y < 300)
            {
               mcTerrain.mcHugeIcicle.gotoAndPlay("shake");
               mcTerrain.mcHugeIcicle._y += 64;
            }
            else
            {
               mcTerrain.mcHugeIcicle._y = 300;
            }
         }
      }
      if(_loc10_)
      {
         if(mcCannon0.mcCannonAndMonkey.mcHitTestMonkey.hitTest(this["mcExplosion" + _loc4_]))
         {
            monkeyHasBeenHit(0,8);
         }
         else
         {
            monkeyHasBeenHit(1,8);
         }
      }
      if(_loc9_)
      {
         if(remoteMonkey.cannon.mcCannonAndMonkey.mcHitTestCannon.hitTest(this["mcExplosion" + _loc4_]))
         {
            remoteMonkey.cannon.gotoAndStop(90);
            remoteMonkey.cannon.mcSliderKnob.mcSliderDirection._rotation = 90;
         }
         else
         {
            localMonkey.cannon.gotoAndStop(90);
            localMonkey.cannon.mcSliderKnob.mcSliderDirection._rotation = 90;
         }
      }
      _loc2_ = 1;
      while(_loc2_ <= obstacleTotal)
      {
         if(mcTerrain["mcObstacle" + _loc2_].hitTest(this["mcExplosion" + _loc4_]))
         {
            if(mcTerrain["mcObstacle" + _loc2_].mcObstacle.ID == "ice")
            {
               mcTerrain["mcObstacle" + _loc2_].hitsLeft -= mc.weight;
               if(mcTerrain["mcObstacle" + _loc2_].hitsLeft < 1)
               {
                  iceBlockExplosions++;
                  _loc6_ = mcTerrain["mcObstacle" + _loc2_]._x;
                  _loc5_ = mcTerrain["mcObstacle" + _loc2_]._y;
                  _loc3_ = mcTerrain["mcObstacle" + _loc2_]._xscale;
                  mcTerrain.attachMovie("mcIceBlockExplode","mcIceBlockExplode" + _loc2_,_loc2_);
                  mcTerrain["mcIceBlockExplode" + _loc2_]._x = _loc6_;
                  mcTerrain["mcIceBlockExplode" + _loc2_]._y = _loc5_;
                  mcTerrain["mcIceBlockExplode" + _loc2_]._xscale = _loc3_;
                  mcTerrain["mcIceBlockExplode" + _loc2_]._yscale = _loc3_;
                  mcTerrain["mcObstacle" + _loc2_].removeMovieClip();
               }
               else
               {
                  mcTerrain["mcObstacle" + _loc2_].mcObstacle.play();
               }
            }
            else if(mcTerrain["mcObstacle" + _loc2_].mcObstacle.ID == "sphere")
            {
               mcTerrain["mcObstacle" + _loc2_].mcObstacle.play();
            }
         }
         if(_loc2_ > 1000)
         {
            debug(" [G] Broke for loop 2.");
            break;
         }
         _loc2_ = _loc2_ + 1;
      }
      if(mc.fromLocalMonkey && localMonkey.cannon.mcCannonAndMonkey.mcHitTestMonkey.hitTest(this["mcExplosion" + _loc4_]))
      {
         localMonkey.cannon.mcAddSnow.gotoAndStop(1);
      }
   }
   mcBackground.gotoAndPlay("explosion");
}
function checkIfGameOver()
{
   if(localMonkeyOutOfSnow && remoteMonkeyOutOfSnow)
   {
      gameOver();
   }
   else if(localMonkeyOutOfSnow && (localMonkey.toTheLeft && mcEnergy0._currentframe > mcEnergy1._currentframe or !localMonkey.toTheLeft && mcEnergy0._currentframe < mcEnergy1._currentframe))
   {
      gameOver(opponent);
   }
   else if(remoteMonkeyOutOfSnow && (localMonkey.toTheLeft && mcEnergy0._currentframe < mcEnergy1._currentframe or !localMonkey.toTheLeft && mcEnergy0._currentframe > mcEnergy1._currentframe))
   {
      gameOver(localUserName);
   }
}
function serveBonus(side, bonusText)
{
   attachMovie("mcBonusText","mcBonusText",5000);
   mcBonusText.txtBonus = bonusText;
   var _loc2_ = new Object();
   var _loc4_;
   if(side == "left")
   {
      mcBonusText._x = 66;
      mcBonusText._y = 116;
      _loc4_ = 1;
   }
   else if(side == "right")
   {
      mcBonusText._x = 565;
      mcBonusText._y = 116;
      _loc4_ = 0;
   }
   var _loc3_;
   if(bonusText == "coco energy")
   {
      _loc3_ = this["mcEnergy" + _loc4_]._currentframe - 50;
      if(_loc3_ < 1)
      {
         _loc3_ = 1;
      }
      this["mcEnergy" + _loc4_].gotoAndStop(_loc3_);
      _loc2_.id = "bE";
   }
   else if(bonusText == "extra snow")
   {
      _loc3_ = mcTerrain["mcSnowpile" + _loc4_]._currentframe - 10;
      if(_loc3_ < 46)
      {
         _loc3_ = 46;
      }
      mcTerrain["mcSnowpile" + _loc4_].gotoAndStop(_loc3_);
      localMonkeyOutOfSnow = false;
      localMonkey.snowpile.outOfSnow = false;
      localMonkey.cannon.mcAddSnow.gotoAndStop(1);
      localMonkey.cannon.mcSliderKnob.gotoAndStop(1);
      _loc2_.id = "bS";
   }
   else if(bonusText == "banana bomb")
   {
      localMonkey.cannonContents = "nana";
      localMonkeyOutOfSnow = false;
      localMonkey.snowpile.outOfSnow = false;
      localMonkey.cannon.mcAddSnow.mcSnowScale.gotoAndStop("bonus");
      localMonkey.cannon.mcAddSnow.gotoAndStop(2);
      localMonkey.cannon.mcSetPower.gotoAndStop(1);
   }
   if(_loc2_.id != undefined)
   {
      _loc2_.e = _loc3_;
      es.sendMove([opponent],_loc2_);
   }
}
function doSnowBallHitTests(mc, i)
{
   var _loc3_ = mc.hitTestX;
   var _loc4_ = mc.hitTestY;
   var _loc12_;
   var _loc14_;
   var _loc13_;
   var _loc15_;
   var _loc2_;
   var _loc8_;
   var _loc7_;
   var _loc6_;
   var _loc9_;
   var _loc11_;
   if(!mc.hitSomething && !gameIsOver)
   {
      if(mc.ID == "nana")
      {
         _loc12_ = mcTerrain.hitTest(_loc3_,_loc4_,true);
         _loc14_ = mcCannon0.mcCannonAndMonkey.mcHitTestMonkey.hitTest(_loc3_,_loc4_,false) or mcCannon1.mcCannonAndMonkey.mcHitTestMonkey.hitTest(_loc3_,_loc4_,false);
         _loc13_ = (remoteMonkey.cannon.mcCannonAndMonkey.mcHitTestCannon.hitTest(_loc3_,_loc4_,true) or localMonkey.cannon.mcCannonAndMonkey.mcHitTestCannon.hitTest(_loc3_,_loc4_,true)) && mc.framesTravelled > 10;
         if(_loc12_ or _loc14_ or _loc13_)
         {
            doExplosion(mc);
            removeSnowball(mc,false,i,true);
         }
      }
      else if(mcTerrain.hitTest(_loc3_,_loc4_,true))
      {
         if(mcTerrain.mcHugeIcicle.hitTest(_loc3_,_loc4_,true))
         {
            if(mcTerrain.mcHugeIcicle._y + int(mc.weight * 8) < 300 && mcTerrain.mcHugeIcicle._y < 300)
            {
               mcTerrain.mcHugeIcicle.gotoAndPlay("shake");
               mcTerrain.mcHugeIcicle._y += int(mc.weight * 8);
            }
            else
            {
               mcTerrain.mcHugeIcicle._y = 300;
            }
         }
         else if(mcTerrain.mcSnowpile0.mcBonusPipe.mcBonus.hitTest(_loc3_,_loc4_,true) or mcTerrain.mcSnowpile1.mcBonusPipe.mcBonus.hitTest(_loc3_,_loc4_,true))
         {
            if(mcTerrain.mcSnowpile0.mcBonusPipe.mcBonus.hitTest(_loc3_,_loc4_,true))
            {
               _loc15_ = mcTerrain.mcSnowpile0.mcBonusPipe.mcBonus;
               serveBonus("left",_loc15_.ID);
               mcTerrain.mcSnowpile0.mcBonusPipe.gotoAndPlay(1);
            }
            else
            {
               _loc15_ = mcTerrain.mcSnowpile1.mcBonusPipe.mcBonus;
               serveBonus("right",_loc15_.ID);
               mcTerrain.mcSnowpile1.mcBonusPipe.gotoAndPlay(1);
            }
         }
         else
         {
            _loc2_ = 1;
            while(_loc2_ <= obstacleTotal)
            {
               if(mcTerrain["mcObstacle" + _loc2_].hitTest(_loc3_,_loc4_,true))
               {
                  if(mcTerrain["mcObstacle" + _loc2_].mcObstacle.ID == "ice")
                  {
                     mcTerrain["mcObstacle" + _loc2_].hitsLeft -= mc.weight;
                     if(mcTerrain["mcObstacle" + _loc2_].hitsLeft < 1)
                     {
                        iceBlockExplosions++;
                        _loc8_ = mcTerrain["mcObstacle" + _loc2_]._x;
                        _loc7_ = mcTerrain["mcObstacle" + _loc2_]._y;
                        _loc6_ = mcTerrain["mcObstacle" + _loc2_]._xscale;
                        mcTerrain.attachMovie("mcIceBlockExplode","mcIceBlockExplode" + _loc2_,_loc2_);
                        mcTerrain["mcIceBlockExplode" + _loc2_]._x = _loc8_;
                        mcTerrain["mcIceBlockExplode" + _loc2_]._y = _loc7_;
                        mcTerrain["mcIceBlockExplode" + _loc2_]._xscale = _loc6_;
                        mcTerrain["mcIceBlockExplode" + _loc2_]._yscale = _loc6_;
                        mcTerrain["mcObstacle" + _loc2_].removeMovieClip();
                     }
                     else
                     {
                        mcTerrain["mcObstacle" + _loc2_].mcObstacle.gotoAndStop(mcTerrain["mcObstacle" + _loc2_].mcObstacle._currentframe + 1);
                     }
                  }
                  else if(mcTerrain["mcObstacle" + _loc2_].mcObstacle.ID == "sphere")
                  {
                     mcTerrain["mcObstacle" + _loc2_].mcObstacle.play();
                  }
               }
               if(_loc2_ > 1000)
               {
                  debug(" [G] Broke for loop 3.");
                  break;
               }
               _loc2_ = _loc2_ + 1;
            }
         }
         mc._x = _loc3_;
         mc._y = _loc4_;
         removeSnowball(mc,false,i);
      }
      else if(_loc3_ > 700 or _loc3_ < -100 or _loc4_ < -100 or _loc4_ > 500)
      {
         mc._x = _loc3_;
         mc._y = _loc4_;
         removeSnowball(mc,false,i,1);
      }
      else if(mcCannon0.mcCannonAndMonkey.mcHitTestMonkey.hitTest(_loc3_,_loc4_,false) or mcCannon1.mcCannonAndMonkey.mcHitTestMonkey.hitTest(_loc3_,_loc4_,false))
      {
         mc._x = _loc3_;
         mc._y = _loc4_;
         if(mcCannon0.mcCannonAndMonkey.mcHitTestMonkey.hitTest(_loc3_,_loc4_,false))
         {
            monkeyHasBeenHit(0,mc.weight);
         }
         else
         {
            monkeyHasBeenHit(1,mc.weight);
         }
         removeSnowball(mc,true,i);
      }
      else if((remoteMonkey.cannon.mcCannonAndMonkey.mcHitTestCannon.hitTest(_loc3_,_loc4_,true) or localMonkey.cannon.mcCannonAndMonkey.mcHitTestCannon.hitTest(_loc3_,_loc4_,true)) && mc.framesTravelled > 10)
      {
         mc._x = _loc3_;
         mc._y = _loc4_;
         _loc9_ = mc.weight * 9;
         if(_loc9_ >= 90)
         {
            _loc9_ = 90;
         }
         if(mcCannon0.mcCannonAndMonkey.mcHitTestCannon.hitTest(_loc3_,_loc4_,true))
         {
            mcCannon0.gotoAndStop(mcCannon0._currentframe + _loc9_);
            mcCannon0.mcSliderKnob.mcSliderDirection._rotation = int(mcCannon0._currentframe + _loc9_) + 1;
         }
         else
         {
            mcCannon1.gotoAndStop(mcCannon0._currentframe + _loc9_);
            mcCannon1.mcSliderKnob.mcSliderDirection._rotation = int(mcCannon1._currentframe + _loc9_) + 1;
         }
         removeSnowball(mc,true,i);
      }
      else if(arrSnowballs.length > 0)
      {
         if(random(6) == 1 && _loc3_ != 0 && _loc4_ != 0)
         {
            attachMovie("mcStar","mcStar" + glitterCounter,glitterCounter);
            this["mcStar" + glitterCounter]._x = _loc3_;
            this["mcStar" + glitterCounter]._y = _loc4_;
            this["mcStar" + glitterCounter]._alpha = random(100) + 20;
            this["mcStar" + glitterCounter]._x += random(10) - 5;
            this["mcStar" + glitterCounter]._y += random(10) - 5;
            _loc11_ = random(100) + 50;
            this["mcStar" + glitterCounter]._xscale = _loc11_;
            this["mcStar" + glitterCounter]._yscale = _loc11_;
            if(random(2) == 1)
            {
               this["mcStar" + glitterCounter]._rotation = 45;
            }
            glitterCounter++;
         }
      }
   }
}
function monkeyHasBeenHit(monkeyNumber, snowballWeight)
{
   this["mcCannon" + monkeyNumber].monkeyIsDown = true;
   this["mcCannon" + monkeyNumber].mcCannonAndMonkey.msDisabled = snowballWeight * 500;
   this["mcCannon" + monkeyNumber].mcCannonAndMonkey.monkeyNumber = monkeyNumber;
   this["mcCannon" + monkeyNumber].mcCannonAndMonkey.gotoAndPlay("hit");
   this["mcCannon" + monkeyNumber].mcSetPower.gotoAndStop(2);
   this["mcCannon" + monkeyNumber].mcSetPower.mcScale.gotoAndStop(1);
   this["mcCannon" + monkeyNumber].mcAddSnow.gotoAndStop(2);
   this["mcCannon" + monkeyNumber].mcSliderKnob.gotoAndStop(2);
   if(this["mcEnergy" + monkeyNumber]._currentframe + mc.energyLoss <= 100 && this["mcEnergy" + monkeyNumber]._currentframe <= 100)
   {
      this["mcEnergy" + monkeyNumber].gotoAndStop(this["mcEnergy" + monkeyNumber]._currentframe + mc.energyLoss);
   }
   else
   {
      this["mcEnergy" + monkeyNumber].gotoAndStop(101);
      if(localMonkey.toTheLeft)
      {
         if(monkeyNumber == 0)
         {
            gameOver(opponent);
         }
         else
         {
            gameOver(localUserName);
         }
      }
      else if(monkeyNumber == 1)
      {
         gameOver(opponent);
      }
      else
      {
         gameOver(localUserName);
      }
   }
}
function gameOver(who)
{
   if(!receivedGameOver && !gameIsOver)
   {
      var ob = new Object();
      ob.id = "gOv";
      ob.w = who;
      es.sendMove([opponent],ob);
   }
   Key.removeListener(listenerChat);
   clearSpeechBubbles();
   if(!gameIsOver && !inLobby && localUserName != undefined && opponent != undefined)
   {
      mcSpeechType.removeMovieClip();
      localMonkey.cannon.mcAddSnow._visible = false;
      localMonkey.cannon.mcSetPower._visible = false;
      localMonkey.cannon.mcAngle._visible = false;
      localMonkey.cannon.mcSliderKnob._visible = false;
      attachMovie("mcPlayAgain","mcPlayAgain",30000);
      MiniclipGameEvent("StopPenaliseQuitting");
      centerStageX = 300;
      centerStageY = 200;
      mcPlayAgain._x = centerStageX;
      mcPlayAgain._y = centerStageY;
      if(who == "opponentLeft")
      {
         debug("[G] opponentLeft");
         mcPlayAgain.gotoAndStop(3);
      }
      else if(localMonkeyOutOfSnow && remoteMonkeyOutOfSnow)
      {
         if(localMonkey.toTheLeft && mcEnergy0._currentframe < mcEnergy1._currentframe or !localMonkey.toTheLeft && mcEnergy0._currentframe > mcEnergy1._currentframe)
         {
            mcPlayAgain.txtName.text = localUserName;
         }
         else if(localMonkey.toTheLeft && mcEnergy0._currentframe > mcEnergy1._currentframe or !localMonkey.toTheLeft && mcEnergy0._currentframe < mcEnergy1._currentframe)
         {
            mcPlayAgain.txtName.text = opponent;
         }
         else
         {
            mcPlayAgain.gotoAndStop(5);
         }
      }
      else if(mcEnergy0._currentframe >= 100 && mcEnergy1._currentframe >= 100)
      {
         mcPlayAgain.gotoAndStop(5);
      }
      else
      {
         mcPlayAgain.txtName.text = who;
         if(localMonkey.toTheLeft && localUserName == who)
         {
            remoteLosses++;
            MiniclipGameEvent("rewardUserWin",localUserName);
            this.mcCannon0.mcCannonAndMonkey.gotoAndStop("win");
            this.mcCannon1.mcCannonAndMonkey.justLostGame = true;
            this.mcCannon1.mcCannonAndMonkey.gotoAndPlay("hit");
         }
         else if(!localMonkey.toTheLeft && localUserName == who)
         {
            remoteLosses++;
            MiniclipGameEvent("rewardUserWin",localUserName);
            this.mcCannon1.mcCannonAndMonkey.gotoAndStop("win");
            this.mcCannon0.mcCannonAndMonkey.justLostGame = true;
            this.mcCannon0.mcCannonAndMonkey.gotoAndPlay("hit");
         }
         else if(localMonkey.toTheLeft && localUserName != who)
         {
            remoteWins++;
            MiniclipGameEvent("rewardUserWin",opponent);
            this.mcCannon1.mcCannonAndMonkey.gotoAndStop("win");
            this.mcCannon0.mcCannonAndMonkey.justLostGame = true;
            this.mcCannon0.mcCannonAndMonkey.gotoAndPlay("hit");
         }
         else if(!localMonkey.toTheLeft && localUserName != who)
         {
            remoteWins++;
            MiniclipGameEvent("rewardUserWin",opponent);
            this.mcCannon0.mcCannonAndMonkey.gotoAndStop("win");
            this.mcCannon1.mcCannonAndMonkey.justLostGame = true;
            this.mcCannon1.mcCannonAndMonkey.gotoAndStop("hit");
         }
         var so = readCookie();
         totalLocalWins = so.data.totalLocalWins;
         totalLocalLosses = so.data.totalLocalLosses;
         if(localMonkey.toTheLeft)
         {
            mcEnergy0.txtWins.text = totalLocalWins;
            mcEnergy0.txtLosses.text = totalLocalLosses;
            mcEnergy1.txtWins.text = remoteWins;
            mcEnergy1.txtLosses.text = remoteLosses;
         }
         else
         {
            mcEnergy0.txtWins.text = remoteWins;
            mcEnergy0.txtLosses.text = remoteLosses;
            mcEnergy1.txtWins.text = totalLocalWins;
            mcEnergy1.txtLosses.text = totalLocalLosses;
         }
      }
      var i = 0;
      while(i <= arrSnowballs.length)
      {
         mcRemove = eval("mcBall" + arrSnowballs[i]);
         mcRemove._visible = false;
         if(i > 1000)
         {
            debug(" [G] Broke for loop 4.");
            break;
         }
         i++;
      }
   }
   gameIsOver = true;
   iWantToPlayAgain = false;
   localMonkeyOutOfSnow = false;
   remoteMonkeyOutOfSnow = false;
   if(!gameIsOver)
   {
      mcSpeechType.removeMovieClip();
      localMonkey.cannon.mcAddSnow._visible = false;
      localMonkey.cannon.mcSetPower._visible = false;
      localMonkey.cannon.mcAngle._visible = false;
      localMonkey.cannon.mcSliderKnob._visible = false;
      attachMovie("mcPlayAgain","mcPlayAgain",30000);
      centerStageX = 300;
      centerStageY = 200;
      mcPlayAgain._x = centerStageX;
      mcPlayAgain._y = centerStageY;
      mcPlayAgain.gotoAndStop(3);
      gameIsOver = true;
      iWantToPlayAgain = false;
      var i = 0;
      while(i <= arrSnowballs.length)
      {
         mcRemove = eval("mcBall" + arrSnowballs[i]);
         mcRemove._visible = false;
         if(i > 1000)
         {
            debug(" [G] Broke for loop 5.");
            break;
         }
         i++;
      }
   }
   stop();
}
function makePositive(numberToConvert, boolean)
{
   if(boolean)
   {
      if(numberToConvert <= 0)
      {
         numberToConvert = - numberToConvert;
      }
   }
   else if(numberToConvert >= 0)
   {
      numberToConvert = - numberToConvert;
   }
   return numberToConvert;
}
snowBallCounter = 0;
hitTestIterations = 11;
arrSnowballs = new Array();
localMonkey.snowballsFired = 0;
localMonkey.snowballsExploded = 0;
glitterCounter = 1000;
gravity = 1.3;
startAngle = 45;
resetCannon();
