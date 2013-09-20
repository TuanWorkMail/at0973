





//                      RESTART for changes to applied                RESTART THE SERVER






/**************************************************
** NODE.JS REQUIREMENTS
**************************************************/
var util = require("util"),					// Utility resources (logging, object inspection, etc)
	io = require("socket.io"), 			    // Socket.IO
	Player = require("./Player").Player;	// Player class
    




/**************************************************
** GAME VARIABLES
**************************************************/
var socket,		            // Socket controller
    players, 	            // Array of connected players
    host;                   // if there already a host or not

/**************************************************
** GAME INITIALISATION
**************************************************/
function init() {
    // Create an empty array to store players
    players = [];

    host = false;

    // Set up Socket.IO to listen on port 8000
    socket = io.listen(8000);

    // Configure Socket.IO
    socket.configure(function () {
        // Only use WebSockets
        socket.set("transports", ["websocket"]);

        // Restrict log output
        socket.set("log level", 2);
    });

    // Start listening for events
    setEventHandlers();

};

/**************************************************
** GAME EVENT HANDLERS
**************************************************/
var setEventHandlers = function () {
    // Socket.IO
    socket.sockets.on("connection", onSocketConnection);
};

// New socket connection
function onSocketConnection(client) {
    util.log("New player has connected: " + client.id);

    // Listen for client disconnected
    client.on("disconnect", onClientDisconnect);

    // Listen for new player message
    client.on("new player", onNewPlayer);

    // Listen for move player message
    client.on("move player", onMovePlayer);

    // Listen for new lasers message
    client.on("new lasers", onNewLasers);

    // Listen for bot broadcast message
    client.on("bot broadcast", onBotBroadcast);

    // Listen for bot die message
    client.on("bot die", onBotDie);
};

// Socket client has disconnected
function onClientDisconnect() {
    util.log("Player has disconnected: " + this.id);

    var removePlayer = playerById(this.id);

    // Player not found
    if (!removePlayer) {
        util.log("Player not found: " + this.id);
        return;
    };

    // Remove player from players array
    players.splice(players.indexOf(removePlayer), 1);

    // Broadcast removed player to connected socket clients
    this.broadcast.emit("remove player", { id: this.id });
};

// New player has joined
function onNewPlayer(data) {
    // Create a new player
    var newPlayer = new Player(data.x, data.y);
    newPlayer.id = this.id;

    // Broadcast new player to connected socket clients
    this.broadcast.emit("new player", { id: newPlayer.id, x: newPlayer.getX(), y: newPlayer.getY() });

    // Send existing players to the new player
    var i, existingPlayer;
    for (i = 0; i < players.length; i++) {
        existingPlayer = players[i];
        this.emit("new player", { id: existingPlayer.id, x: existingPlayer.getX(), y: existingPlayer.getY() });
    };

    // Add new player to the players array
    players.push(newPlayer);
};

// Player has moved
function onMovePlayer(data) {
    // Find player in array
    var movePlayer = playerById(this.id);

    // Player not found
    if (!movePlayer) {
        util.log("Player not found: " + this.id);
        return;
    };

    // Update player position
    movePlayer.setX(data.x);
    movePlayer.setY(data.y);
    movePlayer.setDirection(data.direction);

    // Broadcast updated position to connected socket clients
    this.broadcast.emit("move player", { id: movePlayer.id, x: movePlayer.getX(), y: movePlayer.getY(), direction: data.direction });
};

// Lasers has moved
function onNewLasers(data) {
    // Find player in array
    var movePlayer = playerById(this.id);

    // Player not found
    if (!movePlayer) {
        util.log("Player not found: " + this.id);
        return;
    };

    // Broadcast updated position to connected socket clients
    this.broadcast.emit("new lasers", { id: movePlayer.id, x: data.x, y: data.y, direction: data.direction });
};

//broadcast bot
function onBotBroadcast(data) {
    this.broadcast.emit("bot broadcast", { count: data.count, x: data.x, y: data.y, direction: data.direction });
    //util.log('length ' + data.length + ';bot ' + data.bot + ';x ' + data.x + ';y ' + data.y);
}

