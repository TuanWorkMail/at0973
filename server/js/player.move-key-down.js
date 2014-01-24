var main = require('./main'),
    playerById = require('../../common/player').playerById,
    debug = require('../../common/helper').debug,
    broadcastToRoom = require('../socket-listener').broadcastToRoom;
exports.moveKeyDown = function() {
    var inputQueue = main.session.getInputQueue();
    for(var i=0;i<inputQueue.length;i++){
        if(inputQueue[i].getEventName()!=='move key down') continue;
        var players = playerById(inputQueue[i].getSocketID());
        if (!players) {
            debug.log('move key down: player not found '+inputQueue[i].getSocketID(), 1);
            return;
        }
        players.players.setDirection(inputQueue[i].getData().move);
        players.players.setMoving(true);
        broadcastToRoom(players.roomID,"move character", { id: players.players.getID(),
            direction: players.players.getDirection(), x: players.players.getX(), y: players.players.getY(), moving: true });
        inputQueue.splice(i, 1);
        i--;
    }
};
/*var test = io.sockets.manager.roomClients[this.id];
 if(test['/'+'r0'] && Date.now()-lasttick>10000){
 debug.log('client in room r0 [/r0]',1);
 lasttick = Date.now();
 }*/