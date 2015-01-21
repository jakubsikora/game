/**************************************************
** GAME AI CLASS
**************************************************/
var AI = function(startX, startY) {
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

  // Draw player
  var draw = function(ctx) {
    ctx.fillStyle = "green";
    ctx.fillRect(x-5, y-5, 10, 10);
  };

  var reset = function(canvas) {
    var newX = Math.round(Math.random()*(canvas.width-5))
      , newY = Math.round(Math.random()*(canvas.height-5))
    this.setX(newX);
    this.setY(newY);
  };

  // Define which variables and methods can be accessed
  return {
    getX: getX,
    getY: getY,
    setX: setX,
    setY: setY,
    draw: draw,
    reset: reset
  }
};