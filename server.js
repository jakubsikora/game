/**************************************************
** NODE.JS REQUIREMENTS
**************************************************/
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

/**************************************************
** GAME VARIABLES
**************************************************/
var players,	// Array of connected players
		colors = ['red', 'green', 'blue', 'orange', 'yellow'],
		usedColors = [],
		gold,
		playerNumber = 1;

/**************************************************
** GAME INITIALISATION
**************************************************/
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


/**************************************************
** GAME EVENT HANDLERS
**************************************************/
var setEventHandlers = function() {
	// Socket.IO
	io.sockets.on("connection", onSocketConnection);
};

// New socket connection
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

function onResetGame() {
	// TODO: reset points
	var player = playerById(this.id);

	if (player.getAdmin()) {
		this.broadcast.emit("reset game");
		this.emit("reset game");
		util.log("Game reseted");
	}
};

// Socket client has disconnected
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
			console.log('admin disconnected');
			players[0].setAdmin(true);
			this.broadcast.emit("update admin", {id: players[0].id});
		}
	}
};

// New player has joined
function onNewPlayer(data) {
	var newColor;

	// Create a new player
	var newPlayer = new Player(data.x, data.y);
	newPlayer.id = this.id;
	newPlayer.setNumber(playerNumber);
	newPlayer.setAdmin(playerNumber === 1 ? true : false);
	newPlayer.setPoints(0);

	// Admin fallback
	if (players.length === 0) {
		newPlayer.setAdmin(true);
	}

	// TODO one method
	this.emit("init player", {
		number: newPlayer.getNumber(),
		admin: newPlayer.getAdmin(),
		points: newPlayer.getPoints(),
		id: newPlayer.id
	});

	if (gold) {
		this.emit('spawn gold', {
			x: gold.getX(),
			y: gold.getY()
		});
	}

	if (usedColors.indexOf(data.color) === -1) {
		usedColors.push(data.color);
		newPlayer.setColor(data.color);
	} else {
		newColor = colors.diff(usedColors)[0];
		usedColors.push(newColor);
		newPlayer.setColor(newColor);

		this.emit("change color", {color: newColor});
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
	var i, existingPlayer;
	for (i = 0; i < players.length; i++) {
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

// Player has moved
function onMovePlayer(data) {
	// Find player in array
	var movePlayer = playerById(this.id);

	// Player not found
	if (!movePlayer) {
		util.log("Player not found: "+this.id);
		return;
	};

	// Update player position
	movePlayer.setX(data.x);
	movePlayer.setY(data.y);

	// Collision
	if (
		movePlayer.getX() <= (gold.getX() + 10)
		&& gold.getX() <= (movePlayer.getX() + 10)
		&& movePlayer.getY() <= (gold.getY() + 10)
		&& gold.getY() <= (movePlayer.getY() + 10)
	) {
		console.log('collision');
	}

	// Broadcast updated position to connected socket clients
	this.broadcast.emit("move player", {id: movePlayer.id, x: movePlayer.getX(), y: movePlayer.getY()});
};

function onSpawnGold(data) {
	var player = playerById(this.id);

	if (player.getAdmin()) {
		if (gold) {
			gold.setX(data.x);
			gold.setY(data.y);
		} else {
			gold = new Gold(data.x, data.y);
		}

		console.log('onSpawnGold', gold.getX(), gold.getY());
		this.broadcast.emit('spawn gold', {
			x: gold.getX(),
			y: gold.getY()
		});
	}
};

/**************************************************
** GAME HELPER FUNCTIONS
**************************************************/
// Find player by ID
function playerById(id) {
	var i;
	for (i = 0; i < players.length; i++) {
		if (players[i].id == id)
			return players[i];
	};

	return false;
};

Array.prototype.diff = function(a) {
  return this.filter(function(i) {return a.indexOf(i) < 0;});
};


/**************************************************
** RUN THE GAME
**************************************************/
init();