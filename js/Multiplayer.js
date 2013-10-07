
/**************************************************
** GAME EVENT HANDLERS
**************************************************/
var setSocketEventHandlers = function() {
	// Keyboard
	//window.addEventListener("keydown", onKeydown, false);
	//window.addEventListener("keyup", onKeyup, false);

	// Socket connection successful
	socket.on("connect", onSocketConnected);

	// Socket disconnection
	socket.on("disconnect", onSocketDisconnect);

	// New player message received
	socket.on("new player", onNewPlayer);

	// Player move message received
	socket.on("move player", onMovePlayer);
	
	// Lasers move message received
	socket.on("new lasers", onNewLasers);

	// Player removed message received
	socket.on("remove player", onRemovePlayer);

    // Bot broadcast message received
	socket.on("bot broadcast", onBotBroadcast);

    // Bot die message received
	socket.on("bot die", onBotDie);

    // Bot die message received
	socket.on("login", onLogin);

    // Testing message received
	socket.on("test", onTest);
};

// Socket connected
function onSocketConnected() {
	console.log("Connected to socket server");
	console.log("ID: " + this.socket.sessionid);

    //if host send a message to server
	if (host) {
	    socket.emit("host", { hello: 'world' });
	} else {
	    // Send local player data to the game server
	    socket.emit("new player", { hello: 'world' });
	}
};

// Socket disconnected
function onSocketDisconnect() {
	console.log("Disconnected from socket server");
};

// New player
function onNewPlayer(data) {
    if (!host) return;
    if (playerById(data.id) != false) {
        util.log('player ' + data.id + ' existed');
        return;
    } 
	console.log("New player connected: "+data.id);

	// Initialise the new player
	var newPlayer = new dto.Player(data.id, data.x, data.y, data.direction);

	// Add new player to the remote players array
	remotePlayers.push(newPlayer);
};

// Move player
function onMovePlayer(data) {
	var movePlayer = playerById(data.id);

	// Player not found
	if (!movePlayer) {
		console.log("Move: Player not found: "+data.id);
		return;
	};

	// Update player position
	movePlayer.setX(data.x);
	movePlayer.setY(data.y);
	movePlayer.setDirection(data.direction);
};

// Move lasers
function onNewLasers(data) {
	//add new lasers
    var newBullet = new Bullet(data.x, data.y, data.direction, false);
    lasers.push(newBullet);
};

// Remove player
function onRemovePlayer(data) {
	var removePlayer = playerById(data.id);

	// Player not found
	if (!removePlayer) {
		console.log("Remove: Player not found: "+data.id);
		return;
	};

	// Remove player from array
	remotePlayers.splice(remotePlayers.indexOf(removePlayer), 1);
};

// Bot broadcast
function onBotBroadcast(data) {
    var bot = botById(data.count);
    if (bot!=false) {
        bot.setX(data.x);
        bot.setY(data.y);
        bot.direction=data.direction;
        bot.type = data.type;
        return;
    }
    var newBot = new Bot(data.count, data.x, data.y, data.type);
    newBot.direction = data.direction;
    remoteBots.push(newBot);
};

// Bot die
function onBotDie(data) {
    var bot = botById(data.count);
    if (bot!=false) {
        for (var i = 0; i < remoteBots.length; i++) {
            if (remoteBots[i].id == data.count)
                remoteBots.splice(i, 1);
        };
        return;
    }
    console.log('bot '+data.count+' not found');
}; 

// Bot die
function onLogin(data) {
    var string = '<br/>';
    if (data.uuid == 'failed') {
        string += 'wrong username or password';
    } else {
        string += 'UUID: ' + data.uuid;
    }
    document.getElementById('tile').innerHTML += string;
};

// Testing
function onTest(data) {
    console.log(data.test);
};

/**************************************************
 ** BOT FINDER FUNCTION
 **************************************************/
// Find bot by ID
function botById(id) {
    for (var i = 0; i < remoteBots.length; i++) {
        if (remoteBots[i].id == id)
            return remoteBots[i];
    };
    return false;
};

//add new bot to the array
function createRemoteBot() {
    if (whereSpawn == enemiesGroup.length) {
        whereSpawn = 0;
    }
    while (bots.length < maximumBot && whereSpawn < enemiesGroup.length) {
        // Initialise the new bot
        var x = enemiesGroup[whereSpawn].x;
        y = enemiesGroup[whereSpawn].y;
        newBot = new Bot(x, y, botRandomPath(x, y), 0);
        // Add new player to the remote players array
        bots.push(newBot);
        whereSpawn++;
    }
}

/**************************************************
** GAME FINDER FUNCTIONS
**************************************************/
// Find player by ID
function playerById(id) {
	var i;
	for (i = 0; i < remotePlayers.length; i++) {
		if (remotePlayers[i].getID() == id)
			return remotePlayers[i];
	};
	return false;
};

/**************************************************
** GAME UPDATE
**************************************************/
function updatePlayer() {
	// Update local player and check for change
		if (rightKey || leftKey || upKey || downKey) {
			// Send local player data to the game server
			socket.emit("move player", {x: ship_x, y: ship_y, direction: direction});
		}
};



