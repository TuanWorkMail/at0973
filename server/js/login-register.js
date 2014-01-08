var broadcastToRoom = require('../socket-listener').broadcastToRoom,
    mysql = require('./mysql'),
    util = require('util'),
    playerAddNew = require('../../common/player.add-new'),
    debug = require('../../common/helper').debug,
    logonUsers = [],
    sessionByRoomID = require('./main').sessionByRoomID;
exports.login = function(data){
    var that = this;
    mysql.runQuery('SELECT * FROM user where Username = ? and Password = ?', [data.username, data.password],
        function (err, rows, fields) {
            if (err) util.log(err);
            else {
                if (rows.length == 0) {
                    that.emit("login", { error: 'wrong username or password' });
                } else {
                    that.emit("login",{hello:'world'});
                    logonUsers.push([]);
                    logonUsers[logonUsers.length-1].push(that.id);
                    logonUsers[logonUsers.length-1].push(rows[0]);
                }
            }
        }
    );
};
exports.register = function(data) {
    var that = this;
    mysql.connection.query('INSERT INTO `tank5`.`user`(`Username`,`Password`, `Won`)VALUES(?,?,0);', [data.username, data.password], function (err, rows, fields) {
        if (err) that.emit("register", { result: 'username already existed' });
        else
            that.emit("register", { result: 'register successfully, now please login' });
    });
};
exports.onPlayNow = function(){
    var result = logonUserById(this.id);
    if(!result) return;
    var newPlayer = playerAddNew.newPlayer(this.id, result.Username, result.ID),
        roomID = newPlayer.roomID;
    newPlayer = newPlayer.newPlayer;
    this.join('r' + roomID);
    debug.log('new player userID: ' + result.ID + ' and username: ' + result.Username + ' and uuid: ' + newPlayer.getID());
    var session = sessionByRoomID(roomID);
    for(var i=0;i<session.getRemotePlayers().length;i++){
        newPlayer = session.getRemotePlayers()[i];
        switch (newPlayer.getTeamName()){
            case 'up': var type = 'player-up'; break;
            case 'down': type = 'player-down'; break;
        }
        broadcastToRoom(roomID,"new character", { id: newPlayer.getID(),
            x: newPlayer.getX(), y: newPlayer.getY(), direction: newPlayer.getDirection(), type: type});
    }
    if(session.getStart()){
        broadcastToRoom(roomID, 'hide popup');
        broadcastToRoom(roomID, 'destroy brick', {array: session.getDestroyedBrick()});
    }
};
function logonUserById(id){
    for(var i=0;i<logonUsers.length;i++){
        if(logonUsers[i][0]===id) return logonUsers[i][1];
    }
    return false;
}
exports.logonUserById = logonUserById;