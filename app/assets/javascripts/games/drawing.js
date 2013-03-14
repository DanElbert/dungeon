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

    var totalMovement = this.calculateDistanceFromPath(cellPath);

    this.context.textBaseline = 'center';
    this.context.textAlign = 'center';
    this.context.font = 'bold 25px sans-serif';
    this.context.fillStyle = 'black';
    this.context.fillText(totalMovement, endPoint[0], endPoint[1]);
    this.context.fillText(totalMovement, startPoint[0], startPoint[1]);
  };

  // Given two cells, calculates the PF distance in feet
  this.calculateDistance = function(cell1, cell2) {
    var path = this.getMovementPath(cell1, cell2);
    return this.calculateDistanceFromPath(path);
  };

  // Given a path, calculates the PF distance traveled.
  // Assumes each cell is adjacent to the previous
  this.calculateDistanceFromPath = function(path) {
    var prev = null;
    var diagonalMoves = 0;
    for (var x = 0; x < path.length; x++) {
      var cur = path[x];
      if (prev && prev[0] != cur[0] && prev[1] != cur[1])
        diagonalMoves++;
      prev = cur;
    }

    return (path.length - 1 + Math.floor(diagonalMoves / 2)) * 5;
  };

  // Shades any cells that are _entirely_ within the given polygon
  this.fillPolygon = function(polygon) {
    var cellBounds = this.getBoundingCellBox(polygon);
    var cellMin = cellBounds[0];
    var cellMax = cellBounds[1];

    var cellsToFill = [];
    var dx = this.cellWidth / 2;
    var dy = this.cellHeight / 2;

    for (var x = cellMin[0]; x <= cellMax[0]; x++) {
      for (var y = cellMin[1]; y <= cellMax[1]; y++) {
        var cellMidpoint = this.getCellMidpoint([x, y]);

        var corners = [
          [cellMidpoint[0] - dx, cellMidpoint[1] - dy],
          [cellMidpoint[0] + dx, cellMidpoint[1] - dy],
          [cellMidpoint[0] + dx, cellMidpoint[1] + dy],
          [cellMidpoint[0] - dx, cellMidpoint[1] + dy]
        ];

        var insideVertexCount = 0;

        for (var i = 0; i < corners.length; i++) {
          if (this.isPointInPolygon(corners[i], polygon)) {
            insideVertexCount++;
          }
        }

        if (insideVertexCount == 4) {
          cellsToFill.push([x,y]);
        }
      }
    }

    _.each(cellsToFill, function(c) {
      this.colorCell(c[0], c[1], 'rgba(75, 75, 75, 0.8)');
    }, this);
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

  // Gets a movement path from start to end using Bresenham's Line Algorithm
  // See http://members.chello.at/~easyfilter/bresenham.html
  this.getMovementPath = function(startCell, endCell) {
    var x1 = startCell[0];
    var y1 = startCell[1];
    var x2 = endCell[0];
    var y2 = endCell[1];

    var dx = Math.abs(x2 - x1);
    var sx = x1 < x2 ? 1 : -1;

    var dy = -1 * Math.abs(y2 - y1);
    var sy = y1 < y2 ? 1 : -1;

    var err = dx + dy;
    var e2 = 0;

    var cellPath = [];

    while (true) {
      cellPath.push([x1, y1]);

      if (x1 == x2 && y1 == y2) {
        break;
      }

      e2 = err * 2;

      if (e2 >= dy) {
        err += dy;
        x1 += sx;
      }

      if (e2 <= dx) {
        err += dx;
        y1 += sy;
      }
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

  // Given a polygon in map coords, return the
  // bounding box of grid cells
  this.getBoundingCellBox = function(polygon) {
    var left = 9999;
    var top = 9999;
    var right = 0;
    var bottom = 0;

    for (var i = 0; i < polygon.length; i++) {
      var v = polygon[i];
      if (v[0] < left) left = v[0];
      if (v[0] > right) right = v[0];
      if (v[1] < top) top = v[1];
      if (v[1] > bottom) bottom = v[1];
    }

    var min = [Math.floor(left / this.cellWidth), Math.floor(top / this.cellHeight)];
    var max = [Math.floor(right / this.cellWidth), Math.floor(bottom / this.cellHeight)];

    return [min, max];
  };

  this.createCirclePolygon = function(x, y, radius) {
    var points = [];
    for (var t = 0.0; t <= Math.PI * 2; t += (Math.PI / 20)) {
      var px = x + radius * Math.cos(t);
      var py = y + radius * Math.sin(t);
      points.push([px, py]);
    }

    //points.push(points[points.length - 1]);

    return points;
  };

  // Returns true if the point is within the given polygon.
  // point must be a 2-element array with (x,y) coords,
  // and polygonArray must be a counter-clockwise ordered list
  // of n vertices with polygonArray[0] == polygonArray[n]
  this.isPointInPolygon = function(point, polygonArray) {
    // Uses the winding number method.
    // See http://geomalgorithms.com/a03-_inclusion.html, http://en.wikipedia.org/wiki/Winding_number

    var winding = 0;

    for (var x = 0; x < polygonArray.length - 1; x++) {
      var v1 = polygonArray[x];
      var v2 = polygonArray[x + 1];

      if (v1[1] <= point[1]) {
        if (v2[1] > point[1]) {
          if (this.isLeft(v1, v2, point) > 0) {
            winding++;
          }
        }
      } else {
        if (v2[1] <= point[1]) {
          if (this.isLeft(v1, v2, point) < 0) {
            winding--;
          }
        }
      }
    }

    return winding != 0;
  };

  // test if a point is Left|On|Right of an infinite 2D line.
  // given three points p0, p1, and p2
  // Return: >0 for p2 left of the line through p0 to p1
  //  =0 for p2 on the line
  //  <0 for p2 right of the line
  //
  // Implementation taken from here: http://geomalgorithms.com/a01-_area.html
  this.isLeft = function(p0, p1, p2) {
    return ( (p1[0] - p0[0]) * (p2[1] - p0[1]) - (p2[0] - p0[0]) * (p1[1] - p0[1]) );
  };

  this.getNearestCellIntersection = function(mapPoint) {
    var x = this.roundToNearest(mapPoint[0], this.cellWidth);
    var y = this.roundToNearest(mapPoint[1], this.cellHeight);
    return [x, y];
  };

  this.roundToNearest = function(value, multiple) {
    var mid = Math.floor(multiple / 2);
    var over = value % multiple;
    if (over >= mid) {
      return value + (multiple - over);
    } else {
      return value - over;
    }
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