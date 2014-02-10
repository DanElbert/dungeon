
function ViewPortLabels(board) {
  this.board = board;
  this.drawing = board.drawing;

}
_.extend(ViewPortLabels.prototype, {
  draw: function() {
    var pixelWidth = this.board.canvas.width;
    var pixelHeight = this.board.canvas.height;

    var tilePixelSize = this.drawing.cellSize * this.board.zoom;

    var originX = this.board.viewPortCoord[0];
    var originY = this.board.viewPortCoord[1];

    var mapTileOrigin = Geometry.getCell(this.board.viewPortCoord, this.drawing.cellSize);
    var mapTileOriginCenter = Geometry.getCellMidpoint(mapTileOrigin, this.drawing.cellSize);

    var firstHorizontalTile = mapTileOrigin[0] + ((originX > mapTileOriginCenter[0]) ? 2 : 1);
    var firstVerticalTile = mapTileOrigin[1] + ((originY > mapTileOriginCenter[1]) ? 2 : 1);

    var horizontalPixelOrigin = (((firstHorizontalTile * this.drawing.cellSize) - originX) * this.board.zoom) + (tilePixelSize / 2);
    var verticalPixelOrigin = (((firstVerticalTile * this.drawing.cellSize) - originY) * this.board.zoom) + (tilePixelSize / 2);

    this.board.context.save();
    this.board.context.setTransform(1, 0, 0, 1, 0, 0);

    var labeled = horizontalPixelOrigin;
    var cur = firstHorizontalTile;
    var step = tilePixelSize < 25 ? 2 : 1;

    while (labeled < pixelWidth) {
      this.drawing.drawLabel([labeled, 10], cur, "black", "black", "white", 10);
      labeled += (tilePixelSize * step);
      cur += step;
    }

    labeled = verticalPixelOrigin;
    cur = firstVerticalTile;

    while (labeled < pixelHeight) {
      this.drawing.drawLabel([14, labeled], cur, "black", "black", "white", 10);
      labeled += (tilePixelSize * step);
      cur += step;
    }

    this.board.context.restore();
  }
});