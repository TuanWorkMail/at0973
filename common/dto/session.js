if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
    exports.Session = Session;
} else
    var session = new Session(0);

function Session(sid) {
    var id = sid,
        roomName,
        remotePlayers = [];
    //where bot will spawn, each map have a number of predefined point
    var whereSpawn = 0,
        bots = [],
        botsLength = 2;

    function getID() {return id} function setID(para) {id = para}
    function getRemotePlayers() { return remotePlayers; }

    return {

        whereSpawn: whereSpawn,
        bots: bots,
        botsLength: botsLength,
        getID: getID, setID: setID,
        getRemotePlayers: getRemotePlayers
    }
}