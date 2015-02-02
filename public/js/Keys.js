/**
 * Obiekt klawiszy
 */
var Keys = function(up, left, right, down) {
	var up = up || false,
		left = left || false,
		right = right || false,
		down = down || false;

	var onKeyDown = function(e) {
		var that = this,
			c = e.keyCode;
		switch (c) {
			case 37: // Strzalka w lewo
				that.left = true;
				break;
			case 38: // Strzalka w gore
				that.up = true;
				break;
			case 39: // Strzalka w prawo
				that.right = true;
				break;
			case 40: // Strzalka w dol
				that.down = true;
				break;
		};
	};

	var onKeyUp = function(e) {
		var that = this,
			c = e.keyCode;
		switch (c) {
			case 37: // Strzalka w lewo
				that.left = false;
				break;
			case 38: // Strzalka w gore
				that.up = false;
				break;
			case 39: // Strzalka w prawo
				that.right = false;
				break;
			case 40: // Strzalka w dol
				that.down = false;
				break;
		};
	};

	return {
		up: up,
		left: left,
		right: right,
		down: down,
		onKeyDown: onKeyDown,
		onKeyUp: onKeyUp
	};
};