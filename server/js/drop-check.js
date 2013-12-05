var broadcastToRoom = require('./socket').broadcastToRoom;
exports.collideDrop = function() {
    var drops = session.getDrop(),
        remotePlayers = session.getRemotePlayers();
    for (var i = 0; i < drops.length; i++) {
        var drop_x = drops[i].getX(),
            drop_y = drops[i].getY(),
            drop_xw = drop_x + drops[i].getWidth(),
            drop_yh = drop_y + drops[i].getHeight();
        for (var j = 0; j < remotePlayers.length; ++j) {
            var player_x = remotePlayers[j].getX(),
                player_y = remotePlayers[j].getY(),
                player_xw = player_x + remotePlayers[j].getWidth(),
                player_yh = player_y + remotePlayers[j].getHeight();
            if (drop_x < player_xw && drop_y < player_yh && drop_xw > player_x && drop_yh > player_y) {
                broadcastToRoom(session.getRoomID(),"collide drop",{socketID: remotePlayers[j].getSocketID(),
                    dropID: drops[i].getID(),bulletType: 'piercing'});
                remotePlayers[j].setBulletType('piercing');
                drops.splice(i, 1);
                return;
            }
        }
    }
};