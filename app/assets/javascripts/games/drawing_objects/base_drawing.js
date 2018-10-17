function BaseDrawing(uid) {
  this.uid = uid;
  this._bounds = null;
  this.parentTiles = [];
}

BaseDrawing.prototype = _.extend(BaseDrawing.prototype, {
  boundsRect: function() {
    if (this._bounds === null) {
      this._bounds = this.calculateBounds();
    }
    return this._bounds;
  },

  bounds: function() {
    return this.boundsRect().toArray();
  },

  calculateBounds: function() {
    return new Rectangle(new Vector2(0,0), 0, 0);
  },

  clearBounds: function() {
    this._bounds = null;
  },

  // Given a rectangle and an angle, returns a non-rotated containing rectangle
  getRotatedRecBounds: function(rec, angle) {
    var points = [rec.topLeft(), rec.topRight(), rec.bottomLeft(), rec.bottomRight()];

    points = _.map(points, function(p) {
      return p.rotate(angle, rec.center());
    }, this);

    var xVals = _.map(points, function(p) { return p.x });
    var yVals = _.map(points, function(p) { return p.y });

    var left = _.min(xVals);
    var right = _.max(xVals);
    var top = _.min(yVals);
    var bottom = _.max(yVals);

    return new Rectangle(
      new Vector2(left, top),
      right - left,
      bottom - top
    );
  },

  invalidate: function() {
    this.board.invalidate();
    this.clearBounds();
    for (let t of this.parentTiles) {
      t.reDraw();
    }
  },

  draw: function(drawing, drawBounds) {
    this.executeDraw(drawing, drawBounds);
  },

  executeDraw(drawing, drawBounds) {
  },

  update: function() {
  },

  destroy: function() {
  }
});