if(justLostGame)
{
   justLostGame = false;
   gotoAndStop("lose");
}
else
{
   gotoAndStop("idle");
   play();
}
