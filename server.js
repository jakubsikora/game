/**
 * Deklaracja zmiennych serwera
 */
var express = require("express"),
		path = require("path"),
		app = express(),
		server = require("http").createServer(app),
		// Biblioteka wykorzystana do logow serwera
		util = require("util"),
		// Socket IO
		io = require("socket.io").listen(server),
		// Klasa gracza
		Player = require("./Player").Player,
		// Klasa monety
		Gold = require("./Gold").Gold;

// Serwer bedzie dzialal na danym porcie
server.listen(process.env.PORT || 3000);

// Serwer bedzie czytal z folderu public
app.use(express.static(path.join(__dirname,'public')));

/**
 * Deklaracja zmiennych dla gry
 */
		// Tablica polaczonych graczy
var players = [],
		// Tablica dostepnych kolorow
		colors = ['red', 'green', 'blue', 'orange', 'black', 'pink'],
		// Tablica wykorzystaych kolorow
		usedColors = [],
		// Moneta
		gold = null,
		// Aktualny numer gracza
		playerNumber = 1,
		// Maksymalna liczba graczy na serwerze
		maxPlayers = 2,
		// Stan gry
		gameFinished = false,
		// Maksymalna liczba punktow
		maxPoints = 5,
		// Gracz ktory wygral
		winner = null;

/**
 * Inicjalizacja serwera
 */
function init() {
	// Konfiguracja Socket.IO
	io.configure(function() {
		// Uzywaj tylko WebSockets
		io.set("transports", ["websocket"]);

		// Poziom logowania serwera
		io.set("log level", 2);
	});

	// Ustaw wydarzenia
	setEventHandlers();
};

/**
 * Ustawienie wydarzen serwera
 */
var setEventHandlers = function() {
	// Handler dla wszystkich polaczen Socket.IO
	io.sockets.on("connection", onSocketConnection);
};

/**
 * Ustaw wydarzenia po polaczniu gracza
 */
function onSocketConnection(client) {
	// Sluchaj laczenia nowego gracza
	client.on("new player", onNewPlayer);

	// Sprawdz czy liczba graczy nie przekroczyla limit
	if (players.length < maxPlayers) {
		util.log("New gracz polaczony: " + client.id);

		// Sluchaj rozlaczen graczy
		client.on("disconnect", onClientDisconnect);

		// Sluchaj zmian pozycji gracza
		client.on("move player", onMovePlayer);

		// Sluchaj resetow gry
		client.on("reset game", onResetGame);

		// Sluchaj zmiany pozycji zlota
		client.on("spawn gold", onSpawnGold);
	}
};

/**
 * Reset serwera
 */
function onResetGame() {
	var player = playerById(this.id),
			existingPlayer;

	// Sprawdz czy gracz jest adminem
	if (player.getAdmin()) {
		for (var i = 0; i < players.length; i++) {
			existingPlayer = players[i];
			// Wyzeruj punkty graczy
			existingPlayer.setPoints(0);

			// Wyslij dane do klienta o punktach
			this.emit("update points", {
				id: existingPlayer.id,
				points: existingPlayer.getPoints()
			});

			// Wyslij dane do pozostalych klientow
			this.broadcast.emit("update points", {
				id: existingPlayer.id,
				points: existingPlayer.getPoints()
			});
		}

		// Wyslij informacje o resecie do klienta
		this.emit("reset game");

		// Wyslij informacje o resecie gry do pozostalych klientow
		this.broadcast.emit("reset game");

		// Resetuj stan gry oraz zwyciezcy
		gameFinished = false;
		winner = null;

		util.log("Gra zresetowana");
	}
};

/**
 * Rozlaczenie gracza
 */
function onClientDisconnect() {
	util.log("Gracz sie rozlaczyl: " + this.id);

	var removePlayer = playerById(this.id);

	// Gracz nieznaleziony
	if (!removePlayer) {
		util.log("Gracz nieznaleziony: "+this.id);
		return;
	};

	// Usun uzyty kolor
	usedColors.splice(usedColors.indexOf(removePlayer.getColor()), 1);

	// Usun gracza z globalnej tablicy graczy
	players.splice(players.indexOf(removePlayer), 1);

	// Wyslij informacje o rozlaczonym graczu do pozostalych klientow
	this.broadcast.emit("remove player", {id: this.id});

	if (players.length === 0) {
		gold = null;
	} else {
		// Jezeli rozlaczony gracz byl adminem, przypisz admina do nastepnego w kolejnosci
		if (removePlayer.getAdmin()) {
			players[0].setAdmin(true);

			// Wyslij informacje o nowym adminie do pozostalych klientow
			this.broadcast.emit("update admin", {id: players[0].id});
		}
	}
};

/**
 * Polaczenie nowego gracza
 */
