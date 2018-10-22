function BaseDrawing(uid, board, position, scale, angle) {
  if (!uid) throw "Invalid UID";
  if (!board) throw "board cannot be null";
  this.uid = uid;
  this.board = board;
  this.position = position;
  this.scale = scale;
  this.angle = angle;

  this._dirty = false;
  this._bounds = null;
  this.drawingLayer = null;
}

BaseDrawing.prototype = _.extend(BaseDrawing.prototype, {
  bounds: function() {
    if (this._bounds === null) {
      this._bounds = this.calculateBounds();
    }
    return this._bounds;
  },

  calculateBounds: function() {
    return new Rectangle(new Vector2(0, 0), 0, 0);
  },

  clearBounds: function() {
    this._bounds = null;
  },

  setPosition: function(newPosition) {
    this.position = newPosition;
    this.invalidate();
  },

  setScale: function(newScale) {
    this.scale = newScale;
    this.invalidate();
  },

  setAngle: function(newAngle) {
    this.angle = newAngle;
    this.invalidate();
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

  setDrawingLayer: function(dl) {
    this.drawingLayer = dl;
  },

  invalidate: function() {
    this._dirty = true;
    this.clearBounds();
    this.board.invalidate();
    // var self = this;
    // setTimeout(function() {
    //   self.clearBounds();
    //   if (self.drawingLayer) {
    //     self.drawingLayer.actionChanged(self.uid);
    //   }
    //   self.board.invalidate();
    // });
  },

  draw: function(drawing, drawBounds, level) {
    this.executeDraw(drawing, drawBounds, level);
  },

  executeDraw: function(drawing, drawBounds) {
  },

  update: function() {
    var wasDirty = this._dirty;
    this._dirty = false;
    return wasDirty;
  },


});