/**
 *
 */
function onSocketConnected() {
  console.log("Connected to socket server");
  // Send local player data to the game server
  socket.emit("new player", {
    x: localPlayer.getX(),
    y: localPlayer.getY(),
    color: localPlayer.getColor()
  });
};

/**
 *
 */
function onSocketDisconnect() {
  console.log("Disconnected from socket server");
};

/**
 *
 */
function onNewPlayer(data) {
  console.log("New player connected: "+data.id);

  // Initialise the new player
  var newPlayer = new Player(data.x, data.y);
  newPlayer.id = data.id;
  newPlayer.setNumber(data.number);
  newPlayer.setAdmin(data.admin);
  newPlayer.setPoints(data.points);
  newPlayer.setColor(data.color);

  // Add new player to the remote players array
  remotePlayers.push(newPlayer);
};

/**
 *
 */
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

/**
 *
 */
function onSpawnGold(data) {
  console.log('onSpawnGold', data.x, data.y, gold);
  if (gold) {
    gold.setX(data.x);
    gold.setY(data.y);
  } else {
    gold = new Gold(data.x, data.y);
  }
}

/**
 *
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
 *
 */
function onUpdatePoints(data) {
  var playerPoints = playerById(data.id);
  playerPoints.setPoints(data.points);
}

/**
 *
 */
function onUpdateAdmin(data) {
  var newAdmin = playerById(data.id);

  console.log('onUpdateAdmin', newAdmin);

  // Player not found
  if (!newAdmin) {
    console.log("Player not found: "+data.id);
    return;
  };

  newAdmin.setAdmin(true);
}

/**
 *
 */
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

/**
 *
 */
function onKeydown(e) {
  if (localPlayer) {
    keys.onKeyDown(e);
  };
};

/**
 *
 */
function onKeyup(e) {
  if (localPlayer) {
    keys.onKeyUp(e);
  };
};

/**
 *
 */
function onResetGame() {
  // Reset and send new position
  var startX = Math.round(Math.random()*(canvas.width-5)),
      startY = Math.round(Math.random()*(canvas.height-5));

  localPlayer.setX(startX);
  localPlayer.setY(startY);
  localPlayer.setPoints(0);

  socket.emit("move player", {x: localPlayer.getX(), y: localPlayer.getY()});
};