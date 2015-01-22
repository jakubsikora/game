/**************************************************
** GAME VARIABLES
**************************************************/
var canvas,			// Canvas DOM element
		ctx,			// Canvas rendering context
		keys,			// Keyboard input
		localPlayer,	// Local player
		remotePlayers,	// Remote players
		socket,			// Socket connection
		ai;


/**************************************************
** GAME INITIALISATION
**************************************************/
function init() {
	// Declare the canvas and rendering context
	canvas = document.getElementById("gameCanvas");
	ctx = canvas.getContext("2d");

	// Maximise the canvas
	canvas.width = 600;
	canvas.height = 600;

	// Initialise keyboard controls
	keys = new Keys();

	// Calculate a random start position for the local player
	// The minus 5 (half a player size) stops the player being
	// placed right on the egde of the screen
	var startX = Math.round(Math.random()*(canvas.width-5)),
			startY = Math.round(Math.random()*(canvas.height-5)),
			colors = ['red', 'green', 'blue', 'orange', 'black'];

	// Initialise the local player
	localPlayer = new Player(
		startX,
		startY,
		colors[Math.floor(Math.random() * colors.length)]);

	// Initialise socket connection
	socket = io.connect(window.location.hostname);

	// Initialise remote players array
	remotePlayers = [];

	// Start listening for events
	setEventHandlers();
};

/**************************************************
** GAME EVENT HANDLERS
**************************************************/
var setEventHandlers = function() {
	// Keyboard
	window.addEventListener("keydown", onKeydown, false);
	window.addEventListener("keyup", onKeyup, false);

	// Socket connection successful
	socket.on("connect", onSocketConnected);

	// Socket disconnection
	socket.on("disconnect", onSocketDisconnect);

	// New player message received
	socket.on("new player", onNewPlayer);

	// Player move message received
	socket.on("move player", onMovePlayer);

	// Player removed message received
	socket.on("remove player", onRemovePlayer);

	// Reset game
	socket.on("reset game", onResetGame);

	// Change color
	socket.on("change color", onChangeColor);

	socket.on("init player", onInitPlayer);
};

function onResetGame() {
	// Reset and send new position
	var startX = Math.round(Math.random()*(canvas.width-5)),
			startY = Math.round(Math.random()*(canvas.height-5));

	localPlayer.setX(startX);
	localPlayer.setY(startY);

	//TODO move to the server
	localPlayer.setPoints(0);

	console.log('player changed position after reset');

	socket.emit("move player", {x: localPlayer.getX(), y: localPlayer.getY()});
};

// Keyboard key down
function onKeydown(e) {
	if (localPlayer) {
		keys.onKeyDown(e);
	};
};

// Keyboard key up
function onKeyup(e) {
	if (localPlayer) {
		keys.onKeyUp(e);
	};
};

function reset() {
	socket.emit("reset game");
};

// Socket connected
function onSocketConnected() {
	console.log("Connected to socket server");
	// Send local player data to the game server
	socket.emit("new player", {
		x: localPlayer.getX(),
		y: localPlayer.getY(),
		color: localPlayer.getColor()
	});
};

// Socket disconnected
function onSocketDisconnect() {
	console.log("Disconnected from socket server");
};

// New player
function onNewPlayer(data) {
	console.log("New player connected: "+data.id);
	console.log(data);

	// Initialise the new player
	var newPlayer = new Player(data.x, data.y, data.color);
	newPlayer.id = data.id;
	newPlayer.setNumber(data.number);
	newPlayer.setAdmin(data.admin);
	newPlayer.setPoints(data.points);

	// Add new player to the remote players array
	remotePlayers.push(newPlayer);
};

// Move player
function onMovePlayer(data) {
	var movePlayer = playerById(data.id);

	// Player not found
	if (!movePlayer) {
		console.log("Player not found: "+data.id);
		return;
	};

	// Update player position
	movePlayer.setX(data.x);
	movePlayer.setY(data.y);
};

function onInitPlayer(data) {
	localPlayer.setNumber(data.number);
	localPlayer.setAdmin(data.admin);
	localPlayer.setPoints(data.points);
}

function onChangeColor(data) {
	localPlayer.setColor(data.color);
}

// Remove player
function onRemovePlayer(data) {
	var removePlayer = playerById(data.id);

	// Player not found
	if (!removePlayer) {
		console.log("Player not found: "+data.id);
		return;
	};

	// Remove player from array
	remotePlayers.splice(remotePlayers.indexOf(removePlayer), 1);
};


/**************************************************
** GAME ANIMATION LOOP
**************************************************/
function animate() {
	update();
	draw();

	// Request a new animation frame using Paul Irish's shim
	window.requestAnimFrame(animate);
};


/**************************************************
** GAME UPDATE
**************************************************/
function update() {
	// Update local player and check for change
	if (localPlayer.update(keys, canvas)) {
		// Send local player data to the game server
		socket.emit("move player", {
			x: localPlayer.getX(),
			y: localPlayer.getY()
		});

		// Collision
		// if (
		// 	localPlayer.getX() <= (ai.getX() + 10)
		// 	&& ai.getX() <= (localPlayer.getX() + 10)
		// 	&& localPlayer.getY() <= (ai.getY() + 10)
		// 	&& ai.getY() <= (localPlayer.getY() + 10)
		// ) {
		// 	ai.reset(canvas);
		// }
	};
};


/**************************************************
** GAME DRAW
**************************************************/
function draw() {
	// Wipe the canvas clean
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	document.getElementById('hud').innerHTML = '';

	// Draw the local player
	localPlayer.draw(ctx, true);

	//ai.draw(ctx);

	// Draw the remote players
	var i;
	for (i = 0; i < remotePlayers.length; i++) {
		remotePlayers[i].draw(ctx, false);
	};

	if (localPlayer.getAdmin()) {
		document.getElementById('hud').innerHTML += '<br/><button onclick="reset()">Reset</button>';
	}
};


/**************************************************
** GAME HELPER FUNCTIONS
**************************************************/
// Find player by ID
function playerById(id) {
	var i;
	for (i = 0; i < remotePlayers.length; i++) {
		if (remotePlayers[i].id == id)
			return remotePlayers[i];
	};

	return false;
};