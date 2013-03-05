function Drawing(context) {
  this.context = context;
  this.cellHeight = 50;
  this.cellWidth = 50;

  this.clear = function (columns, rows) {
    this.context.clearRect(0, 0, columns * this.cellWidth, rows * this.cellHeight);
  };

  this.drawPath = function(start, end) {
    var startPoint = this.getCellMidpoint(start);
    var endPoint = this.getCellMidpoint(end);

    var cellPath = this.getMovementPath(start, end);

    _.each(cellPath, function(c) {
      this.colorCell(c[0], c[1], 'rgba(75, 75, 75, 0.8)');
    }, this);

    this.context.beginPath();
    this.context.lineWidth = 5;
    this.context.strokeStyle = "#000000";
    this.context.lineCap = 'round';

    this.context.moveTo(startPoint[0], startPoint[1]);
    this.context.lineTo(endPoint[0], endPoint[1]);

    this.context.stroke();

    // TODO: Extract this somewhere more useful
    // Count Movement spaces
    var prev = null;
    var diagonalMoves = 0;
    for (var x = 0; x < cellPath.length; x++) {
      var cur = cellPath[x];
      if (prev && prev[0] != cur[0] && prev[1] != cur[1])
        diagonalMoves++;
      prev = cur;
    }

    var totalMovement = (cellPath.length - 1 + Math.floor(diagonalMoves / 2)) * 5;

    this.context.textBaseline = 'center';
    this.context.textAlign = 'center';
    this.context.font = 'bold 25px sans-serif';
    this.context.fillStyle = 'black';
    this.context.fillText(totalMovement, endPoint[0], endPoint[1]);
    this.context.fillText(totalMovement, startPoint[0], startPoint[1]);
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
      var distance = this.getDistance(start, end);

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
    context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI, false);
    context.lineWidth = width;
    context.strokeStyle = color;
    context.stroke();
  };

  this.drawTile = function (x, y, width, height, imageObj) {
    var imgWidth = imageObj.width;
    var imgHeight = imageObj.height;

    if (imgWidth == 0 || imgHeight == 0) {
      return;
    }

    var boxWidth = width * this.cellWidth;
    var boxHeight = height * this.cellHeight;

    var imgColumns = Math.ceil(boxWidth / imgWidth);
    var imgRows = Math.ceil(boxHeight / imgHeight);

    for (var column = 0; column < imgColumns; column++) {
      for (var row = 0; row < imgRows; row++) {
        var rightClip = Math.min(imgWidth, boxWidth - (column * imgWidth));
        var bottomClip = Math.min(imgHeight, boxHeight - (row * imgHeight));

        var xPos = (x * this.cellWidth) + (column * imgWidth);
        var yPos = (y * this.cellHeight) + (row * imgHeight);

        this.context.drawImage(imageObj, 0, 0, rightClip, bottomClip, xPos, yPos, rightClip, bottomClip);
      }
    }

  }

  this.drawGrid = function (rows, columns, color) {

    var width = this.gridWidth(columns);
    var height = this.gridHeight(rows);

    this.context.beginPath();
    this.context.lineWidth = 1;
    this.context.strokeStyle = color;

    // Draw horizontal grid lines
    for (var x = 0; x <= rows; x++) {

      var x1 = 0.5;
      var y1 = (this.cellHeight * x) + 0.5;
      var x2 = width + 0.5;
      var y2 = (this.cellHeight * x) + 0.5;

      this.context.moveTo(x1, y1);
      this.context.lineTo(x2, y2);
    }

    // Draw vertical grid lines
    for (var x = 0; x <= columns; x++) {

      var x1 = (this.cellWidth * x) + 0.5;
      var y1 = 0.5;
      var x2 = (this.cellWidth * x) + 0.5;
      var y2 = height + 0.5;

      this.context.moveTo(x1, y1);
      this.context.lineTo(x2, y2);
    }

    this.context.stroke();
  };

  this.colorCell = function (column, row, color) {

    var left = (column * this.cellWidth) + 1;
    var top = (row * this.cellHeight) + 1;
    var width = this.cellWidth - 1;
    var height = this.cellHeight - 1;

    this.context.beginPath();
    this.context.rect(left, top, width, height);
    this.context.fillStyle = color;
    this.context.fill();
  };

  this.colorBackground = function (columns, rows, color) {
    this.context.beginPath();
    this.context.rect(0, 0, columns * this.cellWidth, rows * this.cellHeight);
    this.context.fillStyle = color;
    this.context.fill();
  };

  this.getMovementPath = function(startCell, endCell) {
    var startPoint = this.getCellMidpoint(startCell);
    var endPoint = this.getCellMidpoint(endCell);
    var startX = startPoint[0];
    var startY = startPoint[1];
    var endX = endPoint[0];
    var endY = endPoint[1];

    var flipped = false;

    if (Math.abs(startY - endY) > Math.abs(startX - endX)) {
      flipped = true;
      var tmp = startX;
      startX = startY;
      startY = tmp;

      tmp = endX;
      endX = endY;
      endY = tmp;
    }

    // line function: y = mx + b, where m is the slope, and b is the y-intercept
    var m = (startX - endX) == 0 ? 0 : (startY - endY) / (startX - endX);
    var b = startY - (m * startX);

    var lineFunction = function(x) {
      return (m * x) + b;
    };

    var cellPath = [];
    var dirX = startX <= endX ? 1 : -1;

    for (var x = startX; dirX == 1 ? x <= endX : x >= endX; x += (this.cellWidth * dirX)) {
      var y = lineFunction(x);
      var cell = this.getCell(x, y);
      cellPath.push(cell);
    }

    if (flipped) {
      cellPath = _.map(cellPath, function(c) { return [c[1], c[0]]; })
    }

    return cellPath;
  };

  this.getCellMidpoint = function(cell) {
    var x = (cell[0] * this.cellWidth) + (this.cellWidth / 2);
    var y = (cell[1] * this.cellHeight) + (this.cellHeight / 2);
    return [x, y];
  };

  this.gridWidth = function (columns) {
    return columns * this.cellWidth;
  };

  this.gridHeight = function (rows) {
    return rows * this.cellHeight;
  };

  this.getDistance = function(p1, p2) {
    var x_side = Math.pow((p1[0] - p2[0]), 2);
    var y_side = Math.pow((p1[1] - p2[1]), 2);
    return Math.sqrt(x_side + y_side);
  };

  this.getCell = function(x, y) {
    var x = Math.floor(x / (this.cellWidth));
    var y = Math.floor(y / (this.cellHeight));

    return [x, y];
  };
}