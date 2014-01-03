var lasttick = Date.now();
function onMoveKeyDown(data) {var test = io.sockets.manager.roomClients[this.id];
    if(test['/'+'r0'] && Date.now()-lasttick>10000){
        debug.log('client in room r0 [/r0]',1);
        lasttick = Date.now();
    }
    var players = player.playerById(this.id);
    if (!players) {
        util.log('key down: player not found');
        return;
    }
    players.players.setDirection(data.move);
    players.players.setMoving(true);
    this.broadcast.to('r'+players.roomID).emit("moving player", { id: this.id, direction: data.move,
        x: players.players.getX(), y: players.players.getY() });
}
function onMoveKeyUp() {
    var result = player.playerById(this.id);
    if (!result) {
        console.log('key up: player not found');
        return;
    }
    var players = result.players;
    players.setMoving(false);
    broadcastToRoom(result.roomID,"move player", { id: this.id, username: players.getUsername(),
        x: players.getX(), y: players.getY(), direction: players.getDirection(), team: players.getTeamName() });
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
    require('../common/bulletMain').shooting(x, y, direction, this.id, '', result.roomID);
    shootLastTick = now;
}
function onClientDisconnect() {
    var removePlayer = false;
    allSession = allSession;
    for(var j=0; j<allSession.length; j++) {
        for (var i = 0; i < allSession[j].getRemotePlayers().length; i++) {
            if (allSession[j].getRemotePlayers()[i].getSocketID() === this.id) {
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
function onBroadcastToRoom(data){
    if(local_remote==='local') return;
    broadcastToRoom(data.roomID, data.string, data.object);
}
function broadcastToRoom(roomID, string, object){
    io.sockets.in('r' + roomID).emit(string, object);
}
exports.broadcastToRoom = broadcastToRoom;
var util = require('util');
local_remote = 'local';
util.log('production environment');
var io = require("socket.io").listen(8000),		    // Socket.IO
    runQuery = require('./js/mysql').runQuery,
    loginRegister = require('./js/login-register'),
    player = require('../common/player'),
    main = require('./js/main'),
    debug = require('../common/helper').debug;
io.configure(function () {
    io.set("log level", 2);
});
io.sockets.on("connection", function(socket) {
    runQuery('SELECT Username, Won FROM user', [], function (err, rows, fields) {
        if (err) util.log(err);
        else {
            socket.emit('start', {map: main.mapName, all_user: rows});
        }
    });
    socket.on("disconnect", onClientDisconnect);
    socket.on("login", loginRegister.login);
    socket.on("register", loginRegister.register);
    socket.on("play now", loginRegister.onPlayNow);
    socket.on("move key down", onMoveKeyDown);
    socket.on("move key up", onMoveKeyUp);
    socket.on("shoot key down", onShootKeyDown);
    socket.on("broadcast to room", onBroadcastToRoom);
});