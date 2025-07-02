if(this._alpha > 1)
{
   this._alpha -= 1;
   gotoAndStop("fadeOut");
   play();
}
else
{
   this._alpha = 0;
   stop();
}
