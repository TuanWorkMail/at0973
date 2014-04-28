var lasttick = Date.now();
function onMoveKeyDown(data) {
    //main.queuePlayerInput(this.id, 'move key down', data);
    main.getSession(this).getInputQueue().moveKeyDown.push(new InputQueue(this.id, data));
}
function onMoveKeyUp(data) {
    //main.queuePlayerInput(this.id, 'move key up', data);
    main.getSession(this).getInputQueue().moveKeyUp.push(new InputQueue(this.id, data));
}
function queueInput(message, that, data){
    var session = main.getSession(that);
    if(!session) return;
    var inputQueue = session.getInputQueue();
    switch (message){
        case 'move key down':
            inputQueue.moveKeyDown.push(new InputQueue(that.id, data));
            break;
        case 'move key up':
            inputQueue.moveKeyUp.push(new InputQueue(that.id, data));
            break;
    }
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
        x = ship_x + ship_w / 2,
        y = ship_y + ship_h / 2,
        direction = result.players.getDirection();
    if (direction === 0) {          //up
        y = ship_y - 1;
    } else if (direction === 2) {   //down
        y = ship_y + ship_h + 1;
    } else if (direction === 1) {   //right
        x = ship_x + ship_w + 1;
    } else if (direction === -1) {  //left
        x = ship_x - 1;
    }
    require('../common/bulletMain').shooting(x, y, direction, this.id, '', result.roomID);
    shootLastTick = now;
}
function onClientDisconnect() {
    loginRegister.logonUserById(this.id, 'remove');
    allSession = allSession;
    for(var j=0; j<allSession.length; j++) {
        for (var i = 0; i < allSession[j].getRemotePlayers().length; i++) {
            if (allSession[j].getRemotePlayers()[i].getSocketID() === this.id) {
                broadcastToRoom(allSession[j].getRoomID(), 'remove character', {id: allSession[j].getRemotePlayers()[i].getID()});
                allSession[j].getRemotePlayers().splice(i, 1);
                return;
            }
        }
    }
    util.log("Remove: Player not found: "+this.id);
}
function onBroadcastToRoom(data){
    if(local_remote==='local') return;
    broadcastToRoom(data.roomID, data.string, data.object);
}
function broadcastToRoom(roomID, string, object){
    io.sockets.in('r' + roomID).emit(string, object);
}
function emit(socketID, string, object){
    io.sockets.socket(socketID).emit(string, object);
}
var util = require('util');
local_remote = 'local';
util.log('production environment');
var io = require("socket.io").listen(8000),
    fs = require('fs');
io.configure(function () {
    io.set("log level", 2);
});
io.sockets.on("connection", function(socket) {
    if(config.dbmode==='mysql'){
        runQuery('SELECT Username, Won FROM user', [], function (err, rows) {
//            socket.emit('start', {map: config.mapName, all_user: rows});
            socket.emit('start', {map: 'classic_small', all_user: rows});
        });
    } else {
        fs.readFile('./userDB', function(err, data2) {
            var userDB = JSON.parse(data2);
//            socket.emit('start', {map: config.mapName, all_user: userDB});
            socket.emit('start', {map: 'classic_small', all_user: userDB});
        });
    }
    socket.on("disconnect", onClientDisconnect);
    socket.on("login", loginRegister.login);
    socket.on("register", loginRegister.register);
    socket.on("play now", loginRegister.onPlayNow);
    socket.on("move key down", function(data){queueInput('move key down', this, data)});
    socket.on("move key up", function(data){queueInput('move key up', this, data)});
    socket.on("shoot key down", onShootKeyDown);
    socket.on("broadcast to room", onBroadcastToRoom);
});
function InputQueue(socketid, data){
    this.getSocketID = function(){return socketid};
    this.getData = function(){return data};
}
function getRoomID(that){
    for (var key in that.manager.rooms) {
        if (that.manager.rooms.hasOwnProperty(key)) {
            if(key!=='') return key.replace('/r','');
        }
    }
    return false;
}
exports.broadcastToRoom = broadcastToRoom;
exports.emit = emit;
var config = require('./js/loadConfig'),
    runQuery = require('./js/mysql').runQuery,
    loginRegister = require('./js/login-register'),
    player = require('../common/player'),
    debug = require('../common/helper').debug,
    main = require('./js/main'),
    inputQueue = [];
require('./web-server');