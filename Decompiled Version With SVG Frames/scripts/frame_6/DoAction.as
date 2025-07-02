flash5orAbove = function()
{
   if(getBytesLoaded() == getBytesTotal())
   {
      gotoAndStop("flashFiveOrBetterDetected");
      play();
   }
   else
   {
      gotoAndPlay(1);
   }
};
var strPlayerVersion = System.capabilities.version;
strPlayerVersion = strPlayerVersion.split(",")[0];
var i = 0;
while(i < strPlayerVersion.length)
{
   if(strPlayerVersion.charAt(i) == " ")
   {
      var intPlayerVersion = int(strPlayerVersion.slice(i + 1,strPlayerVersion.length));
      break;
   }
   i++;
}
trace("intPlayerVersion: " + intPlayerVersion);
if(intPlayerVersion < 7)
{
   gotoAndStop("flashPrompt");
}
else if(_framesloaded == _totalframes)
{
   gotoAndStop("Lobby");
}
