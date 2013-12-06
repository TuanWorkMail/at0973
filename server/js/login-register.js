var broadcastToRoom = require('./socket').broadcastToRoom,
    mysql = require('./mysql'),
    util = require('util'),
    player = require('../../common/player');
exports.login = function(data){
    mysql.runQuery('SELECT * FROM user where Username = ? and Password = ?', [data.username, data.password],
        function (err, rows, fields) {
            if (err) util.log(err);
            else {
                if (rows.length == 0) {
                    this.emit("login", { error: 'wrong username or password' });
                } else {
                    rows[0].Username = rows[0].Username;
                    this.emit("login", { username: rows[0].Username, userID: rows[0].ID });
                    var newPlayer = player.newPlayer(this.id, rows[0].Username, rows[0].ID),
                        roomID = newPlayer.roomID;
                    newPlayer = newPlayer.newPlayer;
                    this.join('r' + roomID);
                    util.log('new player userID: ' + rows[0].ID + ' and username: ' + rows[0].Username);
                    broadcastToRoom(roomID,"move player", { id: this.id, username: rows[0].Username,
                        x: newPlayer.getX(), y: newPlayer.getY(), direction: newPlayer.getDirection() });
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