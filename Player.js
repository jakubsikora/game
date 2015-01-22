/**************************************************
** GAME PLAYER CLASS
**************************************************/
var Player = function(startX, startY, startColor) {
	var x = startX,
			y = startY,
			id,
			color = startColor,
			number,
			admin = false,
			points;

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

	var getPoints = function() {
		return points;
	};

	var setPoints = function(newPoints) {
		points = newPoints;
	};

	var setColor = function(newColor) {
		color = newColor;
	};

	var getColor = function() {
		return color;
	};

	var setNumber = function(newNumber) {
		number = newNumber;
	};

	var getNumber = function() {
		return number;
	};

	var setAdmin = function(isAdmin) {
		admin = isAdmin;
	};

	var getAdmin = function() {
		return admin;
	};

	var increasePoints = function() {
		points = points + 1;
	};

	// Define which variables and methods can be accessed
	return {
		getX: getX,
		getY: getY,
		setX: setX,
		setY: setY,
		id: id,
		color: color,
		getPoints: getPoints,
		setPoints: setPoints,
		getColor: getColor,
		setColor: setColor,
		getNumber: getNumber,
		setNumber: setNumber,
		getAdmin: getAdmin,
		setAdmin: setAdmin,
		increasePoints: increasePoints
	};
};

// Export the Player class so you can use it in
// other files by using require("Player").Player
exports.Player = Player;