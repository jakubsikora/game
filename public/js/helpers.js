/**
 *
 */
function playerById(id) {
  for (var i = 0; i < remotePlayers.length; i++) {
    if (remotePlayers[i].id === id)
      return remotePlayers[i];
  };

  if (localPlayer.id === id) {
    return localPlayer;
  }

  return false;
};