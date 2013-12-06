
exports.broadcastToRoom = function(roomID, string, object){
    io.sockets.in('r' + roomID).emit(string, object);
};