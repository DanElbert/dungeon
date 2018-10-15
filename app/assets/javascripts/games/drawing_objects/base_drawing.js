function BaseDrawing(uid) {
  this.uid = uid;
  this._bounds = null;
  this.owner = null;
  this.dirty = true;
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
    return new Rectangle(new Vector2(0,0), new Vector2(0,0));
  },

  draw: function(drawing, drawBounds) {
    this.executeDraw(drawing, drawBounds);
    this.dirty = false;
  },

  executeDraw(drawing, drawBounds) {
  },

  destroy: function() {

  }
});