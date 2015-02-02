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

  var draw = function(ctx) {
    var radius = 10;

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2*Math.PI);
    ctx.fillStyle = 'gold';
    ctx.fill();
    ctx.lineWidth = radius / 5;
    ctx.strokeStyle = '#d1a700';
    ctx.stroke();

    ctx.font = '9pt Arial';
    ctx.fillStyle = '#ad7900';
    ctx.textAlign = 'center';
    ctx.fillText('£', x, y+3);
  };

  return {
    getX: getX,
    getY: getY,
    setX: setX,
    setY: setY,
    draw: draw
  }
};