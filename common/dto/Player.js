if (typeof dto === 'undefined') {
    dto = {};
}
if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
    var tmxloader = require('../../server/js/TMX_Engine').tmxloader;
}
/**************************************************
** CLIENT PLAYER CLASS
**************************************************/
dto.Player = function(spawnX, spawnY, spawnDirection) {
    var x = spawnX,
        y = spawnY,
        direction = spawnDirection,
        uuid,
        userID,
        socketID,
        username,
        width = 40,
        height = 40,
        speed = 5,
        hitPoint = 1,
        live = 99,
        defaultLive = 1,
        moving = false,
        score = 0,
        position,
        teamName = direction,
        shootBrick = false,     // ability to shoot brick
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
        getShootBrick = function () { return shootBrick; }, setShootBrick = function (para) { shootBrick = para;},
        getBotKill = function(){return botKill}, setBotKill = function(para){botKill=para},
        getBulletType = function(){return bulletType}, setBulletType = function(para){bulletType=para};
    function getTeamName(){return teamName}function setTeamName(para){teamName=para}
    function getSpawnX(){return spawnX}
    function getSpawnY(){return spawnY}
    function getSpawnDirection(){return spawnDirection}

	return {
        socketID: socketID,
        getSpawnX:getSpawnX,
        getSpawnY:getSpawnY,
        getSpawnDirection:getSpawnDirection,
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
        getShootBrick: getShootBrick, setShootBrick: setShootBrick,
        getBotKill: getBotKill, setBotKill: setBotKill,
        getBulletType: getBulletType, setBulletType: setBulletType
	}
};
if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
    exports.Player = dto.Player;
}