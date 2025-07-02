function makeFlake(flake)
{
   flake._y = 0;
   flake._x = random(stageWidth);
   flake._y = random(stageHeight * 2) - stageHeight * 2;
   flake.size = random(50) + 50;
   flake._xscale = flake.size;
   flake._yscale = flake.size;
   flake.originalPosition = flake._x;
   flake.vin = flake._x + random(10) - 5;
   flake.snowSpeed = snowSpeed * ((random(100) - 50) / 40);
   flake.fallSpeed = random(snowSpeed * 30) + 1;
}
this._visible = false;
snowFall = new Array();
stageWidth = int(stageWidth);
stageHeight = int(stageHeight);
landedSnow = snowFlakes;
error = false;
if((stageWidth == 0 or stageHeight == 0) && mcTarget.getDepth() == undefined)
{
   trace("MINICLIP.COM LOADING COMPONENT WARNING");
   trace("======================================");
   trace("The \'stageWidth\' and \'stageHeight\' parameters have not been set.");
   trace("If you export Flash 5 content, these values MUST be set.");
   mcInstructions._visible = true;
   mcInstructions._x = 0;
   mcInstructions._y = 0;
   mcInstructions.gotoAndStop(2);
   mcTarget._visible = false;
   error = true;
}
else if(stageWidth == 0 or stageHeight == 0)
{
   stageWidth = Stage.width;
   stageHeight = Stage.height;
}
if(error == false)
{
   i = 0;
   while(i < snowFlakes)
   {
      attachMovie("mcFlake","mcFlake" + i,i);
      var flakePath = eval(this["mcFlake" + i]._target);
      makeFlake(flakePath);
      i++;
   }
}
else
{
   stop();
}
this._visible = true;
