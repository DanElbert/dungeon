export class Drawing {
  constructor(context, drawingSettings) {
    this.context = context;
    this.drawingSettings = drawingSettings;
    if (this.drawingSettings == null) throw "drawingSettings cannot be null";
    this.minWidth = 1;
  }

  get imageCache() {
    return this.drawingSettings.imageCache;
  }

  get cellSize() {
    return this.drawingSettings.cellSize;
  }

  get cellSizeFeet() {
    return this.drawingSettings.cellSizeFeet;
  }

  checkWidth(width) {
    return Math.max(width, this.minWidth);
  }

  clear (columns, rows) {
    this.context.clearRect(0, 0, columns * this.cellSize, rows * this.cellSize);
  }

  drawMovementLine(start, end, zoom) {
    var startPoint = Geometry.getCellMidpoint(start, this.cellSize);
    var endPoint = Geometry.getCellMidpoint(end, this.cellSize);

    var totalMovement = Geometry.getCellDistance(start, end) * this.cellSizeFeet;

    this.drawMeasureLine(startPoint, endPoint, window.Formatting.feetToText(totalMovement), null, null, zoom);
  }

  drawMeasureLine(start, end, label, color, width, zoom) {
    this.context.lineWidth = this.checkWidth(width || 5);
    this.context.strokeStyle = color || "#000000";
    this.context.lineCap = 'round';

    this.context.beginPath();
    this.context.moveTo(start[0], start[1]);
    this.context.lineTo(end[0], end[1]);

    this.context.stroke();

    var midPoint = [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2];

    zoom = zoom || 1;
    this.drawLabel(midPoint, label, "black", "black", "white", 25 / zoom);
  }

  // Draws some text in a rounded box and returns the bounding box
  drawLabel(midPoint, text, textColor, outlineColor, fillColor, fontSize) {

    fontSize = fontSize || 25;

    this.context.save();

    this.context.fillStyle = fillColor || "white";
    this.context.strokeStyle = outlineColor || "black";
    this.context.lineWidth = this.checkWidth(2);
    this.context.lineCap = 'round';

    var fontWidth = this.measureText(text, fontSize);
    var fontHeight = fontSize * 1.125;

    var xOffset = (fontWidth / 2) + (fontHeight / 2);
    var yOffset = fontHeight / 2;
    var bounds = [[midPoint[0] - xOffset, midPoint[1] - yOffset], [midPoint[0] + xOffset, midPoint[1] + yOffset]];

    // draw ovalish box
    this.drawRoundedBox(midPoint, fontWidth, fontHeight);

    this.context.stroke();
    this.context.fill();

    this.drawText(text, midPoint, fontSize, textColor || "black", null);

    this.context.restore();

    return bounds;
  }
  
  drawRoundedBox(center, width, height) {
    // draw ovalish box
    this.context.beginPath();
    this.context.moveTo(center[0] - (width / 2), center[1] - (height / 2));
    this.context.lineTo(center[0] + (width / 2), center[1] - (height / 2));
    this.context.arc(center[0] + (width / 2), center[1], height / 2, 1.5 * Math.PI, Math.PI / 2, false);
    this.context.lineTo(center[0] - (width / 2), center[1] + (height / 2));
    this.context.arc(center[0] - (width / 2), center[1], height / 2, Math.PI / 2, 1.5 * Math.PI, false);
    this.context.closePath();
  }

  // Draws text at the given point.  Centered by default, align and vAlign are optional params
  // that map to context.textAlign and context.textBaseLine respectively.
  // fillColor and strokeColor are both optional.  A null value will prevent the given operation
  // size is required, and is the font size in pixels (map coords)
  drawText(text, point, size, fillColor, strokeColor, strokeWidth, align, vAlign) {
    this.context.save();

    if (fillColor) this.context.fillStyle = fillColor;
    if (strokeColor) this.context.strokeStyle = strokeColor;

    this.context.lineWidth = strokeWidth || 2;

    this.context.font = 'bold ' + size + 'px "Open Sans", "Helvetica Neue", Helvetica, Arial, sans-serif';
    this.context.textAlign = align || "center";
    this.context.textBaseline = vAlign || "middle";

    if (fillColor) this.context.fillText(text, point[0], point[1]);
    if (strokeColor) this.context.strokeText(text, point[0], point[1]);

    this.context.restore();
  }

  measureText(text, size) {
    this.context.save();

    this.context.font = 'bold ' + size + 'px sans-serif';
    var measuredFontSize = this.context.measureText(text);

    this.context.restore();

    return measuredFontSize.width;
  }

  drawTemplate(cells, border, color) {
    this.context.globalAlpha = 0.3;

    cells.forEach(c => {
      this.colorCell(c[0], c[1], color, 0);
    });

    this.context.globalAlpha = 1;

    this.drawLines("black", 3, border);
  }
  
  drawOverlandMeasure(start, end, color, onlyoutline) {
    this.context.save();

    var dx = end[0] - start[0];
    var dy = end[1] - start[1];
    var height = 40 / this.drawingSettings.zoom;
    var width = Math.sqrt(dx ** 2 + dy ** 2);
    var rads = Math.atan2(dy, dx);

    this.context.translate(start[0], start[1]);
    this.context.rotate(rads);
    this.drawRoundedBox([width / 2, 0], width, height);


    if (onlyoutline) {
      this.context.strokeStyle = color;
      this.context.lineWidth = 6 / this.drawingSettings.zoom;
      this.context.stroke();
      this.context.strokeStyle = "black";
      this.context.lineWidth = 1 / this.drawingSettings.zoom;
      this.context.stroke();
    } else {
      this.context.fillStyle = color;
      this.context.globalAlpha = 0.3;
      this.context.fill();
      this.context.globalAlpha = 1;
      this.context.lineWidth = 2 / this.drawingSettings.zoom;
      this.context.stroke();

      this.drawLines("black", 2 / this.drawingSettings.zoom, [{start: [0, 0], end: [width, 0]}]);

      this.context.translate(width / 2, 0);
      this.context.rotate(-rads);
      var text = window.Formatting.feetToText(width / (this.drawingSettings.cellSize / this.drawingSettings.cellSizeFeet));
      this.drawLabel([0,0], text, "black", "black", "white", 20 / this.drawingSettings.zoom);
    }

    this.context.restore();
  }

  drawLines (color, width, lines) {
    this.context.beginPath();
    this.context.lineWidth = this.checkWidth(width);
    this.context.strokeStyle = color;
    this.context.lineCap = 'round';

    for (var x = 0; x < lines.length; x++) {
      var start = lines[x].start;
      var end = lines[x].end;
      if (x == 0 || !Geometry.areEqual(start, lines[x-1].end)) {
        this.context.moveTo(start[0], start[1]);
      }
      this.context.lineTo(end[0], end[1]);
    }

    this.context.stroke();
  }

  drawSquare(topLeft, bottomRight, color, bgColor, width, lineCap) {
    this.context.lineWidth = this.checkWidth(width);
    this.context.strokeStyle = color;
    this.context.lineCap = lineCap || "round";

    this.context.beginPath();
    this.context.moveTo(topLeft[0], topLeft[1]);
    this.context.lineTo(bottomRight[0], topLeft[1]);
    this.context.lineTo(bottomRight[0], bottomRight[1]);
    this.context.lineTo(topLeft[0], bottomRight[1]);
    this.context.closePath();

    if (bgColor) {
      this.context.fillStyle = bgColor;
      this.context.fill();
    }

    this.context.stroke();
  }

  eraseLines(width, lines) {

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
  }

  drawCircle(x, y, radius, width, color, fill) {
    this.context.lineWidth = this.checkWidth(width);
    this.context.strokeStyle = color;
    this.context.beginPath();
    // For some reason, some browsers draw filled squares when the angle is 2.0 * PI; this fixes it without visual issues
    this.context.arc(x, y, radius, 0, 1.95 * Math.PI, false);
    this.context.closePath();

    if (fill) {
      this.context.fillStyle = fill;
      this.context.fill();
    }

    this.context.stroke();
  }

  drawCross(x, y, size, lineWidth, color) {
    var crossSize = size;
    var lines = [
      {start: [x - crossSize, y], end: [x + crossSize, y]},
      {start: [x, y - crossSize], end: [x, y + crossSize]}
    ];
    this.drawLines(color, lineWidth, lines);
  }

  drawCircleTiles(col, row, width, height, color, border) {
    this.context.save();
    this.context.fillStyle = color;
    this.drawEllipse(col * this.cellSize, row * this.cellSize, width * this.cellSize, height * this.cellSize);
    this.context.fill();

    if (border) {
      this.context.lineWidth = 5;
      this.context.setLineDash([4, 2]);
      //this.context.lineDashOffset = (Date.now() / 100) % 16;
      this.context.strokeStyle = border;
      this.context.stroke();
    }
    this.context.restore();
  }

  drawToken(col, row, width, height, color, text, fontColor, fontSize, highlight) {
    this.drawCircleTiles(col, row, width, height, color, highlight);
    var fontPoint = [col * this.cellSize, row * this.cellSize];
    fontPoint[0] += (width * this.cellSize) / 2;
    fontPoint[1] += (height * this.cellSize) / 2;
    this.drawText(text, fontPoint, fontSize, fontColor);
  }

  // Low level drawing function; places an ellipse in the context path
  // but does not stroke or fill
  drawEllipse(x, y, w, h) {
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
  }

  tileBackground(vpX, vpY, vpW, vpH, imageUrl) {

    var imageObj;

    if (typeof imageUrl === 'string' || imageUrl instanceof String) {
      imageObj = this.imageCache.getImage(imageUrl);
    } else {
      imageObj = imageUrl;
    }

    if (imageObj == null) return;

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
  }

  drawTile (x, y, width, height, imageObj) {
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
  }

  drawGrid (x, y, viewPortWidth, viewPortHeight, color, zoom) {

    var minZoomedGridSize = 25;
    var gridSize = this.cellSize;
    var lineWidth = 1 / this.drawingSettings.zoom;

    while ((gridSize * this.drawingSettings.zoom) < minZoomedGridSize) {
      gridSize = gridSize * 2;
      lineWidth = lineWidth + 1;
    }

    var firstColumn = Math.floor(x / gridSize);
    var lastColumn = firstColumn + Math.floor(viewPortWidth / gridSize) + 1;

    var firstRow = Math.floor(y / gridSize);
    var lastRow = firstRow + Math.floor(viewPortHeight / gridSize) + 1;

    this.context.save();
    this.context.globalAlpha = 0.5;
    this.context.beginPath();
    this.context.lineWidth = lineWidth;
    this.context.strokeStyle = color;

    var x1, y1, x2, y2;

    // Draw horizontal grid lines
    for (var row = firstRow; row <= lastRow; row++) {

      x1 = x;
      y1 = (gridSize * row) + 0.5;
      x2 = x + viewPortWidth;
      y2 = (gridSize * row) + 0.5;

      this.context.moveTo(x1, y1);
      this.context.lineTo(x2, y2);
    }

    // Draw vertical grid lines
    for (var col = firstColumn; col <= lastColumn; col++) {

      x1 = (gridSize * col) + 0.5;
      y1 = y;
      x2 = (gridSize * col) + 0.5;
      y2 = y + viewPortHeight;

      this.context.moveTo(x1, y1);
      this.context.lineTo(x2, y2);
    }

    this.context.stroke();
    this.context.restore();
  }

  drawImageFromCenter(x, y, imageUrl, scale, rotation, topLeft, bottomRight) {
    var imgObj = this.imageCache.getImage(imageUrl);
    if (imgObj) {
      scale = scale || 1.0;
      rotation = rotation || 0.0;

      this.context.save();

      this.context.translate(x, y);
      this.context.scale(scale, scale);
      this.context.rotate(rotation * Math.PI / 180);
      this.context.translate(-(imgObj.width / 2), -(imgObj.height / 2));

      var sx = 0;
      var sy = 0;
      var sWidth = imgObj.width;
      var sHeight = imgObj.height;

      this.context.drawImage(imgObj, sx, sy, sWidth, sHeight, 0, 0, sWidth, sHeight);
      this.context.restore();
    }
    //this.drawCircle(x, y, 10, 3, "red", null);
  }

  drawImage(x, y, imageUrl) {
    var imgObj = this.imageCache.getImage(imageUrl);
    if (imgObj) {
      this.context.drawImage(imgObj, x, y);
    }
  }

  drawChessBoard(x, y, size, pattern_size) {
    var square_size = size / pattern_size;

    for (var i = 0; i < (pattern_size * pattern_size); i++) {
      var col = i % pattern_size;
      var row = parseInt(i / pattern_size);

      var color = ((col + row) % 2) == 0 ? "rgba(0, 0, 0, 1.0)" : "rgba(255, 255, 255, 1.0)";

      this.colorBackground(x + (col * square_size), y + (row * square_size), square_size, square_size, color);
    }
  }

  colorCell (column, row, color, borderSize) {

    if (arguments.length < 4) {
      borderSize = 1;
    }

    var left = (column * this.cellSize) + borderSize;
    var top = (row * this.cellSize) + borderSize;
    var width = this.cellSize - borderSize;
    var height = this.cellSize - borderSize;

    this.context.beginPath();
    this.context.rect(left, top, width, height);
    this.context.fillStyle = color;
    this.context.fill();
  }

  colorBackground(x, y, width, height, color) {
    this.context.beginPath();
    this.context.rect(x, y, width, height);
    this.context.fillStyle = color;
    this.context.fill();
  }

  gridWidth (columns) {
    return columns * this.cellSize;
  }

  gridHeight (rows) {
    return rows * this.cellSize;
  }
}


window.Drawing = Drawing;