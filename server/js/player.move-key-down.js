var main = require('./main'),
    playerById = require('../../common/player').playerById,
    debug = require('../../common/helper').debug,
    broadcastToRoom = require('../socket-listener').broadcastToRoom;
exports.moveKeyDown = function() {
    var inputQueue = main.session.getInputQueue().moveKeyDown;
    for(var i=0;i<inputQueue.length;i++){
        //if(inputQueue[i].getEventName()!=='move key down') continue;
        var players = playerById(inputQueue[i].getSocketID());
        if (!players) {
            debug.log('move key down: player not found '+inputQueue[i].getSocketID(), 1);
            return;
        }
        players.players.setDirection(inputQueue[i].getData().move);
        players.players.setMoving(true);
        broadcastToRoom(main.session.getRoomID() ,"move character", { id: players.players.getID(),
            direction: players.players.getDirection(), x: players.players.getX(), y: players.players.getY(), moving: true });
        inputQueue.splice(i, 1);
        i--;
    }
};