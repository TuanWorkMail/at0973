// RESTART // RESTART // RESTART // RESTART // RESTART // RESTART // RESTART // RESTART // RESTART // RESTART // RESTART // RESTART // RESTART // RESTART // RESTART
//RESTART for changes to applied                                        RESTART for changes to applied                                  RESTART for changes to applied
// RESTART // RESTART // RESTART // RESTART // RESTART // RESTART // RESTART // RESTART // RESTART // RESTART // RESTART // RESTART // RESTART // RESTART // RESTART

var util = require("util"),					// Utility resources (logging, object inspection, etc)
    helper = require("./js/helper"),
    host = 'local',                        //if server host or use remote host
    hostID = '',
    botClass = require('./js/BotClass.js'),
    tmxloader = require('./js/TMX_Engine.js').tmxloader,
    socket = require('./js/socket').socket;		                            // Socket controller
//initializing.........
function init() {
    // if remote host server
    if (host == 'remote') {
        hostID = 'none';
        util.log('remote host');
    } else {
        util.log('local host');
    }
    // Start listening for events
    socket.on("connection", onSocketConnection);
    tmxloader.load(__dirname + '\\map\\classic2.tmx');
    setTimeout(loop, 1000/60);
}
function loop() {
    botClass.moveBot();

    setTimeout(loop, 1000/60);
}

function onSocketConnection(client) {
    if(hostID=='none') {
        hostID = client.id;
        this.emit("host", { host: true });
        client.join('authenticated');
        util.log('remote host connected, id: '+client.id);
    } else {
        this.emit("host", { host: false });
    }
    client.on("disconnect", onClientDisconnect);
    client.on("new player", onNewPlayer);
    client.on("move player", onMovePlayer);
    client.on("new lasers", onNewLasers);
    client.on("bot broadcast", onBotBroadcast);
    client.on("bot die", onBotDie);
    client.on("login", onLogin);
    client.on("test", onTest);
    client.on("host", onHost);
    client.on("register", onRegister);
    client.on("input", onInput);
    client.on("end match", onEndMatch);
    client.on("key down", onKeyDown);
    client.on("moving player", onMovingPlayer);
    client.on("key up", onKeyUp);
};
function onClientDisconnect() {

    if (this.id == hostID) {
        hostID = 'none';
        util.log('host disconnected, waiting for another one');
    }

    // Broadcast removed player to connected socket clients
    this.broadcast.to('authenticated').emit("remove player", { id: this.id });
}
function onNewPlayer(data) {
    // Broadcast new player to connected socket clients
    this.broadcast.to('authenticated').emit("new player", { id: this.id, userID: data.userID, username: data.username });

}
function onMovePlayer(data) {
    if(hostID!=this.id) util.log('warning: move player send by player, not host');
    // Broadcast updated position to connected socket clients
    this.broadcast.to('authenticated').emit("move player", { id: data.id, username: data.username, x: data.x, y: data.y, direction: data.direction });
}
function onNewLasers(data) {
    // Broadcast updated position to connected socket clients
    this.broadcast.to('authenticated').emit("new lasers", { id: data.id, x: data.x, y: data.y, direction: data.direction });
}
function onBotBroadcast(data) {
    this.broadcast.to('authenticated').emit("bot broadcast", { count: data.count, x: data.x, y: data.y, direction: data.direction, type: data.type });
    //util.log('length ' + data.length + ';bot ' + data.bot + ';x ' + data.x + ';y ' + data.y);
}
function onBotDie(data) {
    this.broadcast.to('authenticated').emit("bot die", { count: data.count });
    //util.log('length ' + data.length + ';bot ' + data.bot + ';x ' + data.x + ';y ' + data.y);
}
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
function onTest(data) {
    this.emit("test", { test: data.test });
}
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
function onInput(data) {
    if (hostID == 'none') return;
    this.broadcast.to('authenticated').emit("input", { id: this.id, move: data.move, shoot: data.shoot });
}
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
function onKeyDown(data) {
    if (hostID == 'none') return;
    this.broadcast.to('authenticated').emit("key down", { id: this.id, move: data.move, shoot: data.shoot });
}
function onMovingPlayer(data) {
    this.broadcast.to('authenticated').emit("moving player", { id: data.id, direction: data.direction });
}
function onKeyUp(data) {
    if (hostID == 'none') return;
    this.broadcast.to('authenticated').emit("key up", { id: this.id });
}
//run init when everything is loaded
init();