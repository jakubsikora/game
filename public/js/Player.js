/**
 * Obiekt gracza
 */
var Player = function(startX, startY) {
	var x = startX,
			y = startY,
			id,
			moveAmount = 3,
			points,
			color,
			number,
			admin = false;

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

	// Zmien pozycje gracza
	var update = function(keys, canvas) {

		// Poprzednia pozycja
		var prevX = x,
				prevY = y;

		// Ruch gracza w gore
		if (keys.up) {
			y -= moveAmount;
		}
		// Ruch gracza w dol
		else if (keys.down) {
			y += moveAmount;
		}

		// Ruch gracza w lewo
		if (keys.left) {
			x -= moveAmount;
		}
		// Ruch gracza w prawo
		else if (keys.right) {
			x += moveAmount;
		}

		// Sprawdzenie granic planszy
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

	// Rysowanie gracza na planszy
	var draw = function(ctx, localPlayer, finished) {
		var css,
				html;

		if (localPlayer) {
			css = 'font-weight: bold;background:' + color + ';color:#FFF;';
		} else {
			css = 'color:' + color + ';';
		}

		// Update HUD-a
		html =  '<div style="padding:5px;' + css + '">';
		html += '	<div style="display:inline;">Gracz ' + number  + '</div>';
		html += '	<div style="display:inline;">, Punkty (' + points  + ')</div>';
		html += '	<div style="display:inline;">' + (admin ? ', (Admin)' : '') + '</div>';
		html += '</div>';

		document.getElementById('hud').innerHTML += html;

		// Jezeli gra niezakonczona
		if (!finished) {
			ctx.fillStyle = color;
			ctx.fillRect(x-5, y-5, 10, 10);
		}
	};

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