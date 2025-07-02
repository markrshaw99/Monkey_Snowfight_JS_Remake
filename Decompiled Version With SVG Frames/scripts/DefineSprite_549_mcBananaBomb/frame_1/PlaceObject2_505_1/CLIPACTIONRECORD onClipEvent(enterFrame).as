onClipEvent(enterFrame){
   if(_parent.localMonkey.toTheLeft)
   {
      this._rotation -= 30;
   }
   else if(!_parent.localMonkey.toTheLeft)
   {
      this._rotation += 30;
   }
}
