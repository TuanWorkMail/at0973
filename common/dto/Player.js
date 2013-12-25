if (typeof dto === 'undefined') {
    dto = {};
}
if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
    var tmxloader = require('../../server/js/TMX_Engine').tmxloader;
}
var defaultLive = 1;
/**************************************************
** CLIENT PLAYER CLASS
**************************************************/
dto.Player = function(x, y, direction, spawnPoint) {
    var uuid,
        userID,
        socketID,
        username,
        width = 40,
        height = 40,
        speed = 5,
        hitPoint = 1,
        live = 99,
        moving = false,
        score = 0,
        position,
        teamName = direction,
        botKill = 0,            // number of bot killed
        bulletType = 'normal';

	// Getters and setters
	var getX = function () { return x; }, setX = function (newX) { x = newX; },
        getY = function () { return y; }, setY = function (newY) { y = newY; },
        getUUID = function () { return uuid; },
        setUUID = function (para) { uuid = para; },
        getUserID = function () { return userID; },
        setUserID = function (para) { userID = para; },
        getSocketID = function () { return socketID; },
        setSocketID = function (para) { socketID = para; },
        getUsername = function () { return username; },
        setUsername = function (para) { username = para; },
        getDirection = function () { return direction; },
        setDirection = function (para) { direction = para; },
        getWidth = function () { return width; },
        setWidth = function (para) { width = para; },
        getHeight = function () { return height; },
        setHeight = function (para) { height = para; },
        getSpeed = function () { return speed; },
        setSpeed = function (para) { speed = para; },
        getScore = function () { return score; },
        setScore = function (para) { score = para; },
        getLive = function () { return live; },
        setLive = function (para) {
            if(para>defaultLive)
                live = defaultLive;
            else
                live = para;
        },
        getMoving = function () { return moving; },
        setMoving = function (para) { moving = para; },
        getPosition = function () { return position; },
        setPosition = function (para) { position = para; },
        getHitPoint = function () { return hitPoint; },
        setHitPoint = function (para) { hitPoint = para; },
        getBotKill = function(){return botKill}, setBotKill = function(para){botKill=para},
        getBulletType = function(){return bulletType}, setBulletType = function(para){bulletType=para};

    function getTeamName(){return teamName}function setTeamName(para){teamName=para}
    function getSpawnPoint(){return spawnPoint}

	return {
        socketID: socketID,
		getX: getX, setX: setX,
		getY: getY, setY: setY,
        getDirection: getDirection, setDirection: setDirection,
		getUUID: getUUID, setUUID: setUUID,
        getUserID: getUserID, setUserID: setUserID,
        getSocketID: getSocketID, setSocketID: setSocketID,
        getUsername: getUsername, setUsername: setUsername,
		getWidth: getWidth, setWidth: setWidth,
		getHeight: getHeight, setHeight: setHeight,
		getSpeed: getSpeed, setSpeed: setSpeed,
		getScore: getScore, setScore: setScore,
		getLive: getLive, setLive: setLive,
		getHitPoint: getHitPoint, setHitPoint: setHitPoint,
        getPosition: getPosition, setPosition: setPosition,
        getTeamName:getTeamName,setTeamName:setTeamName,
        getMoving: getMoving, setMoving: setMoving,
        getBotKill: getBotKill, setBotKill: setBotKill,
        getSpawnPoint:getSpawnPoint,
        getBulletType: getBulletType, setBulletType: setBulletType
	}
};
if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
    exports.Player = dto.Player;
}