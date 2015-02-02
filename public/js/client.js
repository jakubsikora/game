/**
 * Deklaracja zmiennych klienta
 */
 		// Canvas
var canvas,
		// Context
		ctx,
		// Obiekt dla klawiatury
		keys,
		serverFull = false,
		// Zmienna dla lokalnego gracza
		localPlayer,
		// Zmienna dla zdalnych graczy
		remotePlayers,
		socket,
		gold,
		// Szerokosc planszy
		CANVAS_WIDTH = 800,
		// Wysokosc planszy
		CANVAS_HEIGHT = 500,
		gameFinished = false,
		winner;

/**
 * Inicjalizacja klienta
 */
function init() {
	// Deklaracja planszy gry
	canvas = document.getElementById("gameCanvas");
	ctx = canvas.getContext("2d");

	// Ustaw szerokosc i wysokosc planszy
	canvas.width = CANVAS_WIDTH;
	canvas.height = CANVAS_HEIGHT;

	// Inicjalizacja klawiszy
	keys = new Keys();

	// Losowa pozycja gracza
	var startX = Math.round(Math.random()*(canvas.width-5)),
			startY = Math.round(Math.random()*(canvas.height-5));

	// Inicjalizacja lokaknego gracza
	localPlayer = new Player(startX, startY);

	// Ustalanie polaczenia klienta z serwerem
	// Uzywamy aktualnego adresu gracza gdyz klient i serwer sa na tym samym serwerze
	socket = io.connect(window.location.hostname);

	// Ustaw globalna tablice zdalnych graczy
	remotePlayers = [];

	// Ustaw wydarzenia
	setEventHandlers();
};

/**
 * Ustaw wydarzenia klienta
 */
function setEventHandlers() {
	// Klawiatura
	window.addEventListener("keydown", onKeydown, false);
	window.addEventListener("keyup", onKeyup, false);

	// Polaczenie do socket.io
	socket.on("connect", onSocketConnected);

	// Serwer pelny
	socket.on("server full", onServerFull);

	// Nowy gracz
	socket.on("new player", onNewPlayer);

	// Nowa pozycja gracza
	socket.on("move player", onMovePlayer);

	// Gracz usuniety
	socket.on("remove player", onRemovePlayer);

	// Reset gry
	socket.on("reset game", onResetGame);

	// Inicjalizacja gracza
	socket.on("init player", onInitPlayer);

	// Spawn monety
	socket.on("spawn gold", onSpawnGold);

	// Zmiana admina
	socket.on("update admin", onUpdateAdmin);

	// Zmiana punktow
	socket.on("update points", onUpdatePoints);

	// Gra zakonczona
	socket.on("game finished", onGameFinished);
};

/**
 * Funkcja ktora powoduje animacje na planszy
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
		// Zmiany na planszy
		update();

		// Rysuj zmiany na planszy
		draw();
	}

	// Nowa klatka animacji
	window.requestAnimFrame(animate);
};

/**
 * Zmiany na planszy
 */
function update() {
	var collision = false;

	// Zmiany lokalnego klienta
	if (localPlayer.update(keys, canvas)) {

		// Sprawdz czy gracz koliduje z moneta
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

		// Wyslij dane do serwera z nowa pozycja gracza
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
 * Rysowanie na planszy
 */
function draw() {
	// Wyczysc plansze
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// Wyczysc HUD-a
	document.getElementById('hud').innerHTML = '';

	// Rysuj lokalnego gracza na planszy
	localPlayer.draw(ctx, true);

	// Rysuj zdalnych graczy na planszy
	var i;
	for (i = 0; i < remotePlayers.length; i++) {
		remotePlayers[i].draw(ctx, false);
	};

	if (localPlayer.getAdmin()) {
		document.getElementById('reset').style.display = 'block';
	} else {
		document.getElementById('reset').style.display = 'none';
	}

	// Rysuj monety na planszy
	if (gold) {
		gold.draw(ctx);
	}
};

/**
 * Ustaw nowa pozycji monety
 */
function spawnGold() {
	var startX = Math.round(Math.random()*(canvas.width-5)),
			startY = Math.round(Math.random()*(canvas.height-5));

	gold = new Gold(startX, startY);

	// Wyslij informacje o monecie do serwera
	socket.emit("spawn gold", {x: gold.getX(), y: gold.getY()});
}

/**
 * Resetowanie gry
 */
function reset() {
	spawnGold();
	socket.emit("reset game");
};
