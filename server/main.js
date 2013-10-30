// RESTART // RESTART // RESTART // RESTART // RESTART // RESTART // RESTART // RESTART // RESTART // RESTART // RESTART // RESTART // RESTART // RESTART // RESTART
//RESTART for changes to applied                                        RESTART for changes to applied                                  RESTART for changes to applied
// RESTART // RESTART // RESTART // RESTART // RESTART // RESTART // RESTART // RESTART // RESTART // RESTART // RESTART // RESTART // RESTART // RESTART // RESTART

var util = require("util"),					// Utility resources (logging, object inspection, etc)
    helper = require("./js/helper"),
    host = 'local',                        //if server host or use remote host
    hostID = '',
    botClass = require('./js/BotClass.js'),
    botStupid = require('./js/BotStupid'),
    tmxloader = require('./js/TMX_Engine.js').tmxloader,
    hitTest = require('../common/collision_hitTest'),
    socket = require('./js/socket').socket,		                            // Socket controller
    player = require('../common/player'),
    lastTick,                                               // calculate delta time
    mysql = require('mysql'),
    connection = mysql.createConnection({
        host: 'localhost',
        port: '3306',
        user: 'root',
        password: '',
        database: 'tank5'
    });
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
    lastTick = Date.now();
    setTimeout(loop, 1000);
    //stupid bot shooting every 2s
    setInterval(function() {botStupid.stupidShoot=true;}, 1000 * 2);
}
function loop() {
    var now = Date.now(),
        fixedDelta = 1000/60,
        loops,
        delta = now - lastTick;
    lastTick = Date.now();
    var number = delta/fixedDelta - Math.floor(delta/fixedDelta);
    if(number>0.5)
        loops = Math.floor(delta/fixedDelta) + 1;
    else
        loops = Math.floor(delta/fixedDelta);
    for(var i=0;i<loops;i++) {
        player.movingPlayer();
        //moveLaser();
    }

    botClass.moveBot();
    hitTest.hitTestBot();
    //shoot must behind check and move
    botStupid.BotShootInterval(botClass.bots, 1);
    hitTest.hitTestPlayer();
    player.checkHitPoint();

    setTimeout(loop, 1000/60);
}

function onSocketConnection(client) {
    client.on("disconnect", onClientDisconnect);
    //client.on("new player", onNewPlayer);
    client.on("move player", onMovePlayer);
    client.on("new lasers", onNewLasers);
    client.on("bot broadcast", onBotBroadcast);
    client.on("bot die", onBotDie);
    client.on("login", onLogin);
    client.on("register", onRegister);
    client.on("end match", onEndMatch);
    client.on("key down", onKeyDown);
    client.on("key up", onKeyUp);
};
function onClientDisconnect() {
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

    var that = this;

    //connection.connect();

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
                player.addPlayer(that.id, rows[0].Username, rows[0].ID);
            }
        }
    });
    //connection.end();
}
function onRegister(data) {
    var that = this;
    //connection.connect();
    var query = connection.query('INSERT INTO `tank5`.`user`(`Username`,`Password`, `Won`)VALUES(?,?,0);', [data.username, data.password], function (err, rows, fields) {
        if (err) that.emit("register", { result: 'username already existed' });
        else
            that.emit("register", { result: 'register successfully' });
    });
    //connection.end();
}
function onEndMatch(data) {
    var that = this,
        wonID,
        point = data.score1-data.score2;

    if(data.score1-data.score2>0)
        wonID= data.id1;
    else if(data.score2-data.score1>0)
        wonID=data.id2;
    else {
        util.log('no winner specify, app error, not stored on database');
        return;
    }
    //connection.connect();
    connection.query('INSERT INTO `tank5`.`matchhistory`(`Competitor1`,`Competitor2`,`PointLeft`)VALUES(?,?,?);', [data.id1,data.id2,point], function (err, rows, fields) {
        if (err) util.log(err);
    });
    connection.query('UPDATE `tank5`.`user` SET `Won` = `Won`+1 WHERE `ID` = ?;', [wonID], function (err, rows, fields) {
        if (err) util.log(err);
    });
    //connection.end();
}
function onKeyDown(data) {
    var players = player.playerById(this.id);
    if (!players) {
        util.log('key down: player not found');
        return;
    }
    players.setDirection(data.move);
    players.setMoving(true);
    this.broadcast.to('authenticated').emit("moving player", { id: this.id, direction: data.move });
}
function onKeyUp(data) {
    var players = player.playerById(this.id);
    if (!players) {
        console.log('key up: player not found');
        return;
    }
    players.setMoving(false);
    socket.emit("move player", { id: this.id, username: players.getUsername(), x: players.getX(), y: players.getY(), direction: players.getDirection() });
}

//RUN SERVER
init();