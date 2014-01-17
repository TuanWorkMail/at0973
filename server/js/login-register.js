var socketListener = require('../socket-listener'),
    broadcastToRoom = socketListener.broadcastToRoom,
    sockets = socketListener.sockets,
    mysql = require('./mysql'),
    util = require('util'),
    playerAddNew = require('../../common/player.add-new'),
    debug = require('../../common/helper').debug,
    fs = require('fs'),
    main = require('./main'),
    sessionByRoomID = main.sessionByRoomID,
    logonUsers = [],
    userDB = [];
(function(){
    fs.readFile('./userDB', function(err, data) {
        if(!err) userDB = JSON.parse(data);
    });
}());
exports.login = function(){
    var inputQueue = main.inputQueue;
    for(var i=0;i<inputQueue.length;i++){
        if(inputQueue[i].getEventName()!=='login') continue;
        for(var j=0;j<userDB.length;j++){
            if(userDB[j][0]===inputQueue[i].getData().username && userDB[j][1]===inputQueue[i].getData().password){
                for(var k=0;k<logonUsers.length;k++){
                    if(userDB[j][0]===logonUsers[k][1].Username){
                        sockets.socket(inputQueue[i].getSocketID()).emit("login", { error: 'user already logon' });
                        inputQueue.splice(i, 1);
                        return;
                    }
                }
                sockets.socket(inputQueue[i].getSocketID()).emit("login");
                var object = {};
                object.Username = userDB[j][0];
                object.Password = userDB[j][1];
                logonUsers.push([inputQueue[i].getSocketID(), object]);
                inputQueue.splice(i, 1);
                return;
            }
        }
        sockets.socket(inputQueue[i].getSocketID()).emit("login", { error: 'wrong username or password' });
        inputQueue.splice(i, 1);
        i--;
    }
    return;
    mysql.runQuery('SELECT * FROM user where Username = ? and Password = ?', [data.username, data.password],
        function (err, rows, fields) {
            if (err) util.log(err);
            else {
                if (rows.length == 0) {
                    that.emit("login", { error: 'wrong username or password' });
                } else {
                    for(var i=0;i<logonUsers.length;i++){
                        if(rows[0].Username===logonUsers[i][1].Username){
                            that.emit("login", { error: 'user already logon' });
                            return;
                        }
                    }
                    that.emit("login",{hello:'world'});
                    logonUsers.push([]);
                    logonUsers[logonUsers.length-1].push(that.id);
                    logonUsers[logonUsers.length-1].push(rows[0]);
                }
            }
        }
    );
};
exports.register = function() {
    var inputQueue = main.inputQueue;
    for(var i=0;i<inputQueue.length;i++){
        if(inputQueue[i].getEventName()!=='register') continue;
        for(var j=0;j<userDB.length;j++){
            if(userDB[j][0]===inputQueue[i].getData().username){
                sockets.socket(inputQueue[i].getSocketID()).emit("register", { result: 'username already existed' });
                inputQueue.splice(i, 1);
                return;
            }
        }
        userDB.push([inputQueue[i].getData().username, inputQueue[i].getData().password, 0]);
        sockets.socket(inputQueue[i].getSocketID()).emit("register", { result: 'register successfully, now please login' });
        inputQueue.splice(i, 1);
        fs.writeFile('./userDB', JSON.stringify(userDB), function (err) {
            if(err) debug.log(err, 1);
        });
    }
    return;
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
        broadcastToRoom(roomID,"new character", { id: newPlayer.getID(), x: newPlayer.getX(), y: newPlayer.getY(),
            direction: newPlayer.getDirection(), speed: newPlayer.getSpeed(), type: type, name: newPlayer.getUsername()});
    }
    if(session.getStart()){
        broadcastToRoom(roomID, 'hide popup');
        broadcastToRoom(roomID, 'destroy brick', {array: session.getDestroyedBrick()});
    }
};
function logonUserById(id, option){
    for(var i=0;i<logonUsers.length;i++){
        if(logonUsers[i][0]===id) {
            if(typeof option !== 'undefined'){
                if(option==='remove') {
                    logonUsers.splice(i, 1);
                    return true;
                }
            }
            return logonUsers[i][1];
        }
    }
    return false;
}
exports.logonUserById = logonUserById;