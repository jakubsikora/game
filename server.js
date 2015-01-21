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

server.listen(process.env.PORT || 3000);

app.use(express.static(path.join(__dirname,'public')));

/**************************************************
** GAME VARIABLES
**************************************************/
var players;	// Array of connected players

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
};

function onResetGame() {
	util.log("Game reseted");

	// TODO: reset points

	this.broadcast.emit("reset game");
	this.emit("reset game");
};

// Socket client has disconnected
function onClientDisconnect() {
	util.log("Player has disconnected: "+this.id);

	var removePlayer = playerById(this.id);

	// Player not found
	if (!removePlayer) {
		util.log("Player not found: "+this.id);
		return;
	};

	// Remove player from players array
	players.splice(players.indexOf(removePlayer), 1);

	// Broadcast removed player to connected socket clients
	this.broadcast.emit("remove player", {id: this.id});
};

// New player has joined
function onNewPlayer(data) {
	console.log('onNewPlayer', data);
	// Create a new player
	var newPlayer = new Player(data.x, data.y);
	newPlayer.id = this.id;
	newPlayer.setColor(data.color);
	console.log('onNewPlayer', newPlayer.getColor());

	// Broadcast new player to connected socket clients
	this.broadcast.emit("new player", {
		id: newPlayer.id,
		x: newPlayer.getX(),
		y: newPlayer.getY(),
		color: newPlayer.getColor()
	});

	// Send existing players to the new player
	var i, existingPlayer;
	for (i = 0; i < players.length; i++) {
		existingPlayer = players[i];
		console.log('existingPlayer', existingPlayer.getColor());

		this.emit("new player", {
			id: existingPlayer.id,
			x: existingPlayer.getX(),
			y: existingPlayer.getY(),
			color: existingPlayer.getColor()
		});
	};

	// Add new player to the players array
	players.push(newPlayer);
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

	// Broadcast updated position to connected socket clients
	this.broadcast.emit("move player", {id: movePlayer.id, x: movePlayer.getX(), y: movePlayer.getY()});
};

// TODO
function onPointsChange(data) {

}


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


/**************************************************
** RUN THE GAME
**************************************************/
init();