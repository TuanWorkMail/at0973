if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
    exports.Session = Session;
    var TMX_Engine = require('../../server/js/TMX_Engine'),
        helper = require('../helper'),
        clone2DArray = helper.clone2DArray,
        layerByName = TMX_Engine.layerByName,
        splitBigTile = require('../split-big-tile').splitBigTile;
}

function Session(roomid) {
    var roomid = roomid,
        remotePlayers = [],
        lasers = [],
        destructible = [],
        drop = [];

    //where bot will spawn, each map have a number of predefined point
    var whereSpawn = 0,
        bots = [];

    //destructible = splitBigTile(layerByName('destructible').data);
    //if(typeof require!=='undefined' && typeof exports !== 'undefined') {
        var result2 = layerByName('destructible');
        clone2DArray(result2.data, destructible);
    //}

    function getRoomID() {return roomid}
    function getRemotePlayers() { return remotePlayers; }
    function getLasers() { return lasers }
    function getDestructible() {return destructible}
    function getDrop() {return drop}

    return {

        whereSpawn: whereSpawn,
        bots: bots,

        getDestructible: getDestructible,
        getRoomID: getRoomID,
        getLasers: getLasers,
        getRemotePlayers: getRemotePlayers,
        getDrop: getDrop
    }
}