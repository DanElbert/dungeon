function TokenDrawing(uid, board, position, tokenCellSize, color, fontColor, fontSize, text) {
  BaseDrawing.call(this, uid, board, position, 1, 0, false);
  this.selectable = true;
  this.canInvalidateByBounds = false;
  this.color = color;
  this.tokenCellSize = tokenCellSize;
  this.fontColor = fontColor;
  this.fontSize = fontSize;
  this.text = text;
}

TokenDrawing.prototype = _.extend(TokenDrawing.prototype, BaseDrawing.prototype, {
  containsPoint: function(point) {
    return this.bounds().containsPoint(new Vector2(point));
  },

  drawHighlight(drawing, offset) {
    const radius = (this.tokenCellSize * this.cellSize) / 2;
    const center = this.position.translate(radius, radius).add(offset);
    drawing.drawCircle(center.x, center.y, radius, 6 / drawing.drawingSettings.zoom, "white", null);
    drawing.drawCircle(center.x, center.y, radius, 1 / drawing.drawingSettings.zoom, "black", null);
  },

  clone(uid) {
    return new TokenDrawing(uid, this.board, this.position, this.tokenCellSize, this.color, this.fontColor, this.fontSize, this.text);
  },

  toAction(newUid) {
    return {
      version: 1,
      actionType: "addTokenAction",
      uid: newUid || this.uid,
      position: this.position.toArray(),
      tokenCellSize: this.tokenCellSize,
      color: this.color,
      fontColor: this.fontColor,
      fontSize: this.fontSize,
      text: this.text
    };
  },

  translate: function(x, y) {
    this.invalidateHandler(() => {
      this.position = this.position.translate(x, y);
    });
    return this;
  },

  updateProperties: function(props) {
    this.invalidateHandler(() => {
      for (let key in props) {
        this[key] = props[key];
      }
    });
    return this;
  },

  calculateBounds: function() {
    const diameter = (this.tokenCellSize * this.cellSize);
    const offset = this.cellSize / 2;
    return new Rectangle(this.position, diameter, diameter);
  },

  executeDraw: function(drawing, drawBounds, level) {
    const cellPosition = Geometry.getCell(this.position.toArray(), this.cellSize);
    drawing.drawToken(cellPosition[0], cellPosition[1], this.tokenCellSize, this.tokenCellSize, this.color, this.text, this.fontColor, this.fontSize);
  }
});