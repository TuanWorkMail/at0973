var spawnPlayer = require('./player.add-new').spawnPlayer,
    broadcastToRoom = require('../server/socket-listener').broadcastToRoom,
    layerByName = require('../server/js/TMX_Engine').layerByName,
    combine16to1tile = require('./combine-layer').combine16to1tile;
exports.reset = reset;
function reset(para) {
    var remotePlayers = session.getRemotePlayers();
    broadcastToRoom(session.getRoomID(),'reset');
    bots.length = 0;
    lasers.length = 0;
    var destructible = [], indestructible = [];
    session.setDestructible(layerByName('destructible').data);
    session.setIndestructible(layerByName('indestructible').data);
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