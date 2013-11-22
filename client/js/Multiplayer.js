
var mySocketID,
    serverURL = 'localhost',
    //serverURL = '125.212.217.58',
    //serverURL = 'tuan.sytes.net',
    socket;         //Add the socket variable to the file


//io.connect will connect you to a Socket.IO server by using
//the first parameter as the server address.
socket = io.connect(serverURL, { port: 8000, transports: ["websocket"] });

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
	socket.on("end match", onEndMatch);
    socket.on("moving player", onMovingPlayer);
    socket.on("shoot brick", onShootBrick);
    socket.on("new drop", onNewDrop);
    socket.on("collide drop", onCollideDrop);
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
    for(var i=0; i<data.alluser.length; i++) {
        alluser += '<tr>';
        alluser += '<td>'+data.alluser[i].Username+'</td>';
        alluser += '<td>'+data.alluser[i].Won+'</td>';
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
	    addNewPlayer(data.id, data.username, data.x, data.y, data.direction);
		return;
	}

	// Update player position
	movePlayer.setX(data.x);
	movePlayer.setY(data.y);
	movePlayer.setDirection(data.direction);
    movePlayer.setMoving(false);
}

// Move lasers
function onNewBullet(data) {
	//add new lasers
    var newBullet = new Bullet(data.id, data.x, data.y, data.direction);
    newBullet.setOriginID(data.originID);
    newBullet.setType(data.bulletType);
    lasers.push(newBullet);
}

// Remove player
function onRemovePlayer(data) {
	var removePlayer = playerById(data.id);

	// Player not found
	if (!removePlayer) {
		console.log("Remove: Player not found: "+data.id);
		return;
	}

	// Remove player from array
	remotePlayers.splice(remotePlayers.indexOf(removePlayer), 1);
}

// Login
function onLogin(data) {
    if (typeof data.errormessage !== 'undefined' ) {
        document.getElementById('error-message').innerHTML = data.errormessage;
    } else {
        document.getElementById('login').style.display = 'none';
        document.getElementById('alluser').style.display = 'none';
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
function onEndMatch(data) {
    alive = false;
}

// Moving player
function onMovingPlayer(data) {
    var player = playerById(data.id);
    if (!player) {
        console.log('Moving: player not found');
        return;
    }
    player.setDirection(data.direction);
    player.setMoving(true);
}
function onShootBrick(data){
    var player = playerById(data.id);
    if (!player) {
        console.log('shoot brick: player not found');
        return;
    }
    player.setShootBrick(true);
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
    result.setBulletType(data.bulletType);
}
/**************************************************
** GAME FINDER FUNCTIONS
**************************************************/
// Find player by ID
function playerById(id) {
	var i;
	for (i = 0; i < remotePlayers.length; i++) {
		if (remotePlayers[i].getSocketID() == id)
			return remotePlayers[i];
	}
	
	return false;
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