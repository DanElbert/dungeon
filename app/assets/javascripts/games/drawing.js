function Drawing(context) {
  this.context = context;
  this.cellHeight = 50;
  this.cellWidth = 50;

  this.clear = function (columns, rows) {
    this.context.clearRect(0, 0, columns * this.cellWidth, rows * this.cellHeight);
  };

  this.drawPath = function(start, end) {
    this.context.beginPath();
    this.context.lineWidth = 5;
    this.context.strokeStyle = "#000000";
    this.context.lineCap = 'round';

    var startX = (start[0] * this.cellWidth) + (this.cellWidth / 2);
    var startY = (start[1] * this.cellHeight) + (this.cellHeight / 2);
    var endX = (end[0] * this.cellWidth) + (this.cellWidth / 2);
    var endY = (end[1] * this.cellHeight) + (this.cellHeight / 2);

    this.context.moveTo(startX, startY);
    this.context.lineTo(endX, endY);

    this.context.stroke();
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
}