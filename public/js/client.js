/**
 *
 */
var canvas,			// Canvas DOM element
		ctx,			// Canvas rendering context
		keys,			// Keyboard input
		serverFull = false,
		localPlayer,	// Local player
		remotePlayers,	// Remote players
		socket,			// Socket connection
		gold,
		CANVAS_WIDTH = 800,
		CANVAS_HEIGHT = 500,
		gameFinished = false,
		winner;

/**
 *
 */
function init() {
	// Declare the canvas and rendering context
	canvas = document.getElementById("gameCanvas");
	ctx = canvas.getContext("2d");

	// Maximise the canvas
	canvas.width = CANVAS_WIDTH;
	canvas.height = CANVAS_HEIGHT;

	// Initialise keyboard controls
	keys = new Keys();

	// Calculate a random start position for the local player
	// The minus 5 (half a player size) stops the player being
	// placed right on the egde of the screen
	var startX = Math.round(Math.random()*(canvas.width-5)),
			startY = Math.round(Math.random()*(canvas.height-5));

	// Initialise the local player
	localPlayer = new Player(startX, startY);

	// Initialise socket connection
	socket = io.connect(window.location.hostname);

	// Initialise remote players array
	remotePlayers = [];

	// Start listening for events
	setEventHandlers();
};

/**
 *
 */
function setEventHandlers() {
	// Keyboard
	window.addEventListener("keydown", onKeydown, false);
	window.addEventListener("keyup", onKeyup, false);

	// Socket connection successful
	socket.on("connect", onSocketConnected);

	// Socket disconnection
	socket.on("disconnect", onSocketDisconnect);

	socket.on("server full", onServerFull);

	// New player message received
	socket.on("new player", onNewPlayer);

	// Player move message received
	socket.on("move player", onMovePlayer);

	// Player removed message received
	socket.on("remove player", onRemovePlayer);

	// Reset game
	socket.on("reset game", onResetGame);

	// Initialization of the local player
	socket.on("init player", onInitPlayer);

	// Spawning new gold
	socket.on("spawn gold", onSpawnGold);

	// Update admin status
	socket.on("update admin", onUpdateAdmin);

	// Update points
	socket.on("update points", onUpdatePoints);

	socket.on("game finished", onGameFinished);
};

/**
 *
 */
function animate() {
	if (serverFull) {
		document.getElementById('hud').innerHTML = 'Serwer jest pełny.';
		ctx.clearRect(0, 0, canvas.width, canvas.height);

	} else if(gameFinished) {
		document.getElementById('hud').innerHTML = '';
		document.getElementById('hud').innerHTML += 'Gra zakończona. Zwyciężył: Gracz ' + winner;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		localPlayer.draw(ctx, true, gameFinished);

	} else {
		update();
		draw();
	}

	// Request a new animation frame using Paul Irish's shim
	window.requestAnimFrame(animate);
};

/**
 *
 */
function update() {
	var collision = false;

	// Update local player and check for change
	if (localPlayer.update(keys, canvas)) {

		// Check collision
		if (gold) {
			if (
				localPlayer.getX() <= (gold.getX() + 10)
				&& gold.getX() <= (localPlayer.getX() + 10)
				&& localPlayer.getY() <= (gold.getY() + 10)
				&& gold.getY() <= (localPlayer.getY() + 10)
			) {
				collision = true;
				gold = null;
			}
		}

		// Send local player data to the game server
		socket.emit("move player", {
			x: localPlayer.getX(),
			y: localPlayer.getY(),
			width: canvas.clientWidth,
			height: canvas.clientHeight,
			collision: collision
		});
	}
};

/**
 *
 */
function draw() {
	// Wipe the canvas clean
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	document.getElementById('hud').innerHTML = '';

	// Draw the local player
	localPlayer.draw(ctx, true);

	// Draw the remote players
	var i;
	for (i = 0; i < remotePlayers.length; i++) {
		remotePlayers[i].draw(ctx, false);
	};

	if (localPlayer.getAdmin()) {
		document.getElementById('reset').style.display = 'block';
	} else {
		document.getElementById('reset').style.display = 'none';
	}

	if (gold) {
		gold.draw(ctx);
	}
};

/**
 *
 */
function spawnGold() {
	var startX = Math.round(Math.random()*(canvas.width-5)),
			startY = Math.round(Math.random()*(canvas.height-5));

	gold = new Gold(startX, startY);

	socket.emit("spawn gold", {x: gold.getX(), y: gold.getY()});
}

/**
 *
 */
function reset() {
	spawnGold();
	socket.emit("reset game");
};
