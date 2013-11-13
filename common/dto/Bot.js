if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
    exports.Bot = Bot;
    var randomNumber = require('../helper').randomNumber;
}
/**************************************************
** CLIENT BOT CLASS
**************************************************/
function Bot(id, startX, startY, type) {
    var id = id,
        x = startX,
	    y = startY,
        type = type,
        pathFound,
        whereNow = 0,
        to,
        direction,
        speed,
        image,
        width = 40,
        height = 40;

    if (typeof require === 'undefined' && typeof exports === 'undefined') {
        image = new Image();
        if (type == 'dumb') {
            image.src = 'images/8bit_enemy.png';
        } else if (type == 'smart') {
            image.src = 'images/bot2.png';
        }
    }

    if (type == 'dumb') {
        switch (randomNumber(1, 4)) {
            case 1:
                direction = 'up';
                break;
            case 2:
                direction = 'down';
                break;
            case 3:
                direction = 'left';
                break;
            case 4:
                direction = 'right';
                break;
        }
        speed = 2;
    } else if (type == 'smart') {
        speed = 4;
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
    function getHeight() { return height; }
    function setHeight(para) { height = para; }

    // Define which variables and methods can be accessed
    return {
        id: id,
        x: x,
        y: y,
        type: type,
        pathFound: pathFound,
        whereNow: whereNow,
        to: to,
        direction: direction,
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
        getWidth: getWidth,
        setWidth: setWidth,
        getHeight: getHeight,
        setHeight: setHeight
    }
}