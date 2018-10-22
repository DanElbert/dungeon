
function Vector2(x, y) {
  if (Array.isArray(x)) {
    this.x = x[0];
    this.y = x[1];
  } else {
    this.x = x;
    this.y = y;
  }
}

Vector2.prototype = _.extend(Vector2.prototype, {
  toArray: function() {
    return [this.x, this.y]
  },

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

  scale: function(x, y) {
    var m = TransformMatrix.Identity.scale(x, y);

    return this.matrixMultiply(m);
  },

  matrixMultiply: function(m) {
    var out = m.pointMultiply([this.x, this.y, 1]);
    return new Vector2(out[0], out[1]);
  }
});