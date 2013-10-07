/**************************************************
** CLIENT PLAYER CLASS
**************************************************/
dto.Player = function(startX, startY, facing) {
	var x = startX,
		y = startY,
		id,
        width = 40,
        height = 40,
        image = new Image(),
        speed = 5,
		//which way the ship is facing
		direction = facing;
	
	image.src = 'images/ship.png';

	// Getters and setters
	var getX = function () { return x; },
        getY = function () { return y; },
        setX = function (newX) { x = newX; },
        setY = function (newY) { y = newY; },
        getID = function () { return id; },
        setID = function (para) { id = para; },
        getDirection = function () { return direction; },
        setDirection = function (para) { direction = para; },
        getWidth = function () { return width; },
        setWidth = function (para) { width = para; },
        getHeight = function () { return height; },
        setHeight = function (para) { height = para; },
        getSpeed = function () { return speed; },
        setSpeed = function (para) { speed = para; },
        getImage = function () { return image; },
        setImage = function (para) { image = para; };

	// Draw player
	var draw = function(ctx) {
		if (direction=='right') {
			ctx.drawImage(ship_right, x, y);
		} else if (direction=='left') {
			ctx.drawImage(ship_left, x, y);
		} if (direction=='up') {
			ctx.drawImage(ship, x, y);
		} else if (direction=='down') {
			ctx.drawImage(ship_down, x, y);
		}
	};

	// Define which variables and methods can be accessed
	return {
		getX: getX,
		getY: getY,
		setX: setX,
		setY: setY,
		getID: getID,
		setID: setID,
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
		draw: draw
	}
}