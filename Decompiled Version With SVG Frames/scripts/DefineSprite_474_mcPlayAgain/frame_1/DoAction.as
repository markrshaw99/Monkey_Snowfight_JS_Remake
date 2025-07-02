if(_parent.remoteMonkeyOutOfSnow)
{
   mcNoSnow._visible = true;
   mcNoSnow.gotoAndStop(2);
}
else if(_parent.localMonkeyOutOfSnow)
{
   mcNoSnow._visible = true;
   mcNoSnow.gotoAndStop(1);
}
else
{
   mcNoSnow._visible = false;
}
stop();
