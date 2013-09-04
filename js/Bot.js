/**************************************************
** GAME BOT CLASS
**************************************************/
var Bot = function (startX, startY, path, where) {
    var x = startX,
		y = startY,
        pathFound = path,
        whereNow = where;


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
        x: x,
        y: y,
        getX: getX,
        getY: getY,
        setX: setX,
        setY: setY
    }
};