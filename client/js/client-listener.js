
var mySocketID,
    serverURL = 'localhost',
    //serverURL = '125.212.217.58',
    //serverURL = 'tuan.sytes.net',
    socket,         //Add the socket variable to the file
    lastUpScore = 30,
    lastDownScore = 30;


//io.connect will connect you to a Socket.IO server by using
//the first parameter as the server address.
socket = io.connect(serverURL, { port: 8000 });

/**************************************************
** GAME EVENT HANDLERS
**************************************************/
function setSocketEventHandlers() {
	socket.on("connect", onSocketConnected);
    socket.on("start", onStart);
	socket.on("disconnect", onSocketDisconnect);
	socket.on("move player", onMovePlayer);
	socket.on("new bullet", onNewBullet);
	socket.on("remove player", onRemovePlayer);
	socket.on("bot broadcast", onBotBroadcast);
	socket.on("bot die", onBotDie);
	socket.on("login", onLogin);
	socket.on("register", onRegister);
	socket.on("reset", onReset);
    socket.on("moving player", onMovingPlayer);
    socket.on("new drop", onNewDrop);
    socket.on("collide drop", onCollideDrop);
    socket.on("start count down", onStartCountdown);
    socket.on("team score", onTeamScore);
    socket.on("destroy brick", onDestroyBrick);
    socket.on("hide popup", onHidePopup);
};
function onSocketConnected() {
    debug.log("Connected to socket server");
    debug.log("ID: " + this.socket.sessionid);
    mySocketID = this.socket.sessionid;
}
function onStart(data) {
    tmxloader.load("../common/map/" + data.map + ".tmx");
    var alluser = '';
    alluser += '<table><tr><th>Username</th><th>Won</th></tr>';
    for(var i=0; i<data.all_user.length; i++) {
        alluser += '<tr>';
        alluser += '<td>'+data.all_user[i].Username+'</td>';
        alluser += '<td>'+data.all_user[i].Won+'</td>';
        alluser += '</tr>';
    }
    alluser += '</table>';
    document.getElementById('alluser').innerHTML = alluser;
    tank5.main.init();
}
function onSocketDisconnect() {
	debug.log("Disconnected from socket server");
}

// Move player
function onMovePlayer(data) {
    var movePlayer = playerById(data.id);
	// Player not found
	if (!movePlayer) {
	    var newPlayer = addNewPlayer(data.id, data.username, data.x, data.y, data.direction).newPlayer;
        newPlayer.setTeamName(data.team);
		return;
	}
    movePlayer = movePlayer.players;
	movePlayer.setX(data.x);
	movePlayer.setY(data.y);
	movePlayer.setDirection(data.direction);
    movePlayer.setMoving(false);
}

// Move lasers
function onNewBullet(data) {
	//add new lasers
    shooting(data.x, data.y, data.direction, data.originID, data.id);
}

// Remove player
function onRemovePlayer(data) {
	var removePlayer = playerById(data.id);
	if (!removePlayer) {
		debug.log("Remove: Player not found: "+data.id);
		return;
	}
	remotePlayers.splice(remotePlayers.indexOf(removePlayer.players), 1);
}

// Login
function onLogin(data) {
    if (typeof data.error !== 'undefined' ) {
        document.getElementById('error-message').innerHTML = data.error;
    } else {
        document.getElementById('login').style.display = 'none';
        //document.getElementById('alluser').style.display = 'none';
        document.getElementById('alluser').innerHTML = '<b>Team Green:</b> 30 | <b>Team Yellow</b> 30';
        showStartScreen = true;
    }
}
// Register
function onRegister(data) {
    document.getElementById('registererror').innerHTML = data.result;
}

// End
function onReset(data) {
    debug.log('reset!');
    remoteBots.length = 0;
    lasers.length = 0;
    clone2DArray(layerByName('destructible').data, session.getDestructible());
    clone2DArray(layerByName('indestructible').data, session.getIndestructible());
    //alive = false;
}

// Moving player
function onMovingPlayer(data) {
    var player = playerById(data.id);
    if (!player) {
        debug.log('Moving: player not found');
        return;
    }
    player.players.setDirection(data.direction);
    player.players.setMoving(true);
}
function onNewDrop(data) {
    var newDrop = new Drop(data.id, data.type, data.x, data.y);
    session.getDrop().push(newDrop);
}
function onCollideDrop(data) {
    var drops = session.getDrop();
    for(var i=0;i<drops.length;i++){
        if(drops[i].getID()===data.dropID)
            drops.splice(i,1);
    }
    var result = playerById(data.socketID);
    if(!result) {
        debug.log('collide drop: player not found');
        return;
    }
    result.players.setBulletType(data.bulletType);
}
function onTeamScore(data){
    var down = 30,
        up = 30;
    switch (data.team){
        case 'up':
            up -= data.score;
            down = lastDownScore;
            lastUpScore = up;
            break;
        case 'down':
            up = lastUpScore;
            down -= data.score;
            lastDownScore = down;
            break;
    }
    document.getElementById('alluser').innerHTML = '<b>Team Green:</b> '+down+' | <b>Team Yellow</b> '+up;
}
function onDestroyBrick(data){
    var array = [];
    if(typeof data.name === 'undefined'){
        array.push(session.getDestructible());
        array.push(session.getIndestructible());
    }
    else if(data.name==='destructible') array.push(session.getDestructible());
    else array.push(session.getIndestructible());
    var receiveArray = data.array;
    for(var j=0;j<array.length;j++){
        for(var i=0; i<receiveArray.length; i++){
            array[j][receiveArray[i][0]][receiveArray[i][1]] = 0;
        }
    }
}
function onHidePopup(){
    document.getElementById('waiting').style.display = 'none';
}
// Find player by username
function playerByUsername(username) {
    var i;
    for (i = 0; i < remotePlayers.length; i++) {
        if (remotePlayers[i].getUsername() == username)
            return remotePlayers[i];
    }

    return false;
}