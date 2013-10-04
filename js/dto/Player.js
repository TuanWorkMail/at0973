/**************************************************
** CLIENT PLAYER CLASS
**************************************************/
dto.Player = function(startX, startY, facing) {
	var x = startX,
		y = startY,
		id,
		moveAmount = 5,
        width = 40,
        height = 40,
		//which way the ship is facing
		direction = facing;
	
	// Getters and setters
	var getX = function() {
		return x;
	};

	var getY = function() {
		return y;
	};

	var setX = function(newX) {
		x = newX;
	};

	var setY = function(newY) {
		y = newY;
	};
	
	var getDirection = function() {
		return direction;
	};
	
	var setDirection = function(newX) {
		direction = newX;
	};


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
		getDirection: getDirection,
		setDirection: setDirection,
		update: update,
		draw: draw
	}
}