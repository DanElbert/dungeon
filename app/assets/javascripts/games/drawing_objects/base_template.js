
// =======================
// BaseTemplate
// =======================
function BaseTemplate(uid, board, position, color) {
  BaseDrawing.call(this, uid, board, position, 1, 0, false);
  this.color = color;
}

BaseTemplate.prototype = _.extend(BaseTemplate.prototype, BaseDrawing.prototype, {
  containsPoint: function(point) {
    return false;
  },

  drawHighlight(drawing, offset) {
  },

  clone() {
    throw "Not Implemented";
  },

  toAction() {
    throw "Not Implemented";
  },

  translate: function(x, y) {
    this.invalidateHandler(() => {
      this.position = this.position.translate(x, y);
    });
    return this;
  },
});

// =======================
// BaseCellTemplate
// =======================
function BaseCellTemplate(uid, board, position, color) {
  BaseTemplate.call(this, uid, board, position, color);
  this.cells = null;
  this.border = null;
}

BaseCellTemplate.prototype = _.extend(BaseCellTemplate.prototype, BaseTemplate.prototype, {

  calculateCells: function(cellSize) {
  },

  drawExtras: function(drawing) {
  },

  drawHighlight: function(drawing, offset) {
    this.ensureCells();
    drawing.context.save();
    drawing.context.translate(offset.x, offset.y);
    drawing.drawLines("white", 6 / drawing.drawingSettings.zoom, this.border);
    drawing.drawLines("black", 1 / drawing.drawingSettings.zoom, this.border);
    drawing.context.restore();
  },

  containsPoint: function(point) {
    this.ensureCells();
    const pCell = Geometry.getCell(point, this.cellSize);
    for (let c of this.cells) {
      if (c[0] === pCell[0] && c[1] === pCell[1]) {
        return true;
      }
    }
    return false;
  },

  calculateBounds: function() {
    this.ensureCells();
    var l, t, r, b;
    for (var c of this.cells) {
      var cl, ct, cr, cb;
      cl = c[0] * this.board.drawingSettings.cellSize;
      ct = c[1] * this.board.drawingSettings.cellSize;
      cr = cl + this.board.drawingSettings.cellSize;
      cb = ct + this.board.drawingSettings.cellSize;

      if (l == null || cl < l) l = cl;
      if (t == null || ct < t) t = ct;
      if (r == null || cr > r) r = cr;
      if (b == null || cb < b) b = cb;
    }

    return new Rectangle(new Vector2(l, t), r - l, b - t);
  },

  ensureCells: function() {
    if (this.cells === null) {
      this.cells = this.calculateCells(this.board.drawingSettings.cellSize);
      this.border = Geometry.getBorder(this.cells, this.board.drawingSettings.cellSize);
    }
  },

  executeDraw: function(drawing, drawBounds, level) {
    this.ensureCells();

    drawing.drawTemplate(this.cells, this.border, this.color);
    this.drawExtras(drawing);
  }

});
