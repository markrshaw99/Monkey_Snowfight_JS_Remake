on(release, releaseOutside){
   if(clickAndHoldPause <= getTimer())
   {
      _parent._parent.localMonkey.cannon.mcSetPower.mcScale.stop();
      _parent._parent.localMonkey.cannon.mcSetPower.gotoAndStop(2);
      _parent._parent.localMonkey.cannon.mcSliderKnob.gotoAndStop(2);
      _parent._parent.localMonkey.cannon.mcAddSnow.gotoAndStop(2);
      _parent._parent.sendMove();
   }
   else
   {
      _parent._parent.scaleHasBeenReset = true;
      _parent._parent.localMonkey.cannon.mcSetPower.mcScale.gotoAndStop(1);
   }
}
