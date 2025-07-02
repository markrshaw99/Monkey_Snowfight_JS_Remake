class mx.managers.PopUpManager
{
   var popUp;
   var setSize;
   var move;
   var modalWindow;
   var _parent;
   var _name;
   var _visible;
   var owner;
   static var version = "2.0.0.377";
   static var mixins = undefined;
   function PopUpManager()
   {
   }
   static function createModalWindow(parent, o, broadcastOutsideEvents)
   {
      var _loc2_ = parent.createChildAtDepth("Modal",mx.managers.DepthManager.kTopmost);
      _loc2_.setDepthBelow(o);
      o.modalID = _loc2_._name;
      _loc2_._alpha = _global.style.modalTransparency;
      _loc2_.tabEnabled = false;
      if(broadcastOutsideEvents)
      {
         _loc2_.onPress = mx.managers.PopUpManager.mixins.onPress;
      }
      else
      {
         _loc2_.onPress = mx.managers.PopUpManager.mixins.nullFunction;
      }
      _loc2_.onRelease = mx.managers.PopUpManager.mixins.nullFunction;
      _loc2_.resize = mx.managers.PopUpManager.mixins.resize;
      mx.managers.SystemManager.init();
      mx.managers.SystemManager.addEventListener("resize",_loc2_);
      _loc2_.resize();
      _loc2_.useHandCursor = false;
      _loc2_.popUp = o;
      o.modalWindow = _loc2_;
      o.deletePopUp = mx.managers.PopUpManager.mixins.deletePopUp;
      o.setVisible = mx.managers.PopUpManager.mixins.setVisible;
      o.getVisible = mx.managers.PopUpManager.mixins.getVisible;
      o.addProperty("visible",o.getVisible,o.setVisible);
   }
   static function createPopUp(parent, className, modal, initobj, broadcastOutsideEvents)
   {
      if(mx.managers.PopUpManager.mixins == undefined)
      {
         mx.managers.PopUpManager.mixins = new mx.managers.PopUpManager();
      }
      if(broadcastOutsideEvents == undefined)
      {
         broadcastOutsideEvents = false;
      }
      while(parent._parent != undefined)
      {
         parent = parent._parent;
      }
      initobj.popUp = true;
      var _loc3_ = parent.createClassChildAtDepth(className,!(broadcastOutsideEvents || modal) ? mx.managers.DepthManager.kTop : mx.managers.DepthManager.kTopmost,initobj);
      if(_root.focusManager != undefined)
      {
         _loc3_.createObject("FocusManager","focusManager",-1);
         if(_loc3_._visible == false)
         {
            mx.managers.SystemManager.deactivate(_loc3_);
         }
      }
      if(modal)
      {
         mx.managers.PopUpManager.createModalWindow(parent,_loc3_,broadcastOutsideEvents);
      }
      else
      {
         if(broadcastOutsideEvents)
         {
            _loc3_.mouseListener = new Object();
            _loc3_.mouseListener.owner = _loc3_;
            _loc3_.mouseListener.onMouseDown = mx.managers.PopUpManager.mixins.onMouseDown;
            Mouse.addListener(_loc3_.mouseListener);
         }
         _loc3_.deletePopUp = mx.managers.PopUpManager.mixins.deletePopUp;
      }
      return _loc3_;
   }
   function onPress(Void)
   {
      if(this.popUp.hitTest(_root._xmouse,_root._ymouse,false))
      {
         return undefined;
      }
      this.popUp.dispatchEvent({type:"mouseDownOutside"});
   }
   function nullFunction(Void)
   {
   }
   function resize(Void)
   {
      var _loc2_ = mx.managers.SystemManager.screen;
      this.setSize(_loc2_.width,_loc2_.height);
      this.move(_loc2_.x,_loc2_.y);
   }
   function deletePopUp(Void)
   {
      if(this.modalWindow != undefined)
      {
         this._parent.destroyObject(this.modalWindow._name);
      }
      this._parent.destroyObject(this._name);
   }
   function setVisible(v, noEvent)
   {
      super.setVisible(v,noEvent);
      this.modalWindow._visible = v;
   }
   function getVisible(Void)
   {
      return this._visible;
   }
   function onMouseDown(Void)
   {
      if(!this.owner.hitTest(_root._xmouse,_root._ymouse,false))
      {
         this.owner.mouseDownOutsideHandler(this.owner);
      }
   }
}
