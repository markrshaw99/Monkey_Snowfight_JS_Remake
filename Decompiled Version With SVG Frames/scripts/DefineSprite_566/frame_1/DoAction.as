var isRunLocally = this.createEmptyMovieClip("mcLobby",this.getNextHighestDepth());
if(_url.indexOf("file://") > -1)
{
   trace(" [G] Loaded local copy of lobby.");
   mcLobby.loadMovie("../Multiplayer Lobby/lobby.swf");
}
else
{
   trace(" [G] Loaded external copy of lobby.");
   mcLobby.loadMovie("/swfcontent/lobby.swf?cacheBuster=v0.1");
}
stop();
