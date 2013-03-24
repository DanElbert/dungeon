
var Geometry = {

  // Given coordinates, returns the containing cell
  getCell: function(point, cellSize) {
    var x = Math.floor(point[0] / (cellSize));
    var y = Math.floor(point[1] / (cellSize));

    return [x, y];
  },

  // Returns the coordinates of the cell midpoint
  getCellMidpoint: function(cell, cellSize) {
    var x = (cell[0] * cellSize) + (cellSize / 2);
    var y = (cell[1] * cellSize) + (cellSize / 2);
    return [x, y];
  },

  // Returns the coordinates of the nearest cell intersection
  getNearestCellIntersection: function(mapPoint, cellSize) {
    var x = Geometry.roundToNearest(mapPoint[0], cellSize);
    var y = Geometry.roundToNearest(mapPoint[1], cellSize);
    return [x, y];
  },

  roundToNearest: function(value, multiple) {
    var mid = Math.floor(multiple / 2);
    var over = value % multiple;
    if (over >= mid) {
      return value + (multiple - over);
    } else {
      return value - over;
    }
  },

  // returns the distance between two points
  getDistance: function(p1, p2) {
    var x_side = Math.pow((p1[0] - p2[0]), 2);
    var y_side = Math.pow((p1[1] - p2[1]), 2);
    return Math.sqrt(x_side + y_side);
  },

  // Returns the Pathfinder distance between two cells (in squares)
  getCellDistance: function(c1, c2) {
    var dx = Math.abs(c1[0] - c2[0]);
    var dy = Math.abs(c1[1] - c2[1]);

    if (dx > dy) {
      return dx + Math.floor(dy / 2);
    } else {
      return dy + Math.floor(dx / 2);
    }
  },

  // Gets a movement path from start to end using Bresenham's Line Algorithm
  // See http://members.chello.at/~easyfilter/bresenham.html
  getMovementPath: function(startCell, endCell) {
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
  },

  // Given a list of cells, return a list of lines that will
  // draw a border
  // Note that this method is stupid and slow (O(n^2) stupid); try to cache this
  getBorder: function(cells, cellSize) {
    var lines = [];

    var cellExists = function(cell) {
      if (_.find(cells, function(c) { return c[0] == cell[0] && c[1] == cell[1]; })) {
        return true;
      }
      return false;
    };

    for (var x = 0; x < cells.length; x++) {
      var c = cells[x];
      var topLeft = [cellSize * c[0], cellSize * c[1]];

      // top
      if (!cellExists([c[0], c[1] - 1])) {
        lines.push({
          start: topLeft,
          end: [topLeft[0] + cellSize, topLeft[1]]
        });
      }

      // right
      if (!cellExists([c[0] + 1, c[1]])) {
        lines.push({
          start: [topLeft[0] + cellSize, topLeft[1]],
          end: [topLeft[0] + cellSize, topLeft[1] + cellSize]
        });
      }

      // bottom
      if (!cellExists([c[0], c[1] + 1])) {
        lines.push({
          start: [topLeft[0], topLeft[1] + cellSize],
          end: [topLeft[0] + cellSize, topLeft[1] + cellSize]
        });
      }

      // left
      if (!cellExists([c[0] - 1, c[1]])) {
        lines.push({
          start: topLeft,
          end: [topLeft[0], topLeft[1] + cellSize]
        });
      }
    }

    return lines;
  },

  // Returns an array of cells in the Pathfinder Radius template
  // given a center point (in cell coordinates) and
  // a radius (in cells)
  getCellsInRadius: function(center, radius) {

    var template = [];

    for (var o = 1; o <= 8; o++) {
      template = template.concat(Geometry.getOctant(center, radius, o));
    }

    // Octants can overlap; remove any duplicate cells
    template = _.uniq(template, false, function(p) { return p[0] + "|" + p[1]; });

    return template;
  },

  getCellsInCone: function(center, radius, angle) {
    angle = Geometry.roundToNearest(angle, 45);

    var octants = [];

    switch(angle) {
      case 360:
      case 0:
        octants = [8,1];
        break;
      case 45:
        octants = [1,2];
        break;
      case 90:
        octants = [2,3];
        break;
      case 135:
        octants = [3,4];
        break;
      case 180:
        octants = [4,5];
        break;
      case 225:
        octants = [5,6];
        break;
      case 270:
        octants = [6,7];
        break;
      case 315:
        octants = [7,8];
        break;
    }

    var template = [];

    for (var x = 0; x < octants.length; x++) {
      var o = octants[x];
      template = template.concat(Geometry.getOctant(center, radius, o));
    }

    // Octants can overlap; remove any duplicate cells
    template = _.uniq(template, false, function(p) { return p[0] + "|" + p[1]; });

    return template;
  },

  // Returns the cells from octant n, where n is
  // 1: ESE
  // 2: SSE
  // 3: SSW
  // 4: WSW
  // 5: WNW
  // 6: NNW
  // 7: NNE
  // 8: ENE
  getOctant: function(center, radius, n) {
    switch(n) {
      case 1:
        return Geometry.getOctant1(center, radius);
      case 2:
        return Geometry.getOctant2(center, radius);
      case 3:
        return Geometry.mirrorY(Geometry.getOctant2(center, radius), center[0]);
      case 4:
        return Geometry.mirrorY(Geometry.getOctant1(center, radius), center[0]);
      case 5:
        return Geometry.mirrorX(
            Geometry.mirrorY(Geometry.getOctant1(center, radius), center[0]),
            center[1]);
      case 6:
        return Geometry.mirrorX(
            Geometry.mirrorY(Geometry.getOctant2(center, radius), center[0]),
            center[1]);
      case 7:
        return Geometry.mirrorX(Geometry.getOctant2(center, radius), center[1]);
      case 8:
        return Geometry.mirrorX(Geometry.getOctant1(center, radius), center[1]);
      default:
        throw "Invalid octant (" + n + ")";
    }
  },

  // Returns the cells in the ESE octant
  getOctant1: function(center, radius) {
    var cells = [];

    for (var x = 0; x <= radius; x++) {
      for (var y = 0; y <= x; y++) {
        var xAdj = x + center[0];
        var yAdj = y + center[1];
        if (Geometry.getCellDistance([center[0] - 1, center[1] - 1], [xAdj, yAdj]) <= radius) {
          cells.push([xAdj, yAdj]);
        }
      }
    }

    return cells;
  },

  // Returns the cells in the SSE octant
  getOctant2: function(center, radius) {
    var cells = [];

    for (var y = 0; y <= radius; y++) {
      for (var x = 0; x <= y; x++) {
        var xAdj = x + center[0];
        var yAdj = y + center[1];
        if (Geometry.getCellDistance([center[0] - 1, center[1] - 1], [xAdj, yAdj]) <= radius) {
          cells.push([xAdj, yAdj]);
        }
      }
    }

    return cells;
  },

  mirrorX: function(points, axis) {
    return _.map(points, function(p) {
      return [p[0], axis - (p[1] - axis) - 1];
    });
  },

  mirrorY: function(points, axis) {
    return _.map(points, function(p) {
      return [axis - (p[0] - axis) - 1, p[1]];
    });
  },

  // Returns an array of cells inside the given polygon
  getCellsInPolygon: function(polygon, cellSize) {
    var cellBounds = Geometry.getBoundingCellBox(polygon);
    var cellMin = cellBounds[0];
    var cellMax = cellBounds[1];

    var cellsToFill = [];
    var dx = cellSize / 2;
    var dy = cellSize / 2;

    for (var x = cellMin[0]; x <= cellMax[0]; x++) {
      for (var y = cellMin[1]; y <= cellMax[1]; y++) {
        var cellMidpoint = Geometry.getCellMidpoint([x, y], cellSize);

        var corners = [
          [cellMidpoint[0] - dx, cellMidpoint[1] - dy],
          [cellMidpoint[0] + dx, cellMidpoint[1] - dy],
          [cellMidpoint[0] + dx, cellMidpoint[1] + dy],
          [cellMidpoint[0] - dx, cellMidpoint[1] + dy]
        ];

        var insideVertexCount = 0;

        for (var i = 0; i < corners.length; i++) {
          if (Geometry.isPointInPolygon(corners[i], polygon)) {
            insideVertexCount++;
          }
        }

        if (insideVertexCount == 4) {
          cellsToFill.push([x,y]);
        }
      }
    }

    return cellsToFill;
  },

  // Given a polygon in map coords, return the
  // bounding box of grid cells
  getBoundingCellBox: function(polygon, cellSize) {
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

    var min = [Math.floor(left / cellSize), Math.floor(top / cellSize)];
    var max = [Math.floor(right / cellSize), Math.floor(bottom / cellSize)];

    return [min, max];
  },

  createCirclePolygon: function(x, y, radius) {
    var points = [];
    for (var t = 0.0; t <= Math.PI * 2; t += (Math.PI / 20)) {
      var px = x + radius * Math.cos(t);
      var py = y + radius * Math.sin(t);
      points.push([px, py]);
    }

    return points;
  },

  // Returns true if the point is within the given polygon.
  // point must be a 2-element array with (x,y) coords,
  // and polygonArray must be a counter-clockwise ordered list
  // of n vertices with polygonArray[0] == polygonArray[n]
  isPointInPolygon: function(point, polygonArray) {
    // Uses the winding number method.
    // See http://geomalgorithms.com/a03-_inclusion.html, http://en.wikipedia.org/wiki/Winding_number

    var winding = 0;

    for (var x = 0; x < polygonArray.length - 1; x++) {
      var v1 = polygonArray[x];
      var v2 = polygonArray[x + 1];

      if (v1[1] <= point[1]) {
        if (v2[1] > point[1]) {
          if (Geometry.isLeft(v1, v2, point) > 0) {
            winding++;
          }
        }
      } else {
        if (v2[1] <= point[1]) {
          if (Geometry.isLeft(v1, v2, point) < 0) {
            winding--;
          }
        }
      }
    }

    return winding != 0;
  },

  // test if a point is Left|On|Right of an infinite 2D line.
  // given three points p0, p1, and p2
  // Return: >0 for p2 left of the line through p0 to p1
  //  =0 for p2 on the line
  //  <0 for p2 right of the line
  //
  // Implementation taken from here: http://geomalgorithms.com/a01-_area.html
  isLeft: function(p0, p1, p2) {
    return ( (p1[0] - p0[0]) * (p2[1] - p0[1]) - (p2[0] - p0[0]) * (p1[1] - p0[1]) );
  }
};