if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
    exports.Session = Session;
} else
    var session = new Session(0);

function Session(roomid) {
    var roomid = roomid,
        remotePlayers = [],
        lasers = [];

    //where bot will spawn, each map have a number of predefined point
    var whereSpawn = 0,
        bots = [];


    function getRoomID() {return roomid}
    function getRemotePlayers() { return remotePlayers; }
    function getLasers() { return lasers }

    return {

        whereSpawn: whereSpawn,
        bots: bots,

        getRoomID: getRoomID,
        getLasers: getLasers,
        getRemotePlayers: getRemotePlayers
    }
}