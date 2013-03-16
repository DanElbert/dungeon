function Drawing(context) {
  this.context = context;
  this.cellSize = 50;

  this.clear = function (columns, rows) {
    this.context.clearRect(0, 0, columns * this.cellSize, rows * this.cellSize);
  };

  this.drawMovement = function(start, end, color) {
    var startPoint = Geometry.getCellMidpoint(start, this.cellSize);
    var endPoint = Geometry.getCellMidpoint(end, this.cellSize);

    var cellPath = Geometry.getMovementPath(start, end);

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

    var totalMovement = Geometry.getCellDistance(start, end);

    this.context.textBaseline = 'center';
    this.context.textAlign = 'center';
    this.context.font = 'bold 25px sans-serif';
    this.context.fillStyle = 'black';
    this.context.fillText(totalMovement, endPoint[0], endPoint[1]);
    this.context.fillText(totalMovement, startPoint[0], startPoint[1]);
  };

  this.drawRadiusTemplate = function(intersection, radius, color) {


    var template = Geometry.getCellsInRadius(intersection, radius);

    this.context.globalAlpha = 0.5;

    _.each(template, function(c) {
      this.colorCell(c[0], c[1], color);
    }, this);

    this.context.globalAlpha = 1;
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