var broadcastToRoom = require('./socket').broadcastToRoom,
    util = require('util'),
    runQuery = require('./mysql').runQuery,
    loginRegister = require('./login-register'),
    player = require('../../common/player');
exports.onSocketConnection = function(socket) {
    runQuery('SELECT Username, Won FROM user', [], function (err, rows, fields) {
        if (err) util.log(err);
        else {
            socket.emit('start', {map: 'big', alluser: rows});
        }
    });
    socket.on("disconnect", onClientDisconnect);
    socket.on("login", onLogin);
    socket.on("register", onRegister);
    socket.on("move key down", onMoveKeyDown);
    socket.on("move key up", onMoveKeyUp);
    socket.on("shoot key down", onShootKeyDown);
}
function onLogin(data) {
    loginRegister.login(data.username, data.password, this);
}
function onClientDisconnect() {
    var removePlayer = false;
    allSession = allSession;
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
    broadcastToRoom(result.roomID,"move player", { id: this.id, username: players.getUsername(),
        x: players.getX(), y: players.getY(), direction: players.getDirection() });
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
    require('../../common/bulletMain').shooting(x, y, direction, this.id, '', result.roomID);
    shootLastTick = now;
}