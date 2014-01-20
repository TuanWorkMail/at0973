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
    var id,
        userID,
        socketID,
        username,
        width = 40,
        height = 40,
        speed = 5,
        hitPoint = 10,
        live = 999,
        moving = false,
        teamName = direction,
        botKill = 0,
        playersKilled = 0,
        bulletType = 'normal',
        score = 0,
        deaths = 0,
        lastOriginID = '',
        position;

	// Getters and setters
	this.getX = function () { return x; };
    this.setX = function (newX) { x = newX; };
    this.getY = function () { return y; };
    this.setY = function (newY) { y = newY; };
    this.getID = function () { return id; };
    this.setID = function (para) { id = para; };
    this.getUserID = function () { return userID; };
    this.setUserID = function (para) { userID = para; };
    this.getSocketID = function () { return socketID; };
    this.setSocketID = function (para) { socketID = para; };
    this.getUsername = function () { return username; };
    this.setUsername = function (para) { username = para; };
    this.getDirection = function () { return direction; };
    this.setDirection = function (para) { direction = para; };
    this.getWidth = function () { return width; };
    this.setWidth = function (para) { width = para; };
    this.getHeight = function () { return height; };
    this.setHeight = function (para) { height = para; };
    this.getSpeed = function () { return speed; };
    this.setSpeed = function (para) { speed = para; };
    this.getLive = function () { return live; };
    this.setLive = function (para) {
        if(para>defaultLive)
            live = defaultLive;
        else
            live = para;
    };
    this.getMoving = function () { return moving; };
    this.setMoving = function (para) { moving = para; };
    this.getHitPoint = function () { return hitPoint; };
    this.setHitPoint = function (para) { hitPoint = para; };
    this.getBotKill = function(){return botKill};
    this.setBotKill = function(para){botKill=para};
    this.getBulletType = function(){return bulletType};
    this.setBulletType = function(para){bulletType=para};
    this.getTeamName=function (){return teamName};
    this.setTeamName=function (para){teamName=para};
    this.getSpawnPoint=function (){return spawnPoint};
    this.getScore=function (){return score};this.setScore=function (para){score=para};
    this.getDeaths=function(){return deaths};this.setDeaths=function(para){deaths=para};
    this.getLastOriginID=function(){return lastOriginID};
    this.setLastOriginID=function(para){lastOriginID=para};
    this.getPlayersKilled=function(){return playersKilled};
    this.setPlayersKilled=function(para){playersKilled=para};

    this.getPosition = function () { return position; };
    this.setPosition = function (para) { position = para; };
};
if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
    exports.Player = dto.Player;
}