function onNewPlayer(data) {
	// Sprawdz czy nie przekroczono limitu
	if (players.length === maxPlayers) {
		// Wyslij informacje do klienta o tym ze serwer jest pelny
		this.emit("server full");
	} else {
		// Sprawdz czy gra nie jest zakonczona
		if (gameFinished) {
			this.emit("game finished", {
				winner: winner
			});
		} else {
			// Stworz nowego gracza
			var newPlayer = new Player(data.x, data.y),
					// Przypisz kolor
					newColor = selectColor(),
					// Aktualnie polaczeni gracze
					existingPlayer;

			// Przypisz podstawowe dane gracza (id, numer, admina, punkty, kolor)
			newPlayer.id = this.id;
			newPlayer.setNumber(playerNumber);
			newPlayer.setAdmin(playerNumber === 1 ? true : false);
			newPlayer.setPoints(0);
			newPlayer.setColor(newColor);

			// Jezeli serwer jest jeszcze pusty gracz bedzie adminem
			if (players.length === 0) {
				newPlayer.setAdmin(true);
			}

			// Wyslij informacje do klienta
			this.emit("init player", {
				number: newPlayer.getNumber(),
				admin: newPlayer.getAdmin(),
				points: newPlayer.getPoints(),
				id: newPlayer.id,
				color: newPlayer.getColor()
			});

			// Wyslij informacje do klienta o monecie
			if (gold) {
				this.emit('spawn gold', {
					x: gold.getX(),
					y: gold.getY()
				});
			}

			// Wyslij informacje o nowym graczu do pozostalych klientow
			this.broadcast.emit("new player", {
				id: newPlayer.id,
				x: newPlayer.getX(),
				y: newPlayer.getY(),
				color: newPlayer.getColor(),
				number: newPlayer.getNumber(),
				admin: newPlayer.getAdmin(),
				points: newPlayer.getPoints()
			});

			// Wyslij informacje o pozostalych graczach do klienta
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

			// Dodaj gracza do globalnej tablicy
			players.push(newPlayer);

			// Zwieksz numer gracza
			playerNumber++;
		}
	}
};

/**
 * Wylosuj kolor
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
 * Zmiana pozycji gracza
 */
function onMovePlayer(data) {
	// Find player in array
	var movePlayer = playerById(this.id),
			newX,
			newY;

	// Gracz nieznaleziony
	if (!movePlayer) {
		util.log("Gracz nieznaleziony: "+this.id);
		return;
	};

	// Updatuje pozycje gracza
	movePlayer.setX(data.x);
	movePlayer.setY(data.y);

	// Sprawdz kolizje gracza z moneta
	if (data.collision) {
		// Zwieksz punkty
		movePlayer.increasePoints();

		// Wyslij informacje o zmianie punktow do klienta
		this.emit("update points", {
			id: movePlayer.id,
			points: movePlayer.getPoints()
		});

		// Wyslij informacje o zmianie punktow do pozostalych klientach
		this.broadcast.emit("update points", {
			id: movePlayer.id,
			points: movePlayer.getPoints()
		});

		// Sprawdz czy osiagnieto maksymalna liczbe puntkow
		if (movePlayer.getPoints() === maxPoints) {
			gameFinished = true;
			winner = movePlayer.getNumber();

			// Wyslij informacje o zwyciezcy do klienta
			this.emit("game finished", {
				winner: winner
			});

			// Wyslij informacje o zwyciezcy do pozostalych klientow
			this.broadcast.emit("game finished", {
				winner: winner
			});
		} else {
			// Ustaw nowa pozycje monety
			newX = Math.round(Math.random()*(data.width-5));
			newY = Math.round(Math.random()*(data.height-5));

			gold.setX(newX);
			gold.setY(newY);

			// Wyslij informacje o nowej monety do klienta
			this.emit('spawn gold', {
				x: gold.getX(),
				y: gold.getY()
			});

			// Wyslij informacje o nowej monety do pozostalych klientow
			this.broadcast.emit('spawn gold', {
				x: gold.getX(),
				y: gold.getY()
			});
		}
	}

	// Wyslij informacje o pozycji gracza do pozostalych klientow
	this.broadcast.emit("move player", {
		id: movePlayer.id,
		x: movePlayer.getX(),
		y: movePlayer.getY()
	});
};

/**
 * Spawnowanie zlota
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

		// Wyslij informacje o nowej monety do pozostalych klientow
		this.broadcast.emit('spawn gold', {
			x: gold.getX(),
			y: gold.getY()
		});
	}
};

/**
 * Pomocnicza funkcja do szukania graczy z danym id
 */
function playerById(id) {
	for (var i = 0; i < players.length; i++) {
		if (players[i].id == id)
			return players[i];
	};

	return false;
};

/**
 * Pomocnicza funkcja do roznicy tablic
 */
Array.prototype.diff = function(a) {
  return this.filter(function(i) {return a.indexOf(i) < 0;});
};

/**
 * Wywolaj inicjalizacje
 */
init();