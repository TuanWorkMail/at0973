if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
    var tmxloader = require('../server/js/TMX_Engine').tmxloader;
    exports.newPlayer = newPlayer;
    var lastRoomID = 0;                                            // auto increment roomID
}
function newPlayer(socketID, username, userID) {
    var result = spawnPlayer(allSession[allSession.length-1].getRemotePlayers().length),
        x = result.x,
        y = result.y,
        direction = result.direction;
    var player = addNewPlayer(socketID, username, x, y, direction);
    if (!player) return false;
    player.newPlayer.setUserID(userID);
    player.newPlayer.setPosition(result.name);
    return {newPlayer: player.newPlayer, roomID: player.roomID};
}
function spawnPlayer(position) {
    var spawn = tmxloader.map.objectgroup['spawn'].objects,
        x = spawn[position % spawn.length].x,
        y = spawn[position % spawn.length].y,
        name = spawn[position % spawn.length].name,
        direction;
    if (name == '0')
        direction = 'up';
    else
        direction = 'down';
    return {x: x, y: y, direction: direction}
}
//add new player to array
function addNewPlayer(id, username, x, y, direction) {
    // Initialise the new player
    var roomID = 0,
        newPlayer = new dto.Player(x, y, direction);
    newPlayer.setSocketID(id);
    newPlayer.setUsername(username);
    if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
        if(allSession[allSession.length-1].getRemotePlayers().length>=2) {
            roomID = newRoomID();
            newSession = new Session(roomID);
            allSession.push(newSession);
        }
        var remotePlayers = allSession[allSession.length - 1].getRemotePlayers();
        roomID = allSession[allSession.length - 1].getRoomID();
    } else {
        //WHY remotePlayers CHANGE, THIS IS A QUICK PATCH, NEED TO LOOK INTO IT
        //theres already remoteplayer up top, but i need to get it again here
        var remotePlayers = session.getRemotePlayers();
    }
    remotePlayers.push(newPlayer);
    return {newPlayer: remotePlayers[remotePlayers.indexOf(newPlayer)], roomID: roomID};
}
function newRoomID() {
    lastRoomID++;
    return (lastRoomID);
}