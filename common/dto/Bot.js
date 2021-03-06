﻿if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
    exports.Bot = Bot;
    var randomNumber = require('../helper').randomNumber;
}
/**************************************************
** CLIENT BOT CLASS
**************************************************/
function Bot(id, x, y, type) {
    var pathFound,
        whereNow = 0,
        to,
        direction = 0,  //up
        speed,
        image,
        hitPoint,
        width = 40,
        height = 40,
        lastOriginID = '';

    if (type == 'dumb') {
        speed = 2;
        hitPoint = 10;
    } else if (type == 'smart') {
        speed = 4;
        hitPoint = 1;
    }


    // Getters and setters
    function getX() { return x; }
    function setX(para) { x = para; }
    function getY() { return y; }
    function setY(para) { y = para; }
    function getID() { return id; }
    function setID(para) { id = para; }
    function getType() { return type; }
    function setType(para) { type = para; }
    function getPathFound() { return pathFound; }
    function setPathFound(para) { pathFound = para; }
    function getWhereNow() { return whereNow; }
    function setWhereNow(para) { whereNow = para; }
    function getDirection() { return direction; }
    function setDirection(para) { direction = para; }
    function getSpeed() { return speed; }
    function setSpeed(para) { speed = para; }
    function getImage() { return image; }
    function setImage(para) { image = para; }
    function getWidth() { return width; }
    function setWidth(para) { width = para; }
    function getHitPoint() { return hitPoint; }
    function setHitPoint(para) { hitPoint = para;}
    function getHeight() { return height; }
    function setHeight(para) { height = para; }
    function getLastOriginID(){return lastOriginID}
    function setLastOriginID(para){lastOriginID=para}

    // Define which variables and methods can be accessed
    return {
        id: id,
        x: x,
        y: y,
        type: type,
        pathFound: pathFound,
        whereNow: whereNow,
        to: to,
        speed: speed,
        image: image,
        width: width,
        height: height,


        getX: getX,
        setX: setX,
        getY: getY,
        setY: setY,
        getID: getID,
        setID: setID,
        getType: getType,
        setType: setType,
        getPathFound: getPathFound,
        setPathFound: setPathFound,
        getWhereNow: getWhereNow,
        setWhereNow: setWhereNow,
        getDirection: getDirection,
        setDirection: setDirection,
        getSpeed: getSpeed,
        setSpeed: setSpeed,
        getImage: getImage,
        setImage: setImage,
        getHitPoint: getHitPoint, setHitPoint: setHitPoint,
        getWidth: getWidth,
        setWidth: setWidth,
        getHeight: getHeight,
        setHeight: setHeight,
        getLastOriginID:getLastOriginID,
        setLastOriginID:setLastOriginID
    }
}