// Bot die
function onBotDie(data) {
    this.broadcast.emit("bot die", { count: data.count });
    //util.log('length ' + data.length + ';bot ' + data.bot + ';x ' + data.x + ';y ' + data.y);
}

/**************************************************
** GAME HELPER FUNCTIONS
**************************************************/
// Find player by ID
function playerById(id) {
    var i;
    for (i = 0; i < players.length; i++) {
        if (players[i].id == id)
            return players[i];
    };

    return false;
};


/**************************************************
** COPY OF BotClass
**************************************************/
//begin to send bot over the air to client
//create a game loop similar to client on server side
//send bot coordinate to client
var maximumBot = 2,
    pathStart,
    pathStartX,
    pathStartY,
    pathEnd,
    thePath,
    thePathX,
    thePathY,
    c,//currently headed to which target in thePath
    //enemiesGroup,

    //grid = new PF.Grid(20, 20, world),
    //finder = new PF.AStarFinder(),
    //where bot will spawn, each map have a number of predefined point
    whereSpawn = 0;

function moveBot() {
    createBot();
    for (var bot = 0; bot < bots.length; bot++) {
        if (bots[bot].whereNow < bots[bot].pathFound.length - 1) {
            movingBot(bot);
            socket.emit("bot broadcast", { length: bots.length, bot: bot, x: bots[bot].getX(), y: bots[bot].getY() });
        } else {
            bots[bot].pathFound = botRandomPath(bots[bot].getX(), bots[bot].getY());
            bots[bot].whereNow = 0;
        }
    }
}
//add new bot to the array
function createBot() {
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
//input: current location
//output: array of path to a random point
function botRandomPath(x, y) {
    var check = true;
    while (check) {
        pathStart = [Math.floor(x / 32), Math.floor(y / 32)];
        var randomNumber = Math.floor(Math.random() * botDestination.length);
        pathEnd = [Math.floor(botDestination[randomNumber].x / 32), Math.floor(botDestination[randomNumber].y / 32)];
        if (pathStart[0] != pathEnd[0] || pathStart[1] != pathEnd[1]) {
            check = false;
        }
    }
    return pathFinder(world, pathStart, pathEnd);
}
function movingBot(bot) {
    var pixelX = bots[bot].pathFound[bots[bot].whereNow + 1][0] * tmxloader.map.tileWidth,
        pixelY = bots[bot].pathFound[bots[bot].whereNow + 1][1] * tmxloader.map.tileHeight,
        differenceX = bots[bot].getX() - pixelX,
        differenceY = bots[bot].getY() - pixelY;
    //go vertically
    if (differenceX == 0 && differenceY != 0) {
        //down or up
        if (differenceY > 0) {
            bots[bot].setY(bots[bot].getY() - enemySpeed);
        } else {
            bots[bot].setY(bots[bot].getY() + enemySpeed);
        }
        //go horizontally
    } else if (differenceY == 0 && differenceX != 0) {
        //right or left
        if (differenceX > 0) {
            bots[bot].setX(bots[bot].getX() - enemySpeed);
        } else {
            bots[bot].setX(bots[bot].getX() + enemySpeed);
        }
    } else {
        bots[bot].whereNow++;
    }
}


function hitTestBot() {
    var enemy_xw,
        enemy_yh,
        check = false;

    for (var i = 0; i < lasers.length; i++) {
        for (var obj = 0; obj < bots.length; ++obj) {

            enemy_xw = bots[obj][0] + enemy_w;
            enemy_yh = bots[obj][1] + enemy_h;

            if (lasers[i][0] < enemy_xw && lasers[i][1] < enemy_yh && lasers[i][0] > bots[obj][0] && lasers[i][1] > bots[obj][1]) {
                check = true;
                bots.splice(obj, 1);
                lasers.splice(i, 1);
            }
        }
    }
}


/**************************************************
** RUN THE GAME
**************************************************/
init();