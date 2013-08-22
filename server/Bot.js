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

    var getDirection = function () {
        return direction;
    };

    var setDirection = function (newX) {
        direction = newX;
    };

    // Update player position
    var update = function (keys) {
        // Previous position
        var prevX = x,
			prevY = y;

        // Up key takes priority over down
        if (keys.up) {
            y -= moveAmount;
        } else if (keys.down) {
            y += moveAmount;
        };

        // Left key takes priority over right
        if (keys.left) {
            x -= moveAmount;
        } else if (keys.right) {
            x += moveAmount;
        };

        return (prevX != x || prevY != y) ? true : false;
    };

    // Draw player
    var draw = function (ctx) {
        ship = new Image();
        ship.src = 'ship.png';
        ship_right = new Image();
        ship_right.src = 'ship_right.png';
        ship_left = new Image();
        ship_left.src = 'ship_left.png';
        ship_down = new Image();
        ship_down.src = 'ship_down.png';
        if (direction == 1) {
            ctx.drawImage(ship_right, x, y);
        } else if (direction == -1) {
            ctx.drawImage(ship_left, x, y);
        } if (direction == 0) {
            ctx.drawImage(ship, x, y);
        } else if (direction == 2) {
            ctx.drawImage(ship_down, x, y);
        }
    };

    // Define which variables and methods can be accessed
    return {
        pathFound: pathFound,
        whereNow: whereNow,
        getX: getX,
        getY: getY,
        setX: setX,
        setY: setY,
        getDirection: getDirection,
        setDirection: setDirection,
        update: update,
        draw: draw
    }
};