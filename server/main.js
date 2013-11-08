
//RESTART for changes to applied        RESTART for changes to applied      RESTART for changes to applied

// LOCAL SCOPE
var util = require("util"),					// Utility resources (logging, object inspection, etc)
    helper = require('../common/helper'),
    botClass = require('./js/BotClass.js'),
    botStupid = require('./js/BotStupid'),
    tmxloader = require('./js/TMX_Engine.js').tmxloader,
    hitTest = require('../common/collision_hitTest'),
    sockets = require('./js/socket').sockets,		                            // Socket controller
    player = require('../common/player'),
    Session = require('../common/dto/session').Session,
    bulletMain = require('../common/bulletMain'),
    Bullet = require('../common/dto/bullet').Bullet,
    lastRoomID = 0,                                         // auto increment roomID
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
allSession = [];// array contain all session
session = {};
//these are just local make global, need to be refactored
whereSpawn = 0;
bots = [];
botsLength = 2;
alive = true;
lasers = [];
//initializing.........
function init() {
    //create a new blank session
    var newSession = new Session(sessionID);
    sessionID++;
    allSession.push(newSession);
    // Start listening for events
    sockets.on("connection", onSocketConnection);
    tmxloader.load(__dirname + '\\map\\classic2.tmx');
    lastTick = Date.now();
    setTimeout(loop, 1000);
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
        for(var j=0; j<allSession.length; j++) {
            //                      BEGIN LOGIC      BEGIN LOGIC     BEGIN LOGIC     BEGIN LOGIC
            session = allSession[j];
            whereSpawn = allSession[j].whereSpawn;
            bots = allSession[j].bots;
            botsLength = allSession[j].botsLength;
            lasers = allSession[j].getLasers();
            if(session.getRemotePlayers().length < 2) continue;
            player.movingPlayer();
            bulletMain.moveLaser();
            botClass.moveBot();
            //hitTest.hitTestBot();
            //shoot must behind check and move
            //botStupid.BotShootInterval(bots, 1);
            //hitTest.hitTestPlayer();
            player.checkHitPoint();
            //                      END LOGIC        END LOGIC       END LOGIC       END LOGIC
        }
    }
    setTimeout(loop, 1000/60);
}
function onSocketConnection(client) {
    client.on("disconnect", onClientDisconnect);
    client.on("login", onLogin);
    client.on("register", onRegister);
    client.on("end match", onEndMatch);
    client.on("move key down", onMoveKeyDown);
    client.on("move key up", onMoveKeyUp);
    client.on("shoot key down", onShootKeyDown);
}
function onClientDisconnect() {
    var removePlayer = false;
    for(var j=0; j<allSession.length; j++) {
        for (var i = 0; i < allSession[j].getRemotePlayers().length; i++) {
            if (allSession[j].getRemotePlayers()[i].getSocketID() == this.id) {
                allSession[j].getRemotePlayers().splice(i, 1);
                // NEED FIX
                //this.broadcast.to('authenticated').emit("remove player", { id: this.id });
                removePlayer = true;
            }
        }
    }
    if (!removePlayer)
        util.log("Remove: Player not found: "+this.id);
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
                that.emit("login", { username: rows[0].Username, userID: rows[0].ID });
                if(allSession[allSession.length-1].getRemotePlayers().length>=2) {
                    var roomID = getRoomID(),
                        newSession = new Session(roomID);
                    allSession.push(newSession);
                }
                var newPlayer = player.spawnPlayer(that.id, rows[0].Username, rows[0].ID),
                    roomID = newPlayer.roomID;
                newPlayer = newPlayer.newPlayer;
                that.join('r'+roomID);
                util.log('new player userID: '+rows[0].ID+' and username: '+rows[0].Username);
                sockets.in('r'+roomID).emit("move player", { id: that.id, username: rows[0].Username,
                    x: newPlayer.getX(), y: newPlayer.getY(), direction: newPlayer.getDirection() });
            }
        }
    });
    //connection.end();
}
function onMoveKeyDown(data) {
    var players = _playerById(this.id);
    if (!players) {
        util.log('key down: player not found');
        return;
    }
    players.players.setDirection(data.move);
    players.players.setMoving(true);
    this.broadcast.to('r'+players.roomID).emit("moving player", { id: this.id, direction: data.move });
}
function onMoveKeyUp() {
    var result = _playerById(this.id);
    if (!result) {
        console.log('key up: player not found');
        return;
    }
    var players = result.players;
    players.setMoving(false);
    sockets.in('r'+result.roomID).emit("move player", { id: this.id, username: players.getUsername(), x: players.getX(), y: players.getY(), direction: players.getDirection() });
}
function onShootKeyDown() {
    var result = _playerById(this.id),
    player = result.players;
    if(!player) return;
    var ship_x = player.getX(),
        ship_y = player.getY(),
        ship_w = player.getWidth(),
        ship_h = player.getHeight(),
        x, y,
        direction = player.getDirection();
    if (direction == 'up') {
        x = ship_x + ship_w / 2;
        y = ship_y - 1;
    } else if (direction == 'down') {
        x = ship_x + ship_w / 2;
        y = ship_y + ship_h + 1;
    } else if (direction == 'right') {
        x = ship_x + ship_w + 1;
        y = ship_y + ship_h / 2;
    } else if (direction == 'left') {
        x = ship_x - 1;
        y = ship_y + ship_h / 2;
    }
    var id = _shooting(x, y, direction, result.lasers);
    sockets.in('r'+result.roomID).emit("new bullet", { id: id, x: x, y: y, direction: direction });
}
// Find player by ID
function _playerById(socketid) {
    for (var j=0; j<allSession.length; j++) {
        var remotePlayers = allSession[j].getRemotePlayers();
        for (var i = 0; i < remotePlayers.length; i++) {
            if (remotePlayers[i].getSocketID() == socketid)
                // HACKY SOLUTION RETURN LASERS HERE
                return {players:remotePlayers[i],roomID: allSession[j].getRoomID(), lasers: allSession[j].getLasers()};
        }
    }
    return false;
}
function getRoomID() {
    lastRoomID++;
    return (lastRoomID);
}
function _shooting(x,y,direction, lasers) {
    var id = helper.createUUID('xxxx'),
        newBullet = new Bullet(id, x, y, direction, false);
    lasers.push(newBullet);
    return id;
}
//RUN SERVER
init();
