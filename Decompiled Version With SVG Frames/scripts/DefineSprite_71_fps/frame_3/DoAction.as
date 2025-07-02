if(getTimer() > oneSecond)
{
   oneSecond = getTimer() + 1000;
   txtFPS = framesCounter;
   framesCounter = 0;
}
framesCounter++;
gotoAndPlay(_currentframe - 1);
