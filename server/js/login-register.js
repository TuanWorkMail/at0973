var dbmode = 'mysql',                                     // use which database: mysql OR file-based?
    socketListener = require('../socket-listener'),
    broadcastToRoom = socketListener.broadcastToRoom,
    sockets = socketListener.sockets,
    mysql = require('./mysql'),
    util = require('util'),
    playerAddNew = require('../../common/player.add-new'),
    debug = require('../../common/helper').debug,
    fs = require('fs'),
    main = require('./main'),
    sessionByRoomID = main.sessionByRoomID,
    logonUsers = [];
exports.dbmode = dbmode;
exports.login = function(data){
    var that = this;
    if(dbmode==='mysql'){
        mysql.runQuery('SELECT * FROM user where Username = ? and Password = ?',
            [data.username, data.password], checkLogin);
    } else {
        fs.readFile('./userDB', function(err, data2) {
            var userDB = JSON.parse(data2),
                result = [];
            for(var j=0;j<userDB.length;j++){
                if(userDB[j].Username===data.username && userDB[j].Password===data.password) result.push(userDB[j]);
            }
            checkLogin(err, result);
        });
    }
    function checkLogin(err, rows){
        if (rows.length === 0) {
            that.emit("login", { error: 'wrong username or password' });
        } else {
            for(var i=0;i<logonUsers.length;i++){
                if(rows[0].Username===logonUsers[i][1].Username){
                    that.emit("login", { error: 'user already logon' });
                    return;
                }
            }
            that.emit("login");
            logonUsers.push([that.id, rows[0]]);
        }
    }
};
exports.register = function(data) {
    var that = this;
    if(dbmode==='mysql'){
        mysql.connection.query('INSERT INTO `tank5`.`user`(`Username`,`Password`, `Won`)VALUES(?,?,0);',
            [data.username, data.password], function (err) {
                if (err) usernameExisted();
                else success();
        });
    } else {
        var userExisted = false;
        fs.readFile('./userDB', function(err, data2) {
            var userDB = JSON.parse(data2);
            for(var j=0;j<userDB.length && !userExisted;j++){
                if(userDB[j].Username===data.username){
                    usernameExisted();
                    userExisted = true;
                }
            }
            if(!userExisted){
                var object = {
                    ID: userDB.length,
                    Username: data.username,
                    Password: data.password,
                    Won: 0
                };
                userDB.push(object);
                fs.writeFile('./userDB', JSON.stringify(userDB), function (err) {
                    if(err) debug.log(err, 1);
                });
                success();
            }
        });
    }
    function usernameExisted(){
        that.emit("register", { result: 'username already existed' });
    }
    function success(){
        that.emit("register", { result: 'register successfully, now please login' });
    }
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