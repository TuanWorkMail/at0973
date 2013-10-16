





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
    if(hostID=='none') {
        hostID = client.id;
        this.emit("host", { host: true });
        client.join('authenticated');
        util.log('remote host connected, id: '+client.id);
    } else {
        this.emit("host", { host: false });
    }

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
    client.on("end match", onEndMatch);

    // Listen for key down message
    client.on("key down", onKeyDown);

    // Listen for moving player message
    client.on("moving player", onMovingPlayer);

    // Listen for key up message
    client.on("key up", onKeyUp);
};

// Socket client has disconnected
function onClientDisconnect() {

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
    this.broadcast.to('authenticated').emit("new player", { id: this.id, userID: data.userID, username: data.username });

};

// Player has moved
function onMovePlayer(data) {
    if(hostID!=this.id) util.log('warning: move player send by player, not host');
    // Broadcast updated position to connected socket clients
    this.broadcast.to('authenticated').emit("move player", { id: data.id, username: data.username, x: data.x, y: data.y, direction: data.direction });
};

// Lasers has moved
function onNewLasers(data) {
    // Broadcast updated position to connected socket clients
    this.broadcast.to('authenticated').emit("new lasers", { id: data.id, x: data.x, y: data.y, direction: data.direction });
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
        if (err) util.log(err);
        else {
            //debug
            //util.log(query.sql);
            if (rows.length == 0) {
                //debug
                //util.log('wrong username or password');
                that.emit("login", { username: 'failed' });
            } else {
                //debug
                //util.log('user logon: ' + rows[0].Username);
                //util.log(helper.createUUID());
                that.emit("login", { username: rows[0].Username, userID: rows[0].ID });
                //that.broadcast.to('authenticated').emit("temporary message", { userID: rows[0].ID, uuid: helper.createUUID() });
                that.join('authenticated');
            }
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
function onEndMatch(data) {
    //this.broadcast.to('authenticated').emit("end match", { hello: 'world' });
    var mysql = require('mysql'),
        connection = mysql.createConnection({
            host: 'localhost',
            port: '3306',
            user: 'root',
            password: '',
            database: 'tank5'
        });

    var that = this,
        wonID,
        point = data.score1-data.score2;

    connection.connect();

    if(data.score1-data.score2>0)
        wonID= data.id1;
    else if(data.score2-data.score1>0)
        wonID=data.id2;
    else {
        util.log('no winner specify, app error, not stored on database');
        return;
    }

    connection.query('INSERT INTO `tank5`.`matchhistory`(`Competitor1`,`Competitor2`,`PointLeft`)VALUES(?,?,?);', [data.id1,data.id2,point], function (err, rows, fields) {
        if (err) util.log(err);
    });

    connection.query('UPDATE `tank5`.`user` SET `Won` = `Won`+1 WHERE `ID` = ?;', [wonID], function (err, rows, fields) {
        if (err) util.log(err);
    });

    connection.end();
}

// Key Down
function onKeyDown(data) {
    if (hostID == 'none') return;
    this.broadcast.to('authenticated').emit("key down", { id: this.id, move: data.move, shoot: data.shoot });
}

// Moving player
function onMovingPlayer(data) {
    this.broadcast.to('authenticated').emit("moving player", { id: data.id, direction: data.direction });
}

// Key Down
function onKeyUp(data) {
    if (hostID == 'none') return;
    this.broadcast.to('authenticated').emit("key up", { id: this.id });
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