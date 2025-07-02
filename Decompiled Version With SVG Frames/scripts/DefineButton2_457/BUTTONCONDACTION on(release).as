on(release){
   var ob = new Object();
   ob.id = "z";
   _parent.es.sendMove([_parent.opponent],ob);
   _parent.joinRoom(_parent.activeRoom);
   MiniclipGameEvent("backToLobby");
   _parent.gotoAndStop("Lobby");
   this.removeMovieClip();
}
