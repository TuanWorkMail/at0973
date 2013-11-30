
//RESTART for changes to applied        RESTART for changes to applied      RESTART for changes to applied

var map = 'big';                                                                   // map name
TMX_Engine = require('./js/TMX_Engine.js').loadMap('../common/map/'+map+'.tmx', init);  // load map as soon as possible
// LOCAL SCOPE
var util = require("util"),
    helper = require('../common/helper'),
    botClass = require('./js/BotClass.js'),
    botStupid = require('./js/BotStupid'),
    hitTest = require('../common/collision_hitTest'),
    sockets = require('./js/socket').sockets,
    player = require('../common/player'),
    Session = require('../common/dto/session').Session,
    bulletMain = require('../common/bulletMain'),
    Bullet = require('../common/dto/bullet').Bullet,
    dropcheck = require('./js/drop-check'),
    combinelayer = require('../common/combine-layer'),
    combine16to1tile = combinelayer.combine16to1tile,
    lastTick = Date.now(),                                  // calculate delta time
    last1second = Date.now(),
    lastBotTick = Date.now(),                                            // for stupid bot auto shoot
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
bots = [];
alive = true;
lasers = [];
function init() {
    //create a new blank session
    var newSession = new Session(sessionID);
    sessionID++;
    allSession.push(newSession);
    // Start listening for events
    sockets.on("connection", onSocketConnection);
    setTimeout(loop, 1000);
}
function loop() {
    var now = Date.now(),
        fixedDelta = 1000/60,
        loopRounded,
        remainder,
        delta = now - lastTick,
        d1second = now - last1second;
    lastTick = now;
    var loopUnrounded = delta/fixedDelta + loopUnused;
    loopRounded = Math.round(loopUnrounded);
    loopUnused = loopUnrounded - loopRounded;
    for(var j=0; j<allSession.length; j++) {
        session = allSession[j];
        bots = allSession[j].bots;
        lasers = allSession[j].getLasers();
        if(d1second>1000) session.setCombinedLayer(combine16to1tile());
        if(session.getRemotePlayers().length < 1 || loopRounded < 1) continue;
        for(var i=0;i<loopRounded;i++) {
            player.movingPlayer();
            bulletMain.moveLaser();
            hitTest.outOfMapBullet();
            botClass.moveBot();
            hitTest.shootDestruction();
            bulletMain.removeBullet();
        }
        hitTest.hitTestBot();
        //TODO: change 1000 to 500 will throw error,
        if(now-lastBotTick>=1000) botStupid.BotShootInterval(bots);
        hitTest.hitTestPlayer();
        hitTest.hitTestEagle();
        dropcheck.collideDrop();
        player.checkHitPoint();
    }
    if(d1second>1000) last1second = now;
    if(now-lastBotTick>=1000) lastBotTick = now;
    setTimeout(loop, 1000/60);
}
function onSocketConnection(client) {
    connection.query('SELECT Username, Won FROM user', function (err, rows, fields) {
        if (err) util.log(err);
        else {
            client.emit('start', {map: map, alluser: rows});
        }
    });
    client.on("disconnect", onClientDisconnect);
    client.on("login", onLogin);
    client.on("register", onRegister);
    client.on("move key down", onMoveKeyDown);
    client.on("move key up", onMoveKeyUp);
    client.on("shoot key down", onShootKeyDown);
}
function onLogin(data) {
    var that = this;
    //connection.connect();
    connection.query('SELECT * FROM user where Username = ? and Password = ?', [data.username, data.password], function (err, rows, fields) {
        if (err) util.log(err);
        else {
            if (rows.length == 0) {
                that.emit("login", { errormessage: 'wrong username or password' });
            } else {
                that.emit("login", { username: rows[0].Username, userID: rows[0].ID });
                var newPlayer = player.newPlayer(that.id, rows[0].Username, rows[0].ID),
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
            that.emit("register", { result: 'register successfully, now please login' });
    });
    //connection.end();
}
function onMoveKeyDown(data) {
    var players = player.playerById(this.id);
    if (!players) {
        util.log('key down: player not found');
        return;
    }
    players.players.setDirection(data.move);
    players.players.setMoving(true);
    this.broadcast.to('r'+players.roomID).emit("moving player", { id: this.id, direction: data.move });
}
function onMoveKeyUp() {
    var result = player.playerById(this.id);
    if (!result) {
        console.log('key up: player not found');
        return;
    }
    var players = result.players;
    players.setMoving(false);
    sockets.in('r'+result.roomID).emit("move player", { id: this.id, username: players.getUsername(), x: players.getX(), y: players.getY(), direction: players.getDirection() });
}
var shootLastTick = Date.now();
function onShootKeyDown() {
    var now = Date.now();
    if(now-shootLastTick<1000) return;
    var result = player.playerById(this.id);
    if(!result) return;
    var ship_x = result.players.getX(),
        ship_y = result.players.getY(),
        ship_w = result.players.getWidth(),
        ship_h = result.players.getHeight(),
        x, y,
        direction = result.players.getDirection();
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
    var id = bulletMain.shooting(x, y, direction, this.id, '', result.roomID);
    shootLastTick = now;
}
exports.onEndMatch = function(data) {
    var that = this,
        wonID,
        point = data.score1-data.score2;
    if(data.id1==data.id2) {
        util.log('same id, app error, not stored on database');
        return;
    }
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

