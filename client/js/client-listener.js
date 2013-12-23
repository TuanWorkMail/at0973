
var mySocketID,
    serverURL = 'localhost',
    //serverURL = '125.212.217.58',
    //serverURL = 'tuan.sytes.net',
    socket;         //Add the socket variable to the file


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
	socket.on("test", onTest);
	socket.on("register", onRegister);
	socket.on("reset", onReset);
    socket.on("moving player", onMovingPlayer);
    socket.on("new drop", onNewDrop);
    socket.on("collide drop", onCollideDrop);
    socket.on("start count down", onStartCountDown);
};
function onSocketConnected() {
    console.log("Connected to socket server");
    console.log("ID: " + this.socket.sessionid);
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
	console.log("Disconnected from socket server");
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
		console.log("Remove: Player not found: "+data.id);
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
        document.getElementById('alluser').style.display = 'none';
        showStartScreen = true;
    }
}

// Testing
function onTest(data) {
    console.log(data.test);
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
    var destructible = [], indestructible = [];
    clone2DArray(layerByName('destructible').data, destructible);
    clone2DArray(layerByName('indestructible').data, indestructible);
    session.setDestructible(destructible);
    session.setIndestructible(indestructible);
    //alive = false;
}

// Moving player
function onMovingPlayer(data) {
    var player = playerById(data.id);
    if (!player) {
        console.log('Moving: player not found');
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
        console.log('collide drop: player not found');
        return;
    }
    result.players.setBulletType(data.bulletType);
}
var countdown = 5;
function onStartCountDown(){
    startCountdown();
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