
function Rectangle(topLeft, bottomRight) {
  this.topLeft = topLeft;
  this.bottomRight = bottomRight;
}

Rectangle.prototype = _.extend(Rectangle.prototype, {
  toArray: function() {
    return [
      [this.topLeft.x, this.topLeft.y],
      [this.bottomRight.x, this.bottomRight.y]
    ];
  },

  size: function() {
    return new Vector2(
      this.bottomRight.x - this.topLeft.x,
      this.bottomRight.y - this.topLeft.y
    )
  },

  left: function() {
    return this.topLeft.x;
  },

  right: function() {
    return this.bottomRight.x;
  },

  top: function() {
    return this.topLeft.y;
  },

  bottom: function() {
    return this.bottomRight.y;
  },

  width: function() {
    return this.right() - this.left();
  },

  height: function() {
    return this.bottom() - this.top();
  }
});