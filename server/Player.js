/**************************************************
** SERVER PLAYER CLASS
**************************************************/
var Player = function(startX, startY, facing) {
	var x = startX,
		y = startY,
		id,
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

	// Define which variables and methods can be accessed
	return {
		getX: getX,
		getY: getY,
		setX: setX,
		setY: setY,
		getDirection: getDirection,
		setDirection: setDirection,
		id: id
	}
};

// Export the Player class so you can use it in
// other files by using require("Player").Player
exports.Player = Player;