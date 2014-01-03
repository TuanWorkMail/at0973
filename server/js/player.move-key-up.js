var main = require('./main'),
    playerById = require('../../common/player').playerById,
    debug = require('../../common/helper').debug,
    broadcastToRoom = require('../socket-listener').broadcastToRoom;
exports.moveKeyUp = function() {
    var inputQueue = main.inputQueue;
    for(var i=0;i<inputQueue.length;i++){
        if(inputQueue[i].getEventName()!=='move key up') continue;
        var result = playerById(inputQueue[i].getSocketID());
        if (!result) {
            console.log('move key up: player not found');
            return;
        }
        var players = result.players;
        players.setMoving(false);
        broadcastToRoom(result.roomID,"move player", { id: inputQueue[i].getSocketID(), username: players.getUsername(),
            x: players.getX(), y: players.getY(), direction: players.getDirection(), team: players.getTeamName() });
        inputQueue.splice(i, 1);
        i--;
    }
};