var spawnPlayer = require('./player.add-new').spawnPlayer,
    broadcastToRoom = require('../server/socket-listener').broadcastToRoom,
    clone2DArray = require('./helper').clone2DArray,
    layerByName = require('../server/js/TMX_Engine').layerByName;
exports.reset = reset;
function reset(para) {
    var remotePlayers = session.getRemotePlayers();
    broadcastToRoom(session.getRoomID(),'reset');
    for (var obj = 0; obj < bots.length; ++obj) {continue;
        broadcastToRoom(session.getRoomID(),"bot die", { count: bots[obj].id });
    }
    bots.length = 0;
    lasers.length = 0;
    var destructible = [], indestructible = [];
    clone2DArray(layerByName('destructible').data, destructible);
    clone2DArray(layerByName('indestructible').data, indestructible);
    session.setDestructible(destructible);
    session.setIndestructible(indestructible);
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