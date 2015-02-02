/**
 * Polaczenie do serwera
 */
function onSocketConnected() {
  // Wyslij informacje do serwera
  socket.emit("new player", {
    x: localPlayer.getX(),
    y: localPlayer.getY(),
    color: localPlayer.getColor()
  });
};

/**
 * Polaczenie zdalnego gracza
 */
function onNewPlayer(data) {
  var newPlayer = new Player(data.x, data.y);
  newPlayer.id = data.id;
  newPlayer.setNumber(data.number);
  newPlayer.setAdmin(data.admin);
  newPlayer.setPoints(data.points);
  newPlayer.setColor(data.color);

  // Dodaj nowego gracza do listy zdalnych graczy
  remotePlayers.push(newPlayer);
};

/**
 * Zmiana pozycji gracza
 */
function onMovePlayer(data) {
  var movePlayer = playerById(data.id);

  // Gracz nieznaleziony
  if (!movePlayer) {
    console.log("Gracz nieznaleziony: " + data.id);
    return;
  };

  movePlayer.setX(data.x);
  movePlayer.setY(data.y);
};

/**
 * Spawn monety
 */
function onSpawnGold(data) {
  if (gold) {
    gold.setX(data.x);
    gold.setY(data.y);
  } else {
    gold = new Gold(data.x, data.y);
  }
}

/**
 * Inicjalizacja lokalnego gracza
 */
function onInitPlayer(data) {
  localPlayer.setNumber(data.number);
  localPlayer.setAdmin(data.admin);
  localPlayer.setPoints(data.points);
  localPlayer.id = data.id;
  localPlayer.setColor(data.color);

  if (localPlayer.getAdmin()) {
    spawnGold();
  }
}

/**
 * Zmiana punktow
 */
function onUpdatePoints(data) {
  var playerPoints = playerById(data.id);
  playerPoints.setPoints(data.points);
}

/**
 * Zmiana admina
 */
function onUpdateAdmin(data) {
  var newAdmin = playerById(data.id);

  // Gracz nieznaleziony
  if (!newAdmin) {
    console.log("Gracz nieznaleziony: "+data.id);
    return;
  };

  newAdmin.setAdmin(true);
}

/**
 * Rozlaczenie zdalnego gracza
 */
 function onRemovePlayer(data) {
  var removePlayer = playerById(data.id);

  // Gracz nieznaleziony
  if (!removePlayer) {
    console.log("Gracz nieznaleziony: "+data.id);
    return;
  };

  // Uzyj gracza z listy zdalnych graczy
  remotePlayers.splice(remotePlayers.indexOf(removePlayer), 1);
};

/**
 * Wcisniecie klawisza
 */
function onKeydown(e) {
  if (localPlayer) {
    keys.onKeyDown(e);
  };
};

/**
 * Wycisniecie klawisza
 */
function onKeyup(e) {
  if (localPlayer) {
    keys.onKeyUp(e);
  };
};

/**
 * Reset gry
 */
function onResetGame() {
  gameFinished = false;
  winner = null;

  var startX = Math.round(Math.random()*(canvas.width-5)),
      startY = Math.round(Math.random()*(canvas.height-5));

  localPlayer.setX(startX);
  localPlayer.setY(startY);
  localPlayer.setPoints(0);

  socket.emit("move player", {x: localPlayer.getX(), y: localPlayer.getY()});
};

/**
 * Pelny serwer
 */
function onServerFull() {
  serverFull = true;
}

/**
 * Gra zakonczona
 */
function onGameFinished(data) {
  gameFinished = true;
  winner = data.winner;
}