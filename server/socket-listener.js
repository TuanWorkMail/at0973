var lasttick = Date.now();
function onMoveKeyDown(data) {
    main.queuePlayerInput(this.id, 'move key down', data);
}
function onMoveKeyUp() {
    main.queuePlayerInput(this.id, 'move key up');
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