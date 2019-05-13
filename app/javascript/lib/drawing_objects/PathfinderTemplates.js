import { BaseTemplate, BaseCellTemplate } from "./BaseTemplate";
import { Geometry, Rectangle, Vector2 } from "../geometry";

// =======================
// PathfinderMovementTemplate
// =======================
class PathfinderMovementTemplate extends BaseCellTemplate {
  constructor(uid, board, position, color, cellDelta) {
    super(uid, board, position, color);
    this.cellDelta = cellDelta;
  }

  calculateCells(cellSize) {
    var start = this.startCell();
    var end = this.endCell();
    return Geometry.getMovementPath(start, end);
  }

  drawExtras(drawing) {
    var start = this.startCell();
    var end = this.endCell();

    drawing.drawMovementLine(start, end, this.board.getZoom());
  }

  clone(uid) {
    return new PathfinderMovementTemplate(uid, this.board, this.position, this.color, this.cellDelta);
  }

  toAction(newUid) {
    return {
      version: 1,
      actionType: "movementTemplateAction",
      uid: newUid || this.uid,
      position: this.position.toArray(),
      color: this.color,
      cellDelta: this.cellDelta.toArray()
    };
  }

  startCell() {
    return Geometry.getCell([this.position.x, this.position.y], this.cellSize);
  }

  endCell() {
    return Geometry.getCell([this.position.x + (this.cellDelta.x * this.cellSize), this.position.y + (this.cellDelta.y * this.cellSize)], this.cellSize);
  }
}



// =======================
// PathfinderRadiusTemplate
// =======================
class PathfinderRadiusTemplate extends BaseCellTemplate {
  constructor(uid, board, position, color, cellRadius) {
    super(uid, board, position, color);
    this.cellRadius = cellRadius;
  }

  calculateCells(cellSize) {
    var centerCell = Geometry.getCell([this.position.x, this.position.y], this.cellSize);
    return Geometry.getCellsInRadius(centerCell, this.cellRadius);
  }

  clone(uid) {
    return new PathfinderRadiusTemplate(uid, this.board, this.position, this.color, this.cellRadius);
  }

  toAction(newUid) {
    return {
      version: 1,
      actionType: "radiusTemplateAction",
      uid: newUid || this.uid,
      position: this.position.toArray(),
      color: this.color,
      radius: this.cellRadius
    };
  }
}


// =======================
// PathfinderLineTemplate
// =======================
class PathfinderLineTemplate extends BaseCellTemplate {
  constructor(uid, board, position, color, delta) {
    super(uid, board, position, color);
    this.delta = delta;
  }

  calculateCells(cellSize) {
    return Geometry.getCellsOnLine([this.position.x, this.position.y], [this.position.x + this.delta.x, this.position.y + this.delta.y], this.cellSize);
  }

  clone(uid) {
    return new PathfinderLineTemplate(uid, this.board, this.position, this.color, this.delta);
  }

  toAction(newUid) {
    return {
      version: 1,
      actionType: "lineTemplateAction",
      uid: newUid || this.uid,
      position: this.position.toArray(),
      color: this.color,
      delta: this.delta.toArray()
    };
  }
}


// =======================
// PathfinderConeTemplate
// =======================
class PathfinderConeTemplate extends BaseCellTemplate {
  constructor(uid, board, position, color, cellRadius, angle) {
    super(uid, board, position, color);
    this.cellRadius = cellRadius;
    this.angle = angle;
  }

  calculateCells(cellSize) {
    var intersection = Geometry.getCell([this.position.x, this.position.y], this.cellSize);
    return Geometry.getCellsInCone(intersection, this.cellRadius, this.angle);
  }

  clone(uid) {
    return new PathfinderConeTemplate(uid, this.board, this.position, this.color, this.cellRadius, this.angle);
  }

  toAction(newUid) {
    return {
      version: 1,
      actionType: "coneTemplateAction",
      uid: newUid || this.uid,
      position: this.position.toArray(),
      color: this.color,
      cellRadius: this.cellRadius,
      angle: this.angle
    };
  }
}


// =======================
// PathfinderRectangleTemplate
// =======================
class PathfinderRectangleTemplate extends BaseCellTemplate {
  constructor(uid, board, position, color, cellDelta) {
    super(uid, board, position, color);
    this.cellDelta = cellDelta;
  }

  calculateCells(cellSize) {
    var rect = new Rectangle(new Vector2(Geometry.getCell([this.position.x, this.position.y], this.cellSize)), this.cellDelta.x, this.cellDelta.y);
    return Geometry.getCellsInRectangle(rect.topLeft().toArray(), rect.bottomRight().toArray());
  }

  clone(uid) {
    return new PathfinderRectangleTemplate(uid, this.board, this.position, this.color, this.cellDelta);
  }

  toAction(newUid) {
    return {
      version: 1,
      actionType: "rectangleTemplateAction",
      uid: newUid || this.uid,
      position: this.position.toArray(),
      color: this.color,
      cellDelta: this.cellDelta.toArray()
    };
  }
}



// =======================
// PathfinderReachTemplate
// =======================
class PathfinderReachTemplate extends BaseCellTemplate {
  constructor(uid, board, position, color, size, reach) {
    super(uid, board, position, color);
    this.size = size;
    this.reach = reach;
  }

  calculateCells(cellSize) {
    var template = Geometry.getReachCells([this.position.x, this.position.y], this.size, this.reach, this.cellSize);
    return template.threat;
  }

  clone(uid) {
    return new PathfinderReachTemplate(uid, this.board, this.position, this.color, this.size, this.reach);
  }

  toAction(newUid) {
    return {
      version: 1,
      actionType: "reachTemplateAction",
      uid: newUid || this.uid,
      position: this.position.toArray(),
      color: this.color,
      size: this.size,
      reach: this.reach
    };
  }
}

export {
  PathfinderConeTemplate,
  PathfinderLineTemplate,
  PathfinderMovementTemplate,
  PathfinderRadiusTemplate,
  PathfinderReachTemplate,
  PathfinderRectangleTemplate
}