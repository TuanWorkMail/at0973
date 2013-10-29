
/**************************************************
** GAME EVENT HANDLERS
**************************************************/
var setSocketEventHandlers = function() {
	// Keyboard
	//window.addEventListener("keydown", onKeydown, false);
	//window.addEventListener("keyup", onKeyup, false);

    // CLIENT ONLY
	socket.on("connect", onSocketConnected);
	socket.on("disconnect", onSocketDisconnect);
	socket.on("move player", onMovePlayer);
	socket.on("new lasers", onNewLasers);
	socket.on("remove player", onRemovePlayer);
	socket.on("bot broadcast", onBotBroadcast);
	socket.on("bot die", onBotDie);
	socket.on("login", onLogin);
	socket.on("test", onTest);
	socket.on("register", onRegister);
	socket.on("end match", onEndMatch);
    socket.on("host", onHost);
    socket.on("moving player", onMovingPlayer);
    socket.on("temporary message", onTemp);

    //SERVER ONLY
    socket.on("new player", onNewPlayer);
    //addNewPlayer()
    socket.on("input", onInput);
    socket.on("key down", onKeyDown);
    socket.on("key up", onKeyUp);
};

// Socket connected
function onSocketConnected() {
    console.log("Connected to socket server");
    console.log("ID: " + this.socket.sessionid);

    //if host send a message to server
    /*
    if (host)
        socket.emit("host", { host: host });
    else {
        // Send local player data to the game server
        socket.emit("new player", { hello: 'world' });
    }
    */
}

// Socket disconnected
function onSocketDisconnect() {
	console.log("Disconnected from socket server");
}

// New player
function onNewPlayer(data) {
    if (!host) return;

    //where to spawn ship
    var objGroup = tmxloader.map.objectgroup['spawn'].objects;
    var x = objGroup[playerLength % objGroup.length].x,
        y = objGroup[playerLength % objGroup.length].y,
        direction;
    if (playerLength % objGroup.length == 0)
        direction = 'up';
    else
        direction = 'down';
    var player = addNewPlayer(data.id, data.username, x, y, direction);
    player.setUserID(data.userID);
    console.log('new player userID: '+data.userID+' and username: '+data.username);
    socket.emit("move player", { id: data.id, username: data.username, x: x, y: y, direction: direction });
    playerLength++;
}

//add new player to array
function addNewPlayer(id, username, x, y, direction) {
    console.log("New player connected: " + id);

    // Initialise the new player
    var newPlayer = new dto.Player(x, y, direction);
    newPlayer.setSocketID(id);
    newPlayer.setUsername(username);

    // Add new player to the remote players array
    remotePlayers.push(newPlayer);

    for(var i=0;i<remotePlayers.length;i++)
        if(remotePlayers[i].getUsername()==username)
            return remotePlayers[i];
    return false;
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
function onNewLasers(data) {
	//add new lasers
    var newBullet = new Bullet(data.id, data.x, data.y, data.direction, false);
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
}

// Bot die
function onBotDie(data) {
    var bot = botById(data.count);
    if (bot!=false) {
        for (var i = 0; i < remoteBots.length; i++) {
            if (remoteBots[i].id == data.count)
                remoteBots.splice(i, 1);
        }
        return;
    }
    console.log('bot '+data.count+' not found');
}

// Login
function onLogin(data) {
    var string = '<br/>';
    if (data.uuid == 'failed') {
        string += 'wrong username or password';
    } else {
        if(!host) socket.emit("new player", { username: data.username, userID: data.userID });
        string += 'login successfully';
        document.getElementById('login').style.display = 'none';
    }
    document.getElementById('tile').innerHTML += string;
}

// Testing
function onTest(data) {
    console.log(data.test);
}

// Register
function onRegister(data) {
    var string = '<br/>' + data.result;
    document.getElementById('tile').innerHTML += string;
}

// Input
function onInput(data) {
    if (!host) return;
    var player = playerById(data.id);
    if (!player) {
        console.log('Input: player not found');
        return;
    }
    switch (data.move) {
        case 'right':
            player.setDirection('right');
            player.setX(player.getX() + player.getSpeed());
            if (mapCollision(player.getX(), player.getY(), player.getWidth(), player.getHeight(), 'tank')) {
                player.setX(player.getX() - player.getSpeed());
            }
            break;
        case 'left':
            player.setDirection('left');
            player.setX(player.getX() - player.getSpeed());
            if (mapCollision(player.getX(), player.getY(), player.getWidth(), player.getHeight(), 'tank')) {
                player.setX(player.getX() + player.getSpeed());
            }
            break;
        case 'up':
            player.setDirection('up');
            player.setY(player.getY() - player.getSpeed());
            if (mapCollision(player.getX(), player.getY(), player.getWidth(), player.getHeight(), 'tank')) {
                player.setY(player.getY() + player.getSpeed());
            }
            break;
        case 'down':
            player.setDirection('down');
            player.setY(player.getY() + player.getSpeed());
            if (mapCollision(player.getX(), player.getY(), player.getWidth(), player.getHeight(), 'tank')) {
                player.setY(player.getY() - player.getSpeed());
            }
            break;
    }
    socket.emit("move player", { id: data.id, username: player.getUsername(), x: player.getX(), y: player.getY(), direction: data.move });
}

// End
function onEndMatch(data) {
    alive = false;
}

// Host
function onHost(data) {
    if(host != 'none') return;
    host = data.host;
    console.log('host message received! running game loop');
    gameLoop();
}

// Key Down
function onKeyDown(data) {
    if (!host) return;
    var player = playerById(data.id);
    if (!player) {
        console.log('key down: player not found');
        return;
    }
    switch (data.move) {
        case 'right':
            player.setDirection('right');
            break;
        case 'left':
            player.setDirection('left');
            break;
        case 'up':
            player.setDirection('up');
            break;
        case 'down':
            player.setDirection('down');
            break;
    }
    player.setMoving(true);
    socket.emit("moving player", { id: data.id, direction: data.move });
}

// Moving player
function onMovingPlayer(data) {
    if(host) return;
    var player = playerById(data.id);
    if (!player) {
        console.log('Moving: player not found');
        return;
    }
    player.setDirection(data.direction);
    player.setMoving(true);
}

// Key Up
function onKeyUp(data) {
    if (!host) return;
    var player = playerById(data.id);
    if (!player) {
        console.log('key up: player not found');
        return;
    }
    player.setMoving(false);
    socket.emit("move player", { id: data.id, username: player.getUsername(), x: player.getX(), y: player.getY(), direction: player.getDirection() });
}

function onTemp(data) {
    if(!host) return;

}

/**************************************************
 ** BOT FINDER FUNCTION
 **************************************************/
// Find bot by ID
function botById(id) {
    for (var i = 0; i < remoteBots.length; i++) {
        if (remoteBots[i].id == id)
            return remoteBots[i];
    }
    return false;
}

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




