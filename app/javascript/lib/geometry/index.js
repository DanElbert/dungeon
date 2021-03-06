import Vector2 from "./vector2";
import TransformMatrix from "./matrix";
import Rectangle from "./rectangle";
import reachData from "./reach";
import uniqBy from "lodash/uniqBy";

const Geometry = {

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

  getNearestHalfCellSnap: function(mapPoint, cellSize) {
    var x = Geometry.roundToNearest(mapPoint[0], cellSize / 2);
    var y = Geometry.roundToNearest(mapPoint[1], cellSize / 2);
    return [x, y];
  },

  getNearestCellCenter: function(mapPoint, cellSize) {
    return Geometry.getCellMidpoint(Geometry.getCell(mapPoint, cellSize), cellSize);
  },

  areEqual: function(p1, p2) {
    return p1[0] == p2[0] && p1[1] == p2[1];
  },

  roundToNearest: function(value, multiple) {
    var valueAbs = Math.abs(value);

    var mid = Math.floor(multiple / 2);
    var over = valueAbs % multiple;
    if (over >= mid) {
      valueAbs = valueAbs + (multiple - over);
    } else {
      valueAbs = valueAbs - over;
    }

    return value < 0 ? valueAbs * -1 : valueAbs;
  },

  // If value is within `snapDistance` of a multiple of snapMultiple, that multiple is returned, otherwise returns `value`
  snapNear: function(value, snapDistance, snapMultiple) {
    var mod = Math.abs(value % snapMultiple);
    mod = Math.min(mod, snapMultiple - mod);
    if (mod <= snapDistance) {
      return Geometry.roundToNearest(value, snapMultiple);
    } else {
      return value;
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

  // Given the corners of 2 rectangles, return whether they overlap
  rectanglesOverlap: function(leftTopA, rightBottomA, leftTopB, rightBottomB) {
    var xOverlap = Geometry.inRange(leftTopA[0], leftTopB[0], rightBottomB[0]) ||
      Geometry.inRange(leftTopB[0], leftTopA[0], rightBottomA[0]);

    var yOverlap = Geometry.inRange(leftTopA[1], leftTopB[1], rightBottomB[1]) ||
      Geometry.inRange(leftTopB[1], leftTopA[1], rightBottomA[1]);

    return xOverlap && yOverlap;
  },

  inRange: function(value, min, max) {
    return (value <= max) && (value >= min);
  },

  // Given a map point, creature size (such as huge_tall), and whether to use reach rules,
  // returns an object with 2 properties, each an array of cells: creature and threat
  getReachCells: function(point, size, isReach, cellSize) {

    if (size == "small") {
      size = "medium";
    }

    var data = reachData[size];
    var cell = Geometry.getCell(point, cellSize);
    var cellAnchor = [cell[0] - Math.floor(data.size / 2), cell[1] - Math.floor(data.size / 2)];

    var mapper = p => {
      return [p[0] + cellAnchor[0], p[1] + cellAnchor[1]];
    };

    return {
      creature: data.creature.map(mapper),
      threat: (isReach ? data.reach : data.threat).map(mapper)
    };
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
  getBorder: function(cells, cellSize) {
    var cellGrid = [];
    var addCell = function(x, y) {
      if (cellGrid[x] == null) cellGrid[x] = [];
      cellGrid[x][y] = true;
    };
    var cellExists = function(cell) {
      return cellGrid[cell[0]] && cellGrid[cell[0]][cell[1]];
    };

    cells.forEach(c => addCell(c[0], c[1]));

    var lines = [];

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

  getCellsInRectangle: function(topLeft, bottomRight) {
    var cells = [];
    for (var x = topLeft[0]; x < bottomRight[0]; x++) {
      for (var y = topLeft[1]; y < bottomRight[1]; y++) {
        cells.push([x,y]);
      }
    }

    return cells;
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
    template = uniqBy(template, p => p[0] + "|" + p[1]);

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
    template = uniqBy(template, p => p[0] + "|" + p[1]);

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
    return points.map(p => [p[0], axis - (p[1] - axis) - 1]);
  },

  mirrorY: function(points, axis) {
    return points.map(p => [axis - (p[0] - axis) - 1, p[1]])
  },

  // Given a line segment defined by endpoints p1 and p2, return a list of cells through which the line passes
  getCellsOnLine: function(p1, p2, cellSize) {
    // Determine the search space by calculating the enclosing rectangle of cells
    var minX, maxX, minY, maxY;

    p1 = p1.slice(0);
    p2 = p2.slice(0);

    // For straight lines, the following algorithm will produce no cells.  This shows a preference to returns cells
    // towards the positive axis
    if (p1[0] == p2[0]) { p2[0] = p2[0] + cellSize; }
    if (p1[1] == p2[1]) { p2[1] = p2[1] + cellSize; }

    var bounds = Geometry.getBoundingCellBox([p1, p2], cellSize);
    minX = bounds[0][0];
    maxX = bounds[1][0];
    minY = bounds[0][1];
    maxY = bounds[1][1];

    // For each cell in the search space, check the position of each cell vertex against the line.  If
    // any two points have a different non-zero val for isLeft, the cell is included
    var cells = [];

    for (var x = minX; x <= maxX; x++) {
      for (var y = minY; y <= maxY; y++) {
        var realX = x * cellSize;
        var realY = y * cellSize;

        var total = 0;

        [
          [realX, realY],
          [realX + cellSize, realY],
          [realX, realY + cellSize],
          [realX + cellSize, realY + cellSize]
        ].forEach(p => {
          var isLeft = Geometry.isLeft(p1, p2, p);
          if (isLeft > 0) isLeft = 1;
          if (isLeft < 0) isLeft = -1;

          total += isLeft;
        });

        if (Math.abs(total) < 3) {
          cells.push([x, y]);
        }
      }
    }

    return cells;
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
    var left = 99999;
    var top = 99999;
    var right = -99999;
    var bottom = -99999;

    for (var i = 0; i < polygon.length; i++) {
      var v = polygon[i];
      if (v[0] < left) left = v[0];
      if (v[0] > right) right = v[0];
      if (v[1] < top) top = v[1];
      if (v[1] > bottom) bottom = v[1];
    }

    var min = [Math.floor(left / cellSize), Math.floor(top / cellSize)];
    var max = [Math.floor((right - 1) / cellSize), Math.floor((bottom - 1) / cellSize)];

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

export {
  Vector2,
  Rectangle,
  TransformMatrix,
  Geometry
}