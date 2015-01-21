/**************************************************
** GAME PLAYER CLASS
**************************************************/
var Player = function(startX, startY, startColor) {
	var x = startX,
			y = startY,
			id,
			moveAmount = 2,
			points = 1,
			color = startColor;

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

	var getColor = function() {
		return color;
	};

	var setColor = function(newColor) {
		color = newColor;
	};

	// Update player position
	var update = function(keys) {
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
	var draw = function(ctx) {
		ctx.fillStyle = color;
		ctx.fillRect(x-5, y-5, 10, 10);
		document.getElementById('hud').innerHTML += '<span>Player: ' + this.id + '</span><br/>';
	};


	// Define which variables and methods can be accessed
	return {
		getX: getX,
		getY: getY,
		setX: setX,
		setY: setY,
		update: update,
		draw: draw,
		getPoints: getPoints,
		setPoints: setPoints,
		getColor: getColor,
		setColor: setColor
	}
};