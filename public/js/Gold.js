/**************************************************
** GAME GOLD CLASS
**************************************************/
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

  var draw = function(ctx) {
    ctx.fillStyle = color;
    ctx.fillRect(x-5, y-5, 10, 10);
  };

  // Define which variables and methods can be accessed
  return {
    getX: getX,
    getY: getY,
    setX: setX,
    setY: setY,
    draw: draw
  }
};