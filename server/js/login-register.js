var broadcastToRoom = require('../socket-listener').broadcastToRoom,
    mysql = require('./mysql'),
    util = require('util'),
    playerAddNew = require('../../common/player.add-new'),
    debug = require('../../common/helper').debug,
    logonUsers = [];
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
                    logonUsers.push(that.id);
                    logonUsers[logonUsers.length-1][0] = rows[0];
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
    var rows = [];
    rows[0] = logonUserById(this.id);
    if(!rows[0]) return;
    rows[0].Username = rows[0].Username;
    var newPlayer = playerAddNew.newPlayer(this.id, rows[0].Username, rows[0].ID),
        roomID = newPlayer.roomID;
    newPlayer = newPlayer.newPlayer;
    this.join('r' + roomID);
    debug.log('new player userID: ' + rows[0].ID + ' and username: ' + rows[0].Username);
    broadcastToRoom(roomID,"move player", { id: this.id, username: rows[0].Username,
        x: newPlayer.getX(), y: newPlayer.getY(), direction: newPlayer.getDirection(),
        team: newPlayer.getTeamName() });
};
function logonUserById(id){
    for(var i=0;i<logonUsers.length;i++){
        if(logonUsers[i]===id) return logonUsers[i];
    }
    return false;
}
exports.logonUserById = logonUserById;