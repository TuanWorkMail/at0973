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
        drop = [],
        combinedLayer = [],
        whereSpawn = 0,
        bossSpawnCount = 0,
        botLength = 0,
        bossLength = 0,
        bots = [];

    clone2DArray(layerByName('destructible').data, destructible);

    function getRoomID() {return roomid}
    function getRemotePlayers() { return remotePlayers; }
    function getLasers() { return lasers }
    function getDestructible() {return destructible}
    function getDrop() {return drop}
    function getWhereSpawn(){return whereSpawn} function setWhereSpawn(para){whereSpawn=para}
    function getCombinedLayer(){return combinedLayer} function setCombinedLayer(para){combinedLayer=para}
    function getBossSpawnCount(){return bossSpawnCount} function setBossSpawnCount(para){bossSpawnCount=para}
    function getBotLength(){return botLength} function setBotLength(para){botLength=para}
    function getBossLength(){return bossLength} function setBossLength(para){bossLength=para}


    return {

        bots: bots,

        getDestructible: getDestructible,
        getRoomID: getRoomID,
        getLasers: getLasers,
        getRemotePlayers: getRemotePlayers,
        getDrop: getDrop,
        getWhereSpawn: getWhereSpawn, setWhereSpawn: setWhereSpawn,
        getCombinedLayer: getCombinedLayer, setCombinedLayer: setCombinedLayer,
        getBossCount: getBossSpawnCount, setBossCount: setBossSpawnCount,
        getBotLength: getBotLength, setBotLength: setBotLength,
        getBossLength: getBossLength, setBossLength: setBossLength
    }
}