var broadcastToRoom = require('./socket').broadcastToRoom,
    runQuery = require('./mysql').runQuery,
    util = require('util'),
    player = require('../../common/player');
exports.login = function(username, password, socket){
    runQuery('SELECT * FROM user where Username = ? and Password = ?', [username, password],
        function (err, rows, fields) {
            if (err) util.log(err);
            else {
                if (rows.length == 0) {
                    socket.emit("login", { error: 'wrong username or password' });
                } else {
                    rows[0].Username = rows[0].Username;
                    socket.emit("login", { username: rows[0].Username, userID: rows[0].ID });
                    var newPlayer = player.newPlayer(socket.id, rows[0].Username, rows[0].ID),
                        roomID = newPlayer.roomID;
                    newPlayer = newPlayer.newPlayer;
                    socket.join('r' + roomID);
                    util.log('new player userID: ' + rows[0].ID + ' and username: ' + rows[0].Username);
                    broadcastToRoom(roomID,"move player", { id: socket.id, username: rows[0].Username,
                        x: newPlayer.getX(), y: newPlayer.getY(), direction: newPlayer.getDirection() });
                }
            }
        }
    );
};