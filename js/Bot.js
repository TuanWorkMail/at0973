/**************************************************
** CLIENT BOT CLASS
**************************************************/

//input: x/y coordinate, AI level, pathfiding result and current location in that result, direction bot is heading
var Bot = function (startX, startY, intel, path, where, direction) {
    var x = startX,
	y = startY,
        intel = intel,
        pathFound = path,
        whereNow = where,
        direction = direction;


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
        intel: intel,
        direction: direction,
        getX: getX,
        getY: getY,
        setX: setX,
        setY: setY
    }
};