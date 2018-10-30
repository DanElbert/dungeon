
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

  isEmpty: function() {
    return this.width() === 0 || this.height() === 0;
  },

  // Returns the portion of this rectangle inside the given rec
  clipTo: function(otherRec) {
    var left = Math.max(this.left(), otherRec.left());
    var top = Math.max(this.top(), otherRec.top());
    var right = Math.min(this.right(), otherRec.right());
    var bottom = Math.min(this.bottom(), otherRec.bottom());

    return new Rectangle(
      new Vector2(left, top),
      right - left,
      bottom - top
    );
  },

  // Snaps the rectangle to a multiple of the given param.
  // mode can be one one of: "closest" (default), "enlarge", "shrink"
  snapTo: function(multiple, mode) {
    if (!mode || mode === "closest") {
      return new Rectangle(
        new Vector2(Geometry.roundToNearest(this.left(), multiple), Geometry.roundToNearest(this.top(), multiple)),
        Geometry.roundToNearest(this.width(), multiple),
        Geometry.roundToNearest(this.height(), multiple));
    } else if (mode === "enlarge") {
      const tl = new Vector2(this.left() - (this.left() % multiple), this.top() - (this.top() % multiple));
      const delta = this.topLeft().subtract(tl);
      let w = this.width() + delta.x;
      if (w % multiple !== 0) {
        w = w + (multiple - (w % multiple))
      }

      let h = this.height() + delta.y;
      if (h % multiple !== 0) {
        h = h + (multiple - (h % multiple))
      }
      return new Rectangle(tl, w, h);
    } else if (mode === "shrink") {
      throw "shrink not implemented";
    } else {
      throw "Invalid mode " + mode;
    }
  },

  // Returns a rectangle that covers this rec and otherRec
  add: function(otherRec) {
    var left = Math.min(this.left(), otherRec.left());
    var top = Math.min(this.top(), otherRec.top());
    var right = Math.max(this.right(), otherRec.right());
    var bottom = Math.max(this.bottom(), otherRec.bottom());

    return new Rectangle(
      new Vector2(left, top),
      right - left,
      bottom - top
    );
  },

  translate: function(x, y) {
    return new Rectangle(
      this.topLeft().translate(x, y),
      this.width(),
      this.height()
    )
  },

  scale: function(x, y) {
    return new Rectangle(
      this.topLeft().scale(x, y),
      this.width() * x,
      this.height() * y
    );
  },

  enlarge: function(v) {
    return new Rectangle(
      this.topLeft().translate(-v, -v),
      this.width() + (v * 2),
      this.height() + (v * 2)
    );
  },

  roundValues: function() {
    return new Rectangle(
      new Vector2(Math.floor(this.left()), Math.floor(this.top())),
      Math.ceil(this.width()),
      Math.ceil(this.height())
    );
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