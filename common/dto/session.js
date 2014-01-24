if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
    exports.Session = Session;
    var TMX_Engine = require('../../server/js/TMX_Engine'),
        helper = require('../helper'),
        clone2DArray = helper.clone2DArray,
        layerByName = TMX_Engine.layerByName,
        splitBigTile = require('../split-big-tile').splitBigTile,
        Team = require('./team').Team;
}

function Session(roomid) {
    var remotePlayers = [],
        team = [],
        lasers = [],
        destructible = [],
        indestructible = [],
        drop = [],
        combinedLayer = [],
        whereSpawn = 0,
        bossSpawnCount = 0,
        botLength = 0,
        bossLength = 0,
        bots = [],
        start = false,
        lastCountdown = 0,
        destroyedBrick = [],
        isRemoved = false,
        characters = [],
        inputQueue = [];

    clone2DArray(layerByName('destructible').data, destructible);
    clone2DArray(layerByName('indestructible').data, indestructible);
    if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
        team.push(new Team('up'));
        team.push(new Team('down'));
    }

    function getRoomID() {return roomid}
    function getRemotePlayers() { return remotePlayers; }
    function getTeam(){return team}
    function getLasers() { return lasers }
    function getDestructible() {return destructible}
    function setDestructible(para) {destructible=para}
    function getIndestructible() {return indestructible}
    function setIndestructible(para) {indestructible=para}
    function getDrop() {return drop}
    function getWhereSpawn(){return whereSpawn} function setWhereSpawn(para){whereSpawn=para}
    function getCombinedLayer(){return combinedLayer} function setCombinedLayer(para){combinedLayer=para}
    function getBossSpawnCount(){return bossSpawnCount} function setBossSpawnCount(para){bossSpawnCount=para}
    function getBotLength(){return botLength} function setBotLength(para){botLength=para}
    function getBossLength(){return bossLength} function setBossLength(para){bossLength=para}
    function getStart(){return start}function setStart(para){start=para}
    function getLastCountdown(){return lastCountdown}function setLastCountdown(para){lastCountdown=para}
    function getDestroyedBrick(){return destroyedBrick}
    function getIsRemoved(){return isRemoved}function setIsRemoved(para){isRemoved=para;}
    function getCharacters(){return characters}
    function getInputQueue(){return inputQueue}
    return {
        bots: bots,
        getDestructible: getDestructible,
        setDestructible: setDestructible,
        getIndestructible: getIndestructible,
        setIndestructible: setIndestructible,
        getRoomID: getRoomID,
        getLasers: getLasers,
        getRemotePlayers: getRemotePlayers,
        getTeam:getTeam,
        getDrop: getDrop,
        getWhereSpawn: getWhereSpawn, setWhereSpawn: setWhereSpawn,
        getCombinedLayer: getCombinedLayer, setCombinedLayer: setCombinedLayer,
        getBossCount: getBossSpawnCount, setBossCount: setBossSpawnCount,
        getBotLength: getBotLength, setBotLength: setBotLength,
        getStart:getStart,setStart:setStart,
        getLastCountdown:getLastCountdown,setLastCountdown:setLastCountdown,
        getDestroyedBrick:getDestroyedBrick,
        getCharacters:getCharacters,
        getBossLength: getBossLength, setBossLength: setBossLength,
        getIsRemoved:getIsRemoved,setIsRemoved:setIsRemoved,
        getInputQueue:getInputQueue
    }
}