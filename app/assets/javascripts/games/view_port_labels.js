
function ViewPortLabels(board) {
  this.board = board;
  this.drawing = board.drawing;
  this.context = board.context;

}
_.extend(ViewPortLabels.prototype, {
  draw: function() {
    var pixelWidth = this.board.canvas.width;
    var pixelHeight = this.board.canvas.height;

    var tilePixelSize = this.drawing.cellSize * this.board.getZoom();
    var labelStep = 1;

    var originX = this.board.getViewPortCoordinates()[0];
    var originY = this.board.getViewPortCoordinates()[1];

    var mapTileOrigin = Geometry.getCell(this.board.getViewPortCoordinates(), this.drawing.cellSize);
    var mapTileOriginCenter = Geometry.getCellMidpoint(mapTileOrigin, this.drawing.cellSize);

    var firstHorizontalTile = mapTileOrigin[0] + ((originX > mapTileOriginCenter[0]) ? 2 : 1);
    var firstVerticalTile = mapTileOrigin[1] + ((originY > mapTileOriginCenter[1]) ? 2 : 1);

    // If zoomed out, reduce the number of labels
    if (tilePixelSize < 25) {
      labelStep = 2;
      if (firstHorizontalTile % 2 != 0) {
        firstHorizontalTile += 1;
      }

      if (firstVerticalTile % 2 != 0) {
        firstVerticalTile += 1;
      }
    }

    var horizontalPixelOrigin = (((firstHorizontalTile * this.drawing.cellSize) - originX) * this.board.getZoom()) + (tilePixelSize / 2);
    var verticalPixelOrigin = (((firstVerticalTile * this.drawing.cellSize) - originY) * this.board.getZoom()) + (tilePixelSize / 2);

    var cursor = this.board.hovered_cell;

    this.context.save();
    this.context.setTransform(1, 0, 0, 1, 0, 0);
    this.context.translate(0.5, 0.5);

    this.context.beginPath();
    this.context.fillStyle = "rgba(100, 100, 100, 0.5)";
    this.context.rect(0, 0, pixelWidth, 30);
    this.context.fill();

    this.context.beginPath();
    this.context.rect(0, 30, 30, pixelHeight);
    this.context.fill();

    var labeled = horizontalPixelOrigin;
    var cur = firstHorizontalTile;

    while (labeled < pixelWidth) {
      this.drawLabel([labeled, 15], this.numberToLetters(cur), (cursor && cur == cursor[0]));
      labeled += (tilePixelSize * labelStep);
      cur += labelStep;
    }

    labeled = verticalPixelOrigin;
    cur = firstVerticalTile;

    while (labeled < pixelHeight) {
      this.drawLabel([14, labeled], cur, (cursor && cur == cursor[1]));
      labeled += (tilePixelSize * labelStep);
      cur += labelStep;
    }

    this.board.context.restore();
  },

  drawLabel: function(point, text, highlight) {
    this.drawing.drawText(text, point, 20, (highlight ? "grey" : "white"), "black", 1);
  },

  numberToLetters: function(value) {
    var result = "";
    var negative = value < 0;
    value = Math.floor(Math.abs(value));

    do {
      var rem = (value) % 26;
      value = Math.floor((value) / 26);
      result = String.fromCharCode(65 + rem) + result;
    } while (value > 0);

    if (negative) {
      result = "-" + result;
    }

    return result;
  }
});