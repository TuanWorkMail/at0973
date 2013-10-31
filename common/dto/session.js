if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
    exports.Session = Session;
} else
    var session = new Session(0);

function Session(sid) {
    var id = sid,
        remotePlayers = [];

    function getID() {return id} function setID(para) {id = para}
    function getRemotePlayers() { return remotePlayers; }

    return {
        getID: getID, setID: setID,
        getRemotePlayers: getRemotePlayers
    }
}