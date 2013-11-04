
//RESTART for changes to applied        RESTART for changes to applied      RESTART for changes to applied

// LOCAL SCOPE
var util = require("util"),					// Utility resources (logging, object inspection, etc)
    helper = require("./js/helper"),
    host = 'local',                        //if server host or use remote host
    hostID = '',
    botClass = require('./js/BotClass.js'),
    botStupid = require('./js/BotStupid'),
    tmxloader = require('./js/TMX_Engine.js').tmxloader,
    hitTest = require('../common/collision_hitTest'),
    sockets = require('./js/socket').sockets,		                            // Socket controller
    player = require('../common/player'),
    Session = require('../common/dto/session').Session,
    lastTick,                                               // calculate delta time
    loopUnused = 0,                                         // % of loop left
    sessionID = 0,                                          // auto incremental session id
    mysql = require('mysql'),
    connection = mysql.createConnection({
        host: 'localhost',
        port: '3306',
        user: 'root',
        password: '',
        database: 'tank5'
    });
// GLOBAL SCOPE
$$myGlobal = {};  //all global will be in this, to make debugging easier
$$myGlobal.allSession = [];// array contain all session
$$myGlobal.roomName = '';       //global room name because every class need it
//these are just local make global, need to be refactored
whereSpawn = 0;
bots = [];
botsLength = 2;

//initializing.........
function init() {
    //create a new blank session
    var newSession = new Session(sessionID);
    sessionID++;
    $$myGlobal.allSession.push(newSession);
    // Start listening for events
    sockets.on("connection", onSocketConnection);
    tmxloader.load(__dirname + '\\map\\classic2.tmx');
    lastTick = Date.now();
    setTimeout(loop, 1000);
    //stupid bot shooting every 2s
    setInterval(function() {botStupid.stupidShoot=true;}, 1000 * 2);
}
function loop() {
    var now = Date.now(),
        fixedDelta = 1000/60,
        loopRounded,
        remainder,
        delta = now - lastTick;
    lastTick = Date.now();
    var loopUnrounded = delta/fixedDelta + loopUnused;
    remainder = loopUnrounded - Math.floor(loopUnrounded);
    if(remainder>0.5) {
        loopRounded = Math.floor(loopUnrounded) + 1;
    } else
        loopRounded = Math.floor(loopUnrounded);
    loopUnused = loopUnrounded - loopRounded;
    for(var i=0;i<loopRounded;i++) {
        for(var j=0; j<$$myGlobal.allSession.length; j++) {

            // BEGIN LOGIC      BEGIN LOGIC     BEGIN LOGIC     BEGIN LOGIC

            $$myGlobal.roomName = 'room'+j;
            exports.remotePlayers = $$myGlobal.allSession[j].getRemotePlayers();
            whereSpawn = $$myGlobal.allSession[j].whereSpawn;
            bots = $$myGlobal.allSession[j].bots;
            botsLength = $$myGlobal.allSession[j].botsLength;
            player.movingPlayer();
            //moveLaser();
            botClass.moveBot();
            hitTest.hitTestBot();
            //shoot must behind check and move
            botStupid.BotShootInterval(bots, 1);
            hitTest.hitTestPlayer();
            player.checkHitPoint();

            // END LOGIC        END LOGIC       END LOGIC       END LOGIC

        }
    }
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
}
function onClientDisconnect() {
    var removePlayer = false;
    for(var j=0; j<$$myGlobal.allSession.length; j++) {
        for (var i = 0; i < $$myGlobal.allSession[j].getRemotePlayers().length; i++) {
            if ($$myGlobal.allSession[j].getRemotePlayers()[i].getSocketID() == this.id) {
                $$myGlobal.allSession[j].getRemotePlayers().splice(i, 1);
                this.broadcast.to('authenticated').emit("remove player", { id: this.id });
                removePlayer = true;
            }
        }
    }
    if (!removePlayer)
        util.log("Remove: Player not found: "+this.id);
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
function onRegister(data) {
    var that = this;
    //connection.connect();
    connection.query('INSERT INTO `tank5`.`user`(`Username`,`Password`, `Won`)VALUES(?,?,0);', [data.username, data.password], function (err, rows, fields) {
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
function onLogin(data) {
    var that = this;
    //connection.connect();
    connection.query('SELECT * FROM user where Username = ? and Password = ?', [data.username, data.password], function (err, rows, fields) {
        if (err) util.log(err);
        else {
            if (rows.length == 0) {
                that.emit("login", { username: 'failed' });
            } else {
                if($$myGlobal.allSession[$$myGlobal.allSession.length-1].getRemotePlayers().length>=2) {
                    var newSession = new Session($$myGlobal.allSession.length-1);
                    $$myGlobal.allSession.push(newSession);
                }
                var newPlayer = player.spawnPlayer(that.id, rows[0].Username, rows[0].ID);
                that.emit("login", { username: rows[0].Username, userID: rows[0].ID, roomID: newPlayer.roomIndex });
                that.join('room'+newPlayer.roomIndex);
                newPlayer = newPlayer.newPlayer;
                util.log('new player userID: '+rows[0].ID+' and username: '+rows[0].Username);
                sockets.in('room'+newPlayer.roomIndex).emit("move player", { id: that.id, username: rows[0].Username,
                    x: newPlayer.getX(), y: newPlayer.getY(), direction: newPlayer.getDirection() });
            }
        }
    });
    //connection.end();
}
function onKeyDown(data) {
    var players = playerById(this.id);
    if (!players) {
        util.log('key down: player not found');
        return;
    }
    players.players.setDirection(data.move);
    players.players.setMoving(true);
    this.broadcast.to('room'+players.roomID).emit("moving player", { id: this.id, direction: data.move });
}
function onKeyUp() {
    var result = playerById(this.id);
    if (!result) {
        console.log('key up: player not found');
        return;
    }
    var players = result.players;
    players.setMoving(false);
    sockets.in('room'+result.roomID).emit("move player", { id: this.id, username: players.getUsername(), x: players.getX(), y: players.getY(), direction: players.getDirection() });
}
// Find player by ID
function playerById(socketid) {
    for (var j=0; j<$$myGlobal.allSession.length; j++) {
        var remotePlayers = $$myGlobal.allSession[j].getRemotePlayers();
        for (var i = 0; i < remotePlayers.length; i++) {
            if (remotePlayers[i].getSocketID() == socketid)
                return {players:remotePlayers[i],roomID:j};
        }
    }
    return false;
}
//RUN SERVER
init();
