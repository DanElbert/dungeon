function Drawing(context) {
  this.context = context;
  this.cellSize = 50;

  this.clear = function (columns, rows) {
    this.context.clearRect(0, 0, columns * this.cellSize, rows * this.cellSize);
  };

  this.drawMovementLine = function(start, end) {
    var startPoint = Geometry.getCellMidpoint(start, this.cellSize);
    var endPoint = Geometry.getCellMidpoint(end, this.cellSize);

    var totalMovement = Geometry.getCellDistance(start, end) * 5;

    this.drawMeasureLine(startPoint, endPoint, totalMovement);
  };

  this.drawMeasureLine = function(start, end, label) {
    this.context.lineWidth = 5;
    this.context.strokeStyle = "#000000";
    this.context.lineCap = 'round';

    this.context.textBaseline = 'middle';
    this.context.textAlign = 'center';
    this.context.font = 'bold 25px sans-serif';

    this.context.beginPath();
    this.context.moveTo(start[0], start[1]);
    this.context.lineTo(end[0], end[1]);

    this.context.stroke();

    var midPoint = [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2];
    var fontWidth = this.context.measureText(label).width;
    fontWidth = Math.max(fontWidth, 20);
    var fontHeight = 28;

    // draw ovalish box
    this.context.beginPath();
    this.context.moveTo(midPoint[0] - (fontWidth / 2), midPoint[1] - (fontHeight / 2));
    this.context.lineTo(midPoint[0] + (fontWidth / 2), midPoint[1] - (fontHeight / 2));
    this.context.arc(midPoint[0] + (fontWidth / 2), midPoint[1], fontHeight / 2, 1.5 * Math.PI, Math.PI / 2, false);
    this.context.lineTo(midPoint[0] - (fontWidth / 2), midPoint[1] + (fontHeight / 2));
    this.context.arc(midPoint[0] - (fontWidth / 2), midPoint[1], fontHeight / 2, Math.PI / 2, 1.5 * Math.PI, false);
    this.context.closePath();

    this.context.fillStyle = 'white';
    this.context.strokeStyle = 'black';
    this.context.lineWidth = 2;
    this.context.stroke();
    this.context.fill();

    this.context.fillStyle = 'black';

    this.context.fillText(label, midPoint[0], midPoint[1] + 2);
  };

  this.drawTemplate = function(cells, border, color) {
    this.context.globalAlpha = 0.3;

    _.each(cells, function(c) {
      this.colorCell(c[0], c[1], color);
    }, this);

    this.context.globalAlpha = 1;

    this.drawLines("black", 3, border);
  };

  this.drawLines = function (color, width, lines) {
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
  };

  this.drawSquare = function(topLeft, bottomRight, color, width) {
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
  };

  this.eraseLines = function(width, lines) {

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
  };

  this.drawCircle = function(x, y, radius, width, color) {
    this.context.beginPath();
    this.context.arc(x, y, radius, 0, 2 * Math.PI, false);
    this.context.lineWidth = width;
    this.context.strokeStyle = color;
    this.context.stroke();
  };

  // Low level drawing function; places an ellipse in the context path
  // but does not stroke or fill
  this.drawEllipse = function(x, y, w, h) {
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
  };

  this.drawTile = function (x, y, width, height, imageObj) {
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

  };

  this.drawGrid = function (rows, columns, color) {

    var width = this.gridWidth(columns);
    var height = this.gridHeight(rows);

    this.context.beginPath();
    this.context.lineWidth = 1;
    this.context.strokeStyle = color;

    // Draw horizontal grid lines
    for (var x = 0; x <= rows; x++) {

      var x1 = 0.5;
      var y1 = (this.cellSize * x) + 0.5;
      var x2 = width + 0.5;
      var y2 = (this.cellSize * x) + 0.5;

      this.context.moveTo(x1, y1);
      this.context.lineTo(x2, y2);
    }

    // Draw vertical grid lines
    for (var x = 0; x <= columns; x++) {

      var x1 = (this.cellSize * x) + 0.5;
      var y1 = 0.5;
      var x2 = (this.cellSize * x) + 0.5;
      var y2 = height + 0.5;

      this.context.moveTo(x1, y1);
      this.context.lineTo(x2, y2);
    }

    this.context.stroke();
  };

  this.colorCell = function (column, row, color) {

    var left = (column * this.cellSize) + 1;
    var top = (row * this.cellSize) + 1;
    var width = this.cellSize - 1;
    var height = this.cellSize - 1;

    this.context.beginPath();
    this.context.rect(left, top, width, height);
    this.context.fillStyle = color;
    this.context.fill();
  };

  this.colorBackground = function (columns, rows, color) {
    this.context.beginPath();
    this.context.rect(0, 0, columns * this.cellSize, rows * this.cellSize);
    this.context.fillStyle = color;
    this.context.fill();
  };

  this.gridWidth = function (columns) {
    return columns * this.cellSize;
  };

  this.gridHeight = function (rows) {
    return rows * this.cellSize;
  };


}