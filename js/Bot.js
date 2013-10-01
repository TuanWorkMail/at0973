/**************************************************
** CLIENT BOT CLASS
**************************************************/

/**
 * @param id
 * @param startX        coordinate
 * @param startY
 * @param intel         difficulty/bot intelligence
 * @param path          pathfinder result
 * @param where         currently location in [path]
 * @param where         to which tile in [path]
 * @param direction
 * @param speed
 */
var Bot = function (id, startX, startY, type, path, to, direction, speed) {
    var id = id,
        x = startX,
	    y = startY,
        type = type,
        pathFound = path,
        whereNow = 0,
        to = to,
        direction = direction,
        speed = speed;


    // Getters and setters
    var getX = function () {
        return x;
    };

    var getY = function () {
        return y;
    };

    var setX = function (newX) {
        x = newX;
    };

    var setY = function (newY) {
        y = newY;
    };

    

    // Define which variables and methods can be accessed
    return {
        pathFound: pathFound,
        whereNow: whereNow,
        to: to,
        type: type,
        direction: direction,
        speed: speed,
        id: id,
        getX: getX,
        getY: getY,
        setX: setX,
        setY: setY
    }
};