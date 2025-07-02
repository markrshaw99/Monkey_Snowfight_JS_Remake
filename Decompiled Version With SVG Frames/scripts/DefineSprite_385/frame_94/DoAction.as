if(_parent._parent.localMonkey.snowpile.snowWeight > 0)
{
   _parent._parent.localMonkey.cannon.mcSetPower.gotoAndStop(1);
}
if(_parent._parent.localMonkey.snowpile.snowWeight >= 10 or _parent._parent.localMonkey.snowpile.outOfSnow)
{
   _parent._parent.localMonkey.cannon.mcAddSnow.gotoAndStop(2);
}
else
{
   _parent._parent.localMonkey.cannon.mcAddSnow.gotoAndStop(1);
}
gotoAndStop("idle");
