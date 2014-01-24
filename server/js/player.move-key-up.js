var main = require('./main'),
    playerById = require('../../common/player').playerById,
    debug = require('../../common/helper').debug,
    broadcastToRoom = require('../socket-listener').broadcastToRoom;
exports.moveKeyUp = function() {
    var inputQueue = main.session.getInputQueue();
    for(var i=0;i<inputQueue.length;i++){
        if(inputQueue[i].getEventName()!=='move key up') continue;
        var result = playerById(inputQueue[i].getSocketID());
        if (!result) {
            debug.log('move key up: player not found '+inputQueue[i].getSocketID(), 1);
            return;
        }
        var players = result.players;
        players.setMoving(false);
        broadcastToRoom(result.roomID,"move character", { id: players.getID(),
            x: players.getX(), y: players.getY(), direction: players.getDirection(), moving: false});
        inputQueue.splice(i, 1);
        i--;
    }
};