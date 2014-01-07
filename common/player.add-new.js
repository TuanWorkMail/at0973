if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
    var tmxloader = require('../server/js/TMX_Engine').tmxloader,
        Session = require('./dto/Session').Session,
        helper = require('./helper'),
        debug = helper.debug,
        createUUID = helper.createUUID,
        dto = {};
    dto.Player = require('./dto/Player').Player;
    exports.newPlayer = newPlayer;
    exports.spawnPlayer = spawnPlayer;
    var lastRoomID = 0;                                            // auto increment roomID
}
function newPlayer(socketID, username, userID) {
    var result = spawnPlayer(allSession[allSession.length-1].getRemotePlayers().length),
        x = result.x,
        y = result.y,
        direction = result.direction,
        spawnPoint = result.spawnPoint,
        team = result.team;
    if(allSession[allSession.length-1].getRemotePlayers().length>=tmxloader.map.objectgroup['spawn'].objects.length) {
        var roomID = newRoomID();
        var newSession = new Session(roomID);
        allSession.push(newSession);
    }
    var player = addNewPlayer(socketID, username, x, y, direction, spawnPoint);
    if (!player) return false;
    player.newPlayer.setUserID(userID);
    player.newPlayer.setTeamName(team);
    return {newPlayer: player.newPlayer, roomID: player.roomID};
}
function spawnPlayer(position) {
    var spawn = tmxloader.map.objectgroup['spawn'].objects,
        point = position % spawn.length,
        x = spawn[point].x,
        y = spawn[point].y,
        direction;
    switch (spawn[point].name){
        case 'up': direction = 0; break;
        case 'down': direction = 2; break;
        case 'left': direction = -1; break;
        case 'right': direction = 1; break;
    }
    debug.log('x: '+x+' y: '+y+' direction: '+direction);
    return {x: x, y: y, direction: direction, spawnPoint: point, team:spawn[point].name}
}
//add new player to array
function addNewPlayer(id, username, x, y, direction, spawnPoint) {
    var roomID = 0,
        newPlayer = new dto.Player(x, y, direction, spawnPoint);
    newPlayer.setSocketID(id);
    newPlayer.setUsername(username);
    newPlayer.setID(createUUID());
    if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
        allSession = allSession;
        var remotePlayers = allSession[allSession.length - 1].getRemotePlayers();
        roomID = allSession[allSession.length - 1].getRoomID();
    } else {
        //WHY remotePlayers CHANGE, THIS IS A QUICK PATCH, NEED TO LOOK INTO IT
        //theres already remoteplayer up top, but i need to get it again here
        remotePlayers = session.getRemotePlayers();
    }
    remotePlayers.push(newPlayer);
    return {newPlayer: remotePlayers[remotePlayers.indexOf(newPlayer)], roomID: roomID};
}
function newRoomID() {
    lastRoomID++;
    return lastRoomID;
}