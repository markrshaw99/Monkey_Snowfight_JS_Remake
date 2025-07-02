i = 0;
while(i < snowFlakes)
{
   this["mcFlake" + i].y = Math.sin(this["mcFlake" + i].vin) * snowDistance + this["mcFlake" + i].originalPosition;
   this["mcFlake" + i]._x = snowDistance + this["mcFlake" + i].y;
   this["mcFlake" + i]._y += this["mcFlake" + i].fallSpeed;
   this["mcFlake" + i].vin += this["mcFlake" + i].snowSpeed;
   if(this["mcFlake" + i]._y > stageHeight + 10)
   {
      var flakePath = eval(this["mcFlake" + i]._target);
      makeFlake(flakePath);
   }
   i++;
}
gotoAndPlay(_currentframe - 1);
