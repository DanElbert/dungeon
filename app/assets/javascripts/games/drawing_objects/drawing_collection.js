function DrawingCollection(uid, board, position, scale, angle) {
  BaseDrawing.call(this, uid, board, position, scale, angle);

  this.children = [];
}

DrawingCollection.prototype = _.extend(DrawingCollection.prototype, BaseDrawing.prototype, {

  beforeDrawChildren: function(drawing, drawBounds, level) {

  },

  afterDrawChildren: function(drawing, drawBounds, level) {

  },

  drawChildren: function(drawing, drawBounds, level) {
    for (let c of this.children) {
      c.draw(drawing, drawBounds, level);
    }
  },

  draw: function(drawing, drawBounds, level) {
    this.beforeDrawChildren(drawing, drawBounds, level);

    this.drawChildren(drawing, drawBounds, level);

    this.afterDrawChildren(drawing, drawBounds, level);
  }

});