
function Rectangle(topLeft, width, height) {
  this._topLeft = topLeft;
  this._width = width;
  this._height = height;
}

Rectangle.prototype = _.extend(Rectangle.prototype, {
  overlaps: function(otherRec) {
    // If one rectangle is on left side of other
    if (this.left() > otherRec.right() || otherRec.left() > this.right())
      return false;

    // If one rectangle is above other
    if (this.top() > otherRec.bottom() || otherRec.top() > this.bottom())
      return false;

    return true;
  },

  toArray: function() {
    return [
      [this.topLeft().x, this.topLeft().y],
      [this.bottomRight().x, this.bottomRight().y]
    ];
  },

  size: function() {
    return new Vector2(
      this.width(),
      this.height()
    )
  },

  center: function() {
    return new Vector2(
      this.topLeft().x + this.width() / 2,
      this.topLeft().y + this.height() / 2
    )
  },

  topLeft: function() {
    return this._topLeft;
  },

  bottomRight: function() {
    return new Vector2(
      this.topLeft().x + this.width(),
      this.topLeft().y + this.height()
    )
  },

  topRight: function() {
    return new Vector2(
      this.topLeft().x + this.width(),
      this.topLeft().y
    )
  },

  bottomLeft: function() {
    return new Vector2(
      this.topLeft().x,
      this.topLeft().y + this.height()
    )
  },

  left: function() {
    return this.topLeft().x;
  },

  right: function() {
    return this.topLeft().x + this.width();
  },

  top: function() {
    return this.topLeft().y;
  },

  bottom: function() {
    return this.topLeft().y + this.height();
  },

  width: function() {
    return this._width;
  },

  height: function() {
    return this._height;
  }
});