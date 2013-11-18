if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
    exports.Session = Session;
} else
    var session = new Session(0);

function Session(roomid) {
    var roomid = roomid,
        remotePlayers = [],
        lasers = [],
        destructible = [];

    //where bot will spawn, each map have a number of predefined point
    var whereSpawn = 0,
        bots = [];

    function getRoomID() {return roomid}
    function getRemotePlayers() { return remotePlayers; }
    function getLasers() { return lasers }
    function getDestructible() {return destructible}

    return {

        whereSpawn: whereSpawn,
        bots: bots,

        getDestructible: getDestructible,
        getRoomID: getRoomID,
        getLasers: getLasers,
        getRemotePlayers: getRemotePlayers
    }
}