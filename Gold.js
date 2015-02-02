/**
 * Obiekt monety
 */
var Gold = function(startX, startY) {
  var x = startX,
      y = startY;

  // Getters and setters
  var getX = function() {
    return x;
  };

  var getY = function() {
    return y;
  };

  var setX = function(newX) {
    x = newX;
  };

  var setY = function(newY) {
    y = newY;
  };

  // Definicja funkcji ktore beda dostepne publicznie
  return {
    getX: getX,
    getY: getY,
    setX: setX,
    setY: setY
  };
};

// Eksportuj obiekt by byl dostepny z poziomu serwera
exports.Gold = Gold;