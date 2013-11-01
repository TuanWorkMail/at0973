if (typeof dto === 'undefined') {
    dto = {};
}
/**************************************************
** CLIENT PLAYER CLASS
**************************************************/
dto.Player = function(startX, startY, direction) {
    var x = startX,
		y = startY,
        direction = direction,
		uuid,
        userID,
        socketID,
        username,
        width = 40,
        height = 40,
        image,
        speed = 5,
        hitPoint = 10,
        live = 2,
        moving = false,
        score = 0,
        imageUp, imageDown, imageLeft, imageRight;

    if (typeof require === 'undefined' && typeof exports === 'undefined') {
	    image = new Image();
        image.src = 'images/ship.png';
    }

	// Getters and setters
	var getX = function () { return x; },
        getY = function () { return y; },
        setX = function (newX) { x = newX; },
        setY = function (newY) { y = newY; },
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
        getImage = function () { return image; },
        setImage = function (para) { image = para; },
        getScore = function () { return score; },
        setScore = function (para) { score = para; },
        getLive = function () { return live; },
        setLive = function (para) { live = para; },
        getMoving = function () { return moving; },
        setMoving = function (para) { moving = para; },
        getHitPoint = function () { return hitPoint; },
        setHitPoint = function (para) { hitPoint = para; };

	// Draw player
	var draw = function(ctx) {
		if (direction=='right') {
			//ctx.drawImage(ship_right, x, y);
            drawTile(1, x, y);
		} else if (direction=='left') {
			//ctx.drawImage(ship_left, x, y);
            drawTile(4, x, y);
		} if (direction=='up') {
			//ctx.drawImage(ship, x, y);
            drawTile(3, x, y);
		} else if (direction=='down') {
			//ctx.drawImage(ship_down, x, y);
            drawTile(2, x, y);
		}
	};
    // reset live
    var reset = function() {
        live = 2;
    }

	// Define which variables and methods can be accessed
	return {
        draw: draw,
        reset: reset,
        socketID: socketID,

		getX: getX,
		getY: getY,
		setX: setX,
		setY: setY,
		getUUID: getUUID,
		setUUID: setUUID,
        getUserID: getUserID,
        setUserID: setUserID,
        getSocketID: getSocketID,
        setSocketID: setSocketID,
        getUsername: getUsername,
        setUsername: setUsername,
		getDirection: getDirection,
		setDirection: setDirection,
		getWidth: getWidth,
		setWidth: setWidth,
		getHeight: getHeight,
		setHeight: setHeight,
		getSpeed: getSpeed,
		setSpeed: setSpeed,
		getImage: getImage,
		setImage: setImage,
		getScore: getScore,
		setScore: setScore,
		getLive: getLive,
		setLive: setLive,
		getHitPoint: getHitPoint,
		setHitPoint: setHitPoint,
        getMoving: getMoving,
        setMoving: setMoving,
	}
}
if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
    exports.Player = dto.Player;
}