





//                      RESTART for changes to applied                RESTART THE SERVER






/**************************************************
** NODE.JS REQUIREMENTS
**************************************************/
var util = require("util"),					// Utility resources (logging, object inspection, etc)
	io = require("socket.io"), 			    // Socket.IO
    helper = require("./helper"),
    host = 'remote';                        //if server host or use remote host
    
// if remote host server
if (host == 'remote') {
    var hostID = 'none';
    util.log('remote host');
} else {
    util.log('local host');
}

/**************************************************
** GAME VARIABLES
**************************************************/
var socket,		            // Socket controller
    host;                   // if there already a host or not

/**************************************************
** GAME INITIALISATION
**************************************************/
function init() {

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

    // Listen for bot die message
    client.on("login", onLogin);

    // Listen for testing message
    client.on("test", onTest);

    // if remote host listen for host ack
    client.on("host", onHost);

    // Listen for bot die message
    client.on("register", onRegister);

    // Listen for input message
    client.on("input", onInput);

    // Listen for end message
    client.on("end", onEnd);
};

// Socket client has disconnected
function onClientDisconnect() {
    util.log("Player has disconnected: " + this.id);

    if (this.id == hostID) {
        hostID = 'none';
        util.log('host disconnected, waiting for another one');
    }

    // Broadcast removed player to connected socket clients
    this.broadcast.to('authenticated').emit("remove player", { id: this.id });
};

// New player has joined
function onNewPlayer(data) {
    // Broadcast new player to connected socket clients
    this.broadcast.to('authenticated').emit("new player", { id: this.id });

};

// Player has moved
function onMovePlayer(data) {

    // Broadcast updated position to connected socket clients
    this.broadcast.to('authenticated').emit("move player", { id: data.id, x: data.x, y: data.y, direction: data.direction });
};

// Lasers has moved
function onNewLasers(data) {
    // Broadcast updated position to connected socket clients
    this.broadcast.to('authenticated').emit("new lasers", { id: this.id, x: data.x, y: data.y, direction: data.direction });
};

//broadcast bot
function onBotBroadcast(data) {
    this.broadcast.to('authenticated').emit("bot broadcast", { count: data.count, x: data.x, y: data.y, direction: data.direction, type: data.type });
    //util.log('length ' + data.length + ';bot ' + data.bot + ';x ' + data.x + ';y ' + data.y);
}

// Bot die
function onBotDie(data) {
    this.broadcast.to('authenticated').emit("bot die", { count: data.count });
    //util.log('length ' + data.length + ';bot ' + data.bot + ';x ' + data.x + ';y ' + data.y);
}

// Login
function onLogin(data) {
    var mysql = require('mysql'),
        connection = mysql.createConnection({
            host: 'localhost',
            port: '3306',
            user: 'root',
            password: '',
            database: 'tank5'
        });

    var that = this;

    connection.connect();

    var query = connection.query('SELECT * FROM user where Username = ? and Password = ?', [data.username, data.password], function (err, rows, fields) {
        if (err) throw err;
        //debug
        //util.log(query.sql);
        if (rows.length == 0) {
            //debug
            //util.log('wrong username or password');
            that.emit("login", { uuid: 'failed' });
        } else {
            //debug
            //util.log('user logon: ' + rows[0].Username);
            //util.log(helper.createUUID());
            that.emit("login", { uuid: helper.createUUID() });
            that.join('authenticated');
        }
    });

    connection.end();

}

// Testing
function onTest(data) {
    this.emit("test", { test: data.test });
}

// remote host, not locally
function onHost(data) {
    if (host == 'local') {
        util.log('received rogue host message');
        return;
    } else if (hostID != 'none') {
        util.log('received another host message, keep old, discard this one');
        return;
    }
    hostID = this.id;
    util.log('remote host connected with ID: ' + hostID);
    this.join('authenticated');
}

// Login
function onRegister(data) {
    var mysql = require('mysql'),
        connection = mysql.createConnection({
            host: 'localhost',
            port: '3306',
            user: 'root',
            password: '',
            database: 'tank5'
        });

    var that = this;

    connection.connect();

    var query = connection.query('INSERT INTO `tank5`.`user`(`Username`,`Password`, `Won`)VALUES(?,?,0);', [data.username, data.password], function (err, rows, fields) {
        if (err) that.emit("register", { result: 'username already existed' });
        else
            that.emit("register", { result: 'register successfully' });
    });
    connection.end();
}

// Input
function onInput(data) {
    if (hostID == 'none') return;
    this.broadcast.to('authenticated').emit("input", { id: this.id, move: data.move, shoot: data.shoot });
}

// End
function onEnd(data) {
    this.broadcast.to('authenticated').emit("end", { hello: 'world' });

}

/**************************************************
** PROCESS QUERY
**************************************************/
function queryDatabase(query, arrayOfPara) {

}

/**************************************************
** RUN THE GAME
**************************************************/
init();