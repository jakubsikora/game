/**
 *
 */
var express = require("express"),
		path = require("path"),
		app = express(),
		server = require("http").createServer(app),
		util = require("util"),					// Utility resources (logging, object inspection, etc)
		io = require("socket.io").listen(server),				// Socket.IO
		Player = require("./Player").Player;	// Player class
		Gold = require("./Gold").Gold;	// Gold class

server.listen(process.env.PORT || 3000);

app.use(express.static(path.join(__dirname,'public')));

/**
 *
 */
var players = [],	// Array of connected players
		colors = ['red', 'green', 'blue', 'orange', 'black', 'pink'],
		usedColors = [],
		gold = null,
		playerNumber = 1;

/**
 *
 */
function init() {
	// Create an empty array to store players
	players = [];

	// Configure Socket.IO
	io.configure(function() {
		// Only use WebSockets
		io.set("transports", ["websocket"]);

		// Restrict log output
		io.set("log level", 2);
	});

	// Start listening for events
	setEventHandlers();
};

/**
 *
 */
var setEventHandlers = function() {
	// Socket.IO
	io.sockets.on("connection", onSocketConnection);
};

/**
 *
 */
function onSocketConnection(client) {
	util.log("New player has connected: "+client.id);

	// Listen for client disconnected
	client.on("disconnect", onClientDisconnect);

	// Listen for new player message
	client.on("new player", onNewPlayer);

	// Listen for move player message
	client.on("move player", onMovePlayer);

	// Listen for reset game message
	client.on("reset game", onResetGame);

	client.on("spawn gold", onSpawnGold);
};

/**
 *
 */
function onResetGame() {
	var player = playerById(this.id),
			existingPlayer;

	if (player.getAdmin()) {
		for (var i = 0; i < players.length; i++) {
			existingPlayer = players[i];
			existingPlayer.setPoints(0);

			this.emit("update points", {
				id: existingPlayer.id,
				points: existingPlayer.getPoints()
			});

			this.broadcast.emit("update points", {
				id: existingPlayer.id,
				points: existingPlayer.getPoints()
			});
		}

		this.broadcast.emit("reset game");
		this.emit("reset game");
		util.log("Game reseted");
	}
};

/**
 *
 */
function onClientDisconnect() {
	util.log("Player has disconnected: "+this.id);

	var removePlayer = playerById(this.id);

	usedColors.splice(usedColors.indexOf(removePlayer.getColor()), 1);

	// Player not found
	if (!removePlayer) {
		util.log("Player not found: "+this.id);
		return;
	};

	// Remove player from players array
	players.splice(players.indexOf(removePlayer), 1);

	// Broadcast removed player to connected socket clients
	this.broadcast.emit("remove player", {id: this.id});

	if (players.length === 0) {
		gold = null;
	} else {
		if (removePlayer.getAdmin()) {
			players[0].setAdmin(true);
			this.broadcast.emit("update admin", {id: players[0].id});
		}
	}
};

/**
 *
 */
function onNewPlayer(data) {
	// Create a new player
	var newPlayer = new Player(data.x, data.y),
			newColor = selectColor(),
			existingPlayer;

	newPlayer.id = this.id;
	newPlayer.setNumber(playerNumber);
	newPlayer.setAdmin(playerNumber === 1 ? true : false);
	newPlayer.setPoints(0);
	newPlayer.setColor(newColor);

	// Admin fallback
	if (players.length === 0) {
		newPlayer.setAdmin(true);
	}

	this.emit("init player", {
		number: newPlayer.getNumber(),
		admin: newPlayer.getAdmin(),
		points: newPlayer.getPoints(),
		id: newPlayer.id,
		color: newPlayer.getColor()
	});

	if (gold) {
		this.emit('spawn gold', {
			x: gold.getX(),
			y: gold.getY()
		});
	}

	// Broadcast new player to connected socket clients
	this.broadcast.emit("new player", {
		id: newPlayer.id,
		x: newPlayer.getX(),
		y: newPlayer.getY(),
		color: newPlayer.getColor(),
		number: newPlayer.getNumber(),
		admin: newPlayer.getAdmin(),
		points: newPlayer.getPoints()
	});

	// Send existing players to the new player
	for (var i = 0; i < players.length; i++) {
		existingPlayer = players[i];

		this.emit("new player", {
			id: existingPlayer.id,
			x: existingPlayer.getX(),
			y: existingPlayer.getY(),
			color: existingPlayer.getColor(),
			number: existingPlayer.getNumber(),
			admin: existingPlayer.getAdmin(),
			points: existingPlayer.getPoints()
		});
	};

	// Add new player to the players array
	players.push(newPlayer);
	playerNumber++;
};

/**
 *
 */
function selectColor() {
	var newColor = colors[Math.floor(Math.random() * colors.length)];

	if (usedColors.indexOf(newColor) === -1) {
		usedColors.push(newColor);
	} else {
		newColor = colors.diff(usedColors)[0];
		usedColors.push(newColor);
	}

	return newColor;
}

/**
 *
 */
function onMovePlayer(data) {
	// Find player in array
	var movePlayer = playerById(this.id),
			newX,
			newY;

	// Player not found
	if (!movePlayer) {
		util.log("Player not found: "+this.id);
		return;
	};

	// Update player position
	movePlayer.setX(data.x);
	movePlayer.setY(data.y);

	// Collision
	if (data.collision) {
		movePlayer.increasePoints();

		newX = Math.round(Math.random()*(data.width-5));
		newY = Math.round(Math.random()*(data.height-5));

		gold.setX(newX);
		gold.setY(newY);

		this.broadcast.emit('spawn gold', {
			x: gold.getX(),
			y: gold.getY()
		});

		this.emit('spawn gold', {
			x: gold.getX(),
			y: gold.getY()
		});

		this.emit("update points", {
			id: movePlayer.id,
			points: movePlayer.getPoints()
		});

		this.broadcast.emit("update points", {
			id: movePlayer.id,
			points: movePlayer.getPoints()
		});
	}

	// Broadcast updated position to connected socket clients
	this.broadcast.emit("move player", {
		id: movePlayer.id,
		x: movePlayer.getX(),
		y: movePlayer.getY()
	});
};

/**
 *
 */
function onSpawnGold(data) {
	var player = playerById(this.id);

	if (player.getAdmin()) {
		if (gold) {
			gold.setX(data.x);
			gold.setY(data.y);
		} else {
			gold = new Gold(data.x, data.y);
		}

		this.broadcast.emit('spawn gold', {
			x: gold.getX(),
			y: gold.getY()
		});
	}
};

/**
 *
 */
function playerById(id) {
	for (var i = 0; i < players.length; i++) {
		if (players[i].id == id)
			return players[i];
	};

	return false;
};

/**
 *
 */
Array.prototype.diff = function(a) {
  return this.filter(function(i) {return a.indexOf(i) < 0;});
};


/**
 *
 */
init();