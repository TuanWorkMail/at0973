/**************************************************
** CLIENT BOT CLASS
**************************************************/

var Bot = function (id, startX, startY, type) {
    var id = id,
        x = startX,
	    y = startY,
        type = type,
        pathFound,
        whereNow = 0,
        to,
        direction,
        speed;

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
        speed = 5;
    }

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