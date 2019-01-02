// =======================
// PathfinderMovementTemplate
// =======================
function PathfinderMovementTemplate(uid, board, position, color, cellDelta) {
  BaseCellTemplate.call(this, uid, board, position, color);
  this.cellDelta = cellDelta;
}

PathfinderMovementTemplate.prototype = _.extend(PathfinderMovementTemplate.prototype, BaseCellTemplate.prototype, {
  calculateCells: function(cellSize) {
    var start = this.startCell();
    var end = this.endCell();
    return Geometry.getMovementPath(start, end);
  },

  drawExtras: function(drawing) {
    var start = this.startCell();
    var end = this.endCell();

    drawing.drawMovementLine(start, end, this.board.getZoom());
  },

  clone: function(uid) {
    return new PathfinderMovementTemplate(uid, this.board, this.position, this.color, this.cellDelta);
  },

  toAction(newUid) {
    return {
      version: 1,
      actionType: "movementTemplateAction",
      uid: newUid || this.uid,
      position: this.position.toArray(),
      color: this.color,
      cellDelta: this.cellDelta.toArray()
    };
  },

  startCell: function() {
    return Geometry.getCell([this.position.x, this.position.y], this.cellSize);
  },

  endCell: function() {
    return Geometry.getCell([this.position.x + (this.cellDelta.x * this.cellSize), this.position.y + (this.cellDelta.y * this.cellSize)], this.cellSize);
  }
});


// =======================
// PathfinderRadiusTemplate
// =======================
function PathfinderRadiusTemplate(uid, board, position, color, cellRadius) {
  BaseCellTemplate.call(this, uid, board, position, color);
  this.cellRadius = cellRadius;
}

PathfinderRadiusTemplate.prototype = _.extend(PathfinderRadiusTemplate.prototype, BaseCellTemplate.prototype, {
  calculateCells: function(cellSize) {
    var centerCell = Geometry.getCell([this.position.x, this.position.y], this.cellSize);
    return Geometry.getCellsInRadius(centerCell, this.cellRadius);
  },

  clone: function(uid) {
    return new PathfinderRadiusTemplate(uid, this.board, this.position, this.color, this.cellRadius);
  },

  toAction(newUid) {
    return {
      version: 1,
      actionType: "radiusTemplateAction",
      uid: newUid || this.uid,
      position: this.position.toArray(),
      color: this.color,
      radius: this.cellRadius
    };
  },
});


// =======================
// PathfinderLineTemplate
// =======================
function PathfinderLineTemplate(uid, board, position, color, delta) {
  BaseCellTemplate.call(this, uid, board, position, color);
  this.delta = delta;
}

PathfinderLineTemplate.prototype = _.extend(PathfinderLineTemplate.prototype, BaseCellTemplate.prototype, {
  calculateCells: function(cellSize) {
    return Geometry.getCellsOnLine([this.position.x, this.position.y], [this.position.x + this.delta.x, this.position.y + this.delta.y], this.cellSize);
  },

  clone: function(uid) {
    return new PathfinderLineTemplate(uid, this.board, this.position, this.color, this.delta);
  },

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
});


// =======================
// PathfinderConeTemplate
// =======================
function PathfinderConeTemplate(uid, board, position, color, cellRadius, angle) {
  BaseCellTemplate.call(this, uid, board, position, color);
  this.cellRadius = cellRadius;
  this.angle = angle;
}

PathfinderConeTemplate.prototype = _.extend(PathfinderConeTemplate.prototype, BaseCellTemplate.prototype, {
  calculateCells: function(cellSize) {
    var intersection = Geometry.getCell([this.position.x, this.position.y], this.cellSize);
    return Geometry.getCellsInCone(intersection, this.cellRadius, this.angle);
  },

  clone: function(uid) {
    return new PathfinderConeTemplate(uid, this.board, this.position, this.color, this.cellRadius, this.angle);
  },

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
});

// =======================
// PathfinderRectangleTemplate
// =======================
function PathfinderRectangleTemplate(uid, board, position, color, cellDelta) {
  BaseCellTemplate.call(this, uid, board, position, color);
  this.cellDelta = cellDelta;
}

PathfinderRectangleTemplate.prototype = _.extend(PathfinderRectangleTemplate.prototype, BaseCellTemplate.prototype, {
  calculateCells: function(cellSize) {
    var rect = new Rectangle(new Vector2(Geometry.getCell([this.position.x, this.position.y], this.cellSize)), this.cellDelta.x, this.cellDelta.y);
    return Geometry.getCellsInRectangle(rect.topLeft().toArray(), rect.bottomRight().toArray());
  },

  clone: function(uid) {
    return new PathfinderRectangleTemplate(uid, this.board, this.position, this.color, this.cellDelta);
  },

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
});


// =======================
// PathfinderReachTemplate
// =======================
function PathfinderReachTemplate(uid, board, position, color, size, reach) {
  BaseCellTemplate.call(this, uid, board, position, color);
  this.size = size;
  this.reach = reach;
}

PathfinderReachTemplate.prototype = _.extend(PathfinderReachTemplate.prototype, BaseCellTemplate.prototype, {
  calculateCells: function(cellSize) {
    var template = Geometry.getReachCells([this.position.x, this.position.y], this.size, this.reach, this.cellSize);
    return template.threat;
  },

  clone: function(uid) {
    return new PathfinderReachTemplate(uid, this.board, this.position, this.color, this.size, this.reach);
  },

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
});