
function Vector2(x, y) {
  this.x = x;
  this.y = y;
}

Vector2.prototype = _.extend(Vector2.prototype, {
  translate: function(x, y) {
    return new Vector2(this.x + x, this.y + y);
  },

  rotate: function(angle, point) {

    var m = TransformMatrix.Identity;

    if (point) {
      m = m.translate(point.x, point.y);
      m = m.rotate(angle);
      m = m.translate(-point.x, -point.y);
    } else {
      m = m.rotate(angle);
    }

    return this.matrixMultiply(m);
  },

  matrixMultiply: function(m) {
    var out = m.pointMultiply([this.x, this.y, 1]);
    return new Vector2(out[0], out[1]);
  }
});