
/**************************************************
** GAME EVENT HANDLERS
**************************************************/
var setEventHandlers = function() {
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
	socket.on("move lasers", onMoveLasers);

	// Player removed message received
	socket.on("remove player", onRemovePlayer);
};

// Socket connected
function onSocketConnected() {
	console.log("Connected to socket server");

	// Send local player data to the game server
	socket.emit("new player", {x: ship_x, y: ship_y, direction: direction});
};

// Socket disconnected
function onSocketDisconnect() {
	console.log("Disconnected from socket server");
};

// New player
function onNewPlayer(data) {
	console.log("New player connected: "+data.id);

	// Initialise the new player
	var newPlayer = new Player(data.x, data.y, data.direction);
	newPlayer.id = data.id;

	// Add new player to the remote players array
	remotePlayers.push(newPlayer);
};

// Move player
function onMovePlayer(data) {
	var movePlayer = playerById(data.id);

	// Player not found
	if (!movePlayer) {
		console.log("Player not found: "+data.id);
		return;
	};

	// Update player position
	movePlayer.setX(data.x);
	movePlayer.setY(data.y);
	movePlayer.setDirection(data.direction);
};

// Move lasers
function onMoveLasers(data) {
	var movePlayer = playerById(data.id);

	// Player not found
	if (!movePlayer) {
		console.log("Player not found: "+data.id);
		return;
	};
	
		//add new lasers
		if (data.direction==0) {
			lasers.push([data.x + 25, data.y, 0]);
		} else if (data.direction==2) {
			lasers.push([data.x + 25, data.y + 50, 2]);
		} else if (data.direction==1) {
			lasers.push([data.x + 50, data.y + 20, 1]);
		} else if (data.direction==-1) {
			lasers.push([data.x - 20, data.y + 20, -1]);
		}
};

// Remove player
function onRemovePlayer(data) {
	var removePlayer = playerById(data.id);

	// Player not found
	if (!removePlayer) {
		console.log("Player not found: "+data.id);
		return;
	};

	// Remove player from array
	remotePlayers.splice(remotePlayers.indexOf(removePlayer), 1);
};

/**************************************************
** GAME FINDER FUNCTIONS
**************************************************/
// Find player by ID
function playerById(id) {
	var i;
	for (i = 0; i < remotePlayers.length; i++) {
		if (remotePlayers[i].id == id)
			return remotePlayers[i];
	};
	
	return false;
};

/**************************************************
** GAME UPDATE
**************************************************/
function update() {
	// Update local player and check for change
		if (rightKey || leftKey || upKey || downKey) {
			// Send local player data to the game server
			socket.emit("move player", {x: ship_x, y: ship_y, direction: direction});
		}
};

//Runs a couple of loops to see if any of the lasers have hit any of the enemies
function hitTest() {
  var ship_xw = ship_x + ship_w,
      ship_yh = ship_y + ship_h,
	  laserNewCor;
  for (var i = 0; i < lasers.length; i++) {
	if (lasers[i][2] == 0 || lasers[i][2] == -1) {
      if (lasers[i][1] <= ship_yh && lasers[i][1] >= ship_y && lasers[i][0] >= ship_x && lasers[i][0] <= ship_xw) {
        checkLives();
		// Send local player data to the game server
		socket.emit("move player", {x: ship_x, y: ship_y});
      }
    } else if (lasers[i][2] == 1) {//right
	  //shift laser_x to face right
	  laserNewCor = lasers[i][0] + 4;
	  if (lasers[i][1] <= ship_yh && lasers[i][1] >= ship_y && laserNewCor >= ship_x && laserNewCor <= ship_xw) {
        checkLives();
		// Send local player data to the game server
		socket.emit("move player", {x: ship_x, y: ship_y});
      }
	} else if (lasers[i][2] == 2) {//down
	  //shift laser_y to face downward
	  laserNewCor = lasers[i][1] + 4;
	  if (laserNewCor <= ship_yh && laserNewCor >= ship_y && lasers[i][0] >= ship_x && lasers[i][0] <= ship_xw) {
        checkLives();
		// Send local player data to the game server
		socket.emit("move player", {x: ship_x, y: ship_y});
      }
	}
  }
}
