/**************************************************
** GAME PLAYER CLASS
**************************************************/
var Player = function(startX, startY, startColor) {
	var x = startX,
			y = startY,
			id,
			moveAmount = 3,
			points,
			color = startColor,
			number,
			admin = false;

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

	var getNumber = function() {
		return number;
	};

	var setNumber = function(newNumber) {
		number = newNumber;
	};

	var getAdmin = function() {
		return admin;
	};

	var setAdmin = function(newAdmin) {
		admin = newAdmin;
	};

	// Update player position
	var update = function(keys, canvas) {

		// Previous position
		var prevX = x,
				prevY = y;

		// Up key takes priority over down
		if (keys.up) {
			y -= moveAmount;
		} else if (keys.down) {
			y += moveAmount;
		}

		// Left key takes priority over right
		if (keys.left) {
			x -= moveAmount;
		} else if (keys.right) {
			x += moveAmount;
		}

		// Check canvas borders
		if (x > canvas.clientWidth) {
			x = x % canvas.clientWidth;
		} else if (x < 0) {
			x = canvas.clientWidth + (x % canvas.clientWidth);
		}

		if (y > canvas.clientHeight) {
			y = y % canvas.clientHeight;
		} else if (y < 0) {
			y = canvas.clientHeight + (y % canvas.clientHeight);
		}

		return (prevX !== x || prevY !== y) ? true : false;
	};

	// Draw player
	var draw = function(ctx, localPlayer) {
		var css,
				html;

		if (localPlayer) {
			css = 'font-weight: bold;background:' + color + ';color:#FFF;';
		} else {
			css = 'color:' + color + ';';
		}

		ctx.fillStyle = color;
		ctx.fillRect(x-5, y-5, 10, 10);

		html =  '<div style="padding:5px;' + css + '">';
		html += '	<div style="display:inline;">Gracz ' + number  + '</div>';
		html += '	<div style="display:inline;">, Punkty (' + points  + ')</div>';
		html += '	<div style="display:inline;">' + (admin ? ', (Admin)' : '') + '</div>';
		html += '</div>';

		document.getElementById('hud').innerHTML += html;
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
		setColor: setColor,
		getNumber: getNumber,
		setNumber: setNumber,
		getAdmin: getAdmin,
		setAdmin: setAdmin,
		id: id
	}
};