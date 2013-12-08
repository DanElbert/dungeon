function Drawing(context) {
  this.context = context;
  this.cellSize = 50;

}
_.extend(Drawing.prototype, {

  clear: function (columns, rows) {
    this.context.clearRect(0, 0, columns * this.cellSize, rows * this.cellSize);
  },

  drawMovementLine: function(start, end) {
    var startPoint = Geometry.getCellMidpoint(start, this.cellSize);
    var endPoint = Geometry.getCellMidpoint(end, this.cellSize);

    var totalMovement = Geometry.getCellDistance(start, end) * 5;

    this.drawMeasureLine(startPoint, endPoint, totalMovement);
  },

  drawMeasureLine: function(start, end, label, color, width) {
    this.context.lineWidth = width || 5;
    this.context.strokeStyle = color || "#000000";
    this.context.lineCap = 'round';

    this.context.beginPath();
    this.context.moveTo(start[0], start[1]);
    this.context.lineTo(end[0], end[1]);

    this.context.stroke();

    var midPoint = [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2];

    this.drawLabel(midPoint, label, "black", "black", "white");
  },

  // Draws some text in a rounded box and returns the bounding box
  drawLabel: function(midPoint, text, textColor, outlineColor, fillColor) {
    this.context.save();

    this.context.fillStyle = fillColor || "white";
    this.context.strokeStyle = outlineColor || "black";
    this.context.lineWidth = 2;
    this.context.lineCap = 'round';
    this.context.font = 'bold 25px sans-serif';
    this.context.textBaseline = 'middle';
    this.context.textAlign = 'center';

    var fontSize = this.context.measureText(text);
    var fontWidth = Math.max(fontSize.width, 20);
    var fontHeight = 28;

    var xOffset = (fontWidth / 2) + (fontHeight / 2);
    var yOffset = fontHeight / 2;
    var bounds = [[midPoint[0] - xOffset, midPoint[1] - yOffset], [midPoint[0] + xOffset, midPoint[1] + yOffset]];

    // draw ovalish box
    this.context.beginPath();
    this.context.moveTo(midPoint[0] - (fontWidth / 2), midPoint[1] - (fontHeight / 2));
    this.context.lineTo(midPoint[0] + (fontWidth / 2), midPoint[1] - (fontHeight / 2));
    this.context.arc(midPoint[0] + (fontWidth / 2), midPoint[1], fontHeight / 2, 1.5 * Math.PI, Math.PI / 2, false);
    this.context.lineTo(midPoint[0] - (fontWidth / 2), midPoint[1] + (fontHeight / 2));
    this.context.arc(midPoint[0] - (fontWidth / 2), midPoint[1], fontHeight / 2, Math.PI / 2, 1.5 * Math.PI, false);
    this.context.closePath();

    this.context.stroke();
    this.context.fill();

    this.context.fillStyle = textColor || "black";
    this.context.fillText(text, midPoint[0], midPoint[1] + 2);

    this.context.restore();

    return bounds;
  },

  drawTemplate: function(cells, border, color) {
    this.context.globalAlpha = 0.3;

    _.each(cells, function(c) {
      this.colorCell(c[0], c[1], color);
    }, this);

    this.context.globalAlpha = 1;

    this.drawLines("black", 3, border);
  },

  drawLines: function (color, width, lines) {
    this.context.beginPath();
    this.context.lineWidth = width;
    this.context.strokeStyle = color;
    this.context.lineCap = 'round';

    for (var x = 0; x < lines.length; x++) {
      var start = lines[x].start;
      var end = lines[x].end;
      this.context.moveTo(start[0], start[1]);
      this.context.lineTo(end[0], end[1]);
    }

    this.context.stroke();
  },

  drawSquare: function(topLeft, bottomRight, color, width) {
    this.context.lineWidth = width;
    this.context.strokeStyle = color;
    this.context.lineCap = 'round';

    this.context.beginPath();
    this.context.moveTo(topLeft[0], topLeft[1]);
    this.context.lineTo(bottomRight[0], topLeft[1]);
    this.context.lineTo(bottomRight[0], bottomRight[1]);
    this.context.lineTo(topLeft[0], bottomRight[1]);
    this.context.lineTo(topLeft[0], topLeft[1]);

    this.context.stroke();
  },

  eraseLines: function(width, lines) {

    var originalCompositeOperation = this.context.globalCompositeOperation;
    this.context.globalCompositeOperation = 'destination-out';

    this.context.beginPath();
    this.context.lineWidth = width;
    this.context.strokeStyle = 'rgba(0, 0, 0, 1.0)';
    this.context.lineCap = 'round';

    for (var x = 0; x < lines.length; x++) {
      var start = lines[x].start;
      var end = lines[x].end;
      var distance = Geometry.getDistance(start, end);

      // for 0 length lines, draw a 1 pixel line (since the intention is probably a dot)
      if (distance == 0) {
        start = [start[0] + 1, start[1] + 1];
      }
      this.context.moveTo(start[0], start[1]);
      this.context.lineTo(end[0], end[1]);
    }

    this.context.stroke();

    this.context.globalCompositeOperation = originalCompositeOperation;
  },

  drawCircle: function(x, y, radius, width, color, fill) {
    this.context.lineWidth = width;
    this.context.strokeStyle = color;
    this.context.beginPath();
    // For some reason, some browsers draw filled squares when the angle is 2.0 * PI; this fixes it without visual issues
    this.context.arc(x, y, radius, 0, 1.95 * Math.PI, false);
    this.context.closePath();
    this.context.stroke();
    if (fill) {
      this.context.fillStyle = color;
      this.context.fill();
    }
  },

  drawCircleTiles: function(col, row, width, height, color) {
    var width_delta = Math.floor(width / 2);
    var height_delta = Math.floor(height / 2);
    var center = Geometry.getCellMidpoint([col, row], this.cellSize);

    this.context.fillStyle = color;
    this.drawEllipse(col * this.cellSize, row * this.cellSize, width * this.cellSize, height * this.cellSize);
    this.context.fill();
  },

  // Low level drawing function; places an ellipse in the context path
  // but does not stroke or fill
  drawEllipse: function(x, y, w, h) {
    var kappa = .5522848,
        ox = (w / 2) * kappa, // control point offset horizontal
        oy = (h / 2) * kappa, // control point offset vertical
        xe = x + w,           // x-end
        ye = y + h,           // y-end
        xm = x + w / 2,       // x-middle
        ym = y + h / 2;       // y-middle

    this.context.beginPath();
    this.context.moveTo(x, ym);
    this.context.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
    this.context.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
    this.context.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
    this.context.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
    this.context.closePath();
  },

  tileBackground: function(vpX, vpY, vpW, vpH, imageObj) {
    var imgWidth = imageObj.width;
    var imgHeight = imageObj.height;

    if (imgWidth == 0 || imgHeight == 0) {
      return;
    }

    var x = vpX - (vpX % imgWidth) - imgWidth;
    var y = vpY - (vpY % imgHeight) - imgHeight;

    this.context.save();
    var pattern = this.context.createPattern(imageObj, 'repeat');
    this.context.fillStyle = pattern;
    this.context.fillRect(x, y, vpW + (2 * imgWidth), vpH + (2 * imgHeight));
    this.context.restore();
  },

  drawTile: function (x, y, width, height, imageObj) {
    var imgWidth = imageObj.width;
    var imgHeight = imageObj.height;

    if (imgWidth == 0 || imgHeight == 0) {
      return;
    }

    var boxWidth = width * this.cellSize;
    var boxHeight = height * this.cellSize;

    var imgColumns = Math.ceil(boxWidth / imgWidth);
    var imgRows = Math.ceil(boxHeight / imgHeight);

    for (var column = 0; column < imgColumns; column++) {
      for (var row = 0; row < imgRows; row++) {
        var rightClip = Math.min(imgWidth, boxWidth - (column * imgWidth));
        var bottomClip = Math.min(imgHeight, boxHeight - (row * imgHeight));

        var xPos = (x * this.cellSize) + (column * imgWidth);
        var yPos = (y * this.cellSize) + (row * imgHeight);

        this.context.drawImage(imageObj, 0, 0, rightClip, bottomClip, xPos, yPos, rightClip, bottomClip);
      }
    }
  },

  drawGrid: function (x, y, viewPortWidth, viewPortHeight, color) {

    var firstColumn = Math.floor(x / this.cellSize);
    var lastColumn = firstColumn + Math.floor(viewPortWidth / this.cellSize) + 1;

    var firstRow = Math.floor(y / this.cellSize);
    var lastRow = firstRow + Math.floor(viewPortHeight / this.cellSize) + 1;

    this.context.beginPath();
    this.context.lineWidth = 1;
    this.context.strokeStyle = color;

    var x1, y1, x2, y2;

    // Draw horizontal grid lines
    for (var row = firstRow; row <= lastRow; row++) {

      x1 = x;
      y1 = (this.cellSize * row) + 0.5;
      x2 = x + viewPortWidth;
      y2 = (this.cellSize * row) + 0.5;

      this.context.moveTo(x1, y1);
      this.context.lineTo(x2, y2);
    }

    // Draw vertical grid lines
    for (var col = firstColumn; col <= lastColumn; col++) {

      x1 = (this.cellSize * col) + 0.5;
      y1 = y;
      x2 = (this.cellSize * col) + 0.5;
      y2 = y + viewPortHeight;

      this.context.moveTo(x1, y1);
      this.context.lineTo(x2, y2);
    }

    this.context.stroke();
  },

  drawChessBoard : function(x, y, size, pattern_size) {
    var square_size = size / pattern_size;

    for (var i = 0; i < (pattern_size * pattern_size); i++) {
      var col = i % pattern_size;
      var row = parseInt(i / pattern_size);

      var color = ((col + row) % 2) == 0 ? "rgba(0, 0, 0, 1.0)" : "rgba(255, 255, 255, 1.0)";

      this.colorBackground(x + (col * square_size), y + (row * square_size), square_size, square_size, color);
    }
  },

  colorCell: function (column, row, color) {

    var left = (column * this.cellSize) + 1;
    var top = (row * this.cellSize) + 1;
    var width = this.cellSize - 1;
    var height = this.cellSize - 1;

    this.context.beginPath();
    this.context.rect(left, top, width, height);
    this.context.fillStyle = color;
    this.context.fill();
  },

  colorBackground: function(x, y, width, height, color) {
    this.context.beginPath();
    this.context.rect(x, y, width, height);
    this.context.fillStyle = color;
    this.context.fill();
  },

  gridWidth: function (columns) {
    return columns * this.cellSize;
  },

  gridHeight: function (rows) {
    return rows * this.cellSize;
  }
});