if(getTimer() >= monkeyDownDelay)
{
   _parent.monkeyIsDown = false;
   _parent.mcSliderKnob.gotoAndStop(1);
   if(!_parent._parent["mcSnowpile" + monkeyNumber].outOfSnow && _parent._parent["mcCannon" + monkeyNumber].mcAddSnow.mcSnowScale._currentframe < 11 && _parent._parent.cannonContents != "nana")
   {
      _parent.mcAddSnow.gotoAndStop(1);
   }
   if(_parent._parent["mcCannon" + monkeyNumber].mcAddSnow.mcSnowScale._currentframe > 1)
   {
      _parent.mcSetPower.gotoAndStop(1);
   }
   msDisabled = 0;
   gotoAndStop("getUp");
   play();
}
else
{
   gotoAndPlay(_currentframe - 1);
}
