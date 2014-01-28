var spawnPlayer = require('./player.add-new').spawnPlayer,
    socketListener = require('../server/socket-listener'),
    broadcastToRoom = socketListener.broadcastToRoom,
    emit = socketListener.emit,
    layerByName = require('../server/js/TMX_Engine').layerByName,
    combine16to1tile = require('./combine-layer').combine16to1tile,
    clone2DArray = require('./helper').clone2DArray,
    main = require('../server/js/main'),
    loginRegister = require('../server/js/login-register'),
    runQuery = require('../server/js/mysql').runQuery,
    fs = require('fs'),
    config = require('../server/js/loadConfig');
exports.reset = reset;
function reset(para) {
    var remotePlayers = session.getRemotePlayers();
    broadcastToRoom(session.getRoomID(),'reset');
    bots.length = 0;
    lasers.length = 0;
    var destructible = [], indestructible = [];
    clone2DArray(layerByName('destructible').data, session.getDestructible());
    clone2DArray(layerByName('indestructible').data, session.getIndestructible());
    session.setCombinedLayer(combine16to1tile());
    // respawn player
    for (var i = 0; i < remotePlayers.length; i++) {
        var result = spawnPlayer(i),
            x = result.x,
            y = result.y,
            direction = result.direction;
        remotePlayers[i].setX(x);
        remotePlayers[i].setY(y);
        remotePlayers[i].setDirection(direction);
        remotePlayers[i].setHitPoint(10);
        if(para=='end match') remotePlayers[i].setLive(2);
        broadcastToRoom(session.getRoomID(),"move player", { id: remotePlayers[i].getSocketID(),
            username: remotePlayers[i].getUsername(), x: x, y: y, direction: direction });
    }
}
exports.end = function(teamName){
    var remotePlayers = main.session.getRemotePlayers();
    for(var i=0;i<remotePlayers.length;i++){
        if(remotePlayers[i].getTeamName()===teamName) {
            if(config.dbmode==='mysql'){
                runQuery('UPDATE `tank5`.`user` SET `Won`=`Won`+1 WHERE `ID` = ?;',
                    [remotePlayers[i].getUserID()]);
            } else {
                (function(UserID){
                    fs.readFile('./userDB', function(err, data2) {
                        var userDB = JSON.parse(data2);
                        for(var j=0;j<userDB.length;j++){
                            if(userDB[j].ID===UserID){
                                userDB[j].Won++;
                                fs.writeFile('./userDB', JSON.stringify(userDB));
                            }
                        }
                    });
                }(remotePlayers[i].getUserID()));
            }
            emit(remotePlayers[i].getSocketID(), "a", { result: 'a' });
        } else {
            emit(remotePlayers[i].getSocketID(), "a", { result: 'b' });
        }
    }
    main.session.setIsRemoved(true);
};