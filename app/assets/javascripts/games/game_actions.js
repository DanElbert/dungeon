var RemovalAction = createActionType("RemovalAction", Action, {
  isRemoval: function() { return true; },
  validateData: function() {
    this.ensureFields(["actionId", "uid"]);
  }
});


// An action that is managed by the drawing layer.  Requires bounds and draw methods.
var DrawingAction = createActionType("DrawingAction", Action, {
  isPersistent: function() { return true; },
  apply: function(board) {
    board.drawingLayer.addAction(this);
  },

  // Returns the bounding box of the drawing action as an array of arrays as: [[LEFT, TOP], [RIGHT, BOTTOM]]
  bounds: function() {
    if (this.boundData == null) {
      this.boundData = this.calculateBounds();
    }
    return this.boundData;
  },

  calculateBounds: function() {
    return [[0,0], [1,1]];
  },

  // Given a drawing object, applies the drawing action to it
  draw: function(drawing) { }
});


var LineCollectionAction = createActionType("LineCollectionAction", DrawingAction, {
  calculateBounds: function() {
    var l, t, r, b;
    var margin = this.properties.width / 2;
    var points = _.reduce(this.properties.lines, function(memo, line) { memo.push(line.start); memo.push(line.end); return memo; }, []);
    _.each(points, function(p) {
      if (l == null || p[0] < l) l = p[0];
      if (t == null || p[1] < t) t = p[1];
      if (r == null || p[0] > r) r = p[0];
      if (b == null || p[1] > b) b = p[1];
    });
    return [[l - margin, t - margin], [r + margin, b + margin]];
  }
});


var TemplateAction = createActionType("TemplateAction", Action, {
  isPersistent: function() { return true; },
  isTemplate: true,
  calculateCells: function() { return []; },
  drawExtras: function(board) { },
  internalTranslateData: function(action, dx, dy, cellSize){},
  cloneAndTranslate: function(dx, dy, cellSize) {
    var clone = this.clone();
    this.internalTranslateData(clone, dx, dy, cellSize);
    return clone;
  },
  apply: function(board) {
    board.template_actions.push(this);
    this.ensureCells(board);
    board.drawing.drawTemplate(this.cells, this.border, this.properties.color);
    this.drawExtras(board);
  },
  validateData: function() {
    throw "This shouldn't happen; templateAction isn't a real action";
  },
  ensureCells: function(board) {
    if (!this.cells) {
      this.cells = this.calculateCells(board);
      this.border = Geometry.getBorder(this.cells, board.drawing.cellSize);
    }
  },
  containsCell: function(board, cell) {
    this.ensureCells(board);
    return _.find(this.cells, function(c) { return c[0] == cell[0] && c[1] == cell[1]; });
  },
  getCells: function(board) {
    this.ensureCells(board);
    return this.cells;
  },
  getBorder: function(board) {
    this.ensureCells(board);
    return this.border;
  }
});


_.extend(actionTypes, {
  labelAction: createActionType("LabelAction", DrawingAction, {
    draw: function(drawing) {
      drawing.drawLabel(this.properties.point, this.properties.text, this.properties.color, "rgba(0, 0, 0, 0.5)", "rgba(255, 255, 255, 0.25");
    },
    calculateBounds: function() {
      return this.properties.bound;
    },
    validateData: function() {
      this.ensureFields(["color", "text", "point", "bound", "uid"]);
    }
  }),

  // A pen action consists of a color, a width, and a collection of lines that are to be drawn on the drawing layer
  penAction: createActionType("PenAction", LineCollectionAction, {
    draw: function(drawing) {
      drawing.drawLines(this.properties.color, this.properties.width, this.properties.lines);
    },

    validateData: function() {
      this.ensureFields(["color", "width", "lines", "uid"]);
    }
  }),

  addFogPenAction: createActionType("AddFogPenAction", LineCollectionAction, {
    apply: function(board) {
      board.drawingLayer.addFogAction(this);
    },
    draw: function(drawing) {
      drawing.drawLines('rgba(1, 1, 1, 1)', this.properties.width, this.properties.lines);
    },
    validateData: function() {
      this.ensureFields(["width", "lines", "uid"]);
    }
  }),

  // An remove fog action consists of a width, and a collection of lines that are to be drawn on the fog layer
  removeFogPenAction: createActionType("RemoveFogPenAction", LineCollectionAction, {
    apply: function(board) {
      board.drawingLayer.addFogAction(this);
    },
    draw: function(drawing) {
      drawing.eraseLines(this.properties.width, this.properties.lines);
    },
    validateData: function() {
      this.ensureFields(["width", "lines", "uid"]);
    }
  }),

  // Draws a square.  Requires topLeft, bottomRight, color, and width
  squarePenAction: createActionType("SquarePenAction", DrawingAction, {
    initialize: function(actionData) {
      this.super.initialize.apply(this, arguments);
    },
    draw: function(drawing) {
      drawing.drawSquare(this.properties.topLeft, this.properties.bottomRight, this.properties.color, this.properties.backgroundColor, this.properties.width);
    },

    calculateBounds: function() {
      var margin = parseInt(this.properties.width / 2);
      return [[this.properties.topLeft[0] - margin, this.properties.topLeft[1] - margin], [this.properties.bottomRight[0] + margin, this.properties.bottomRight[1] + margin]];
    },

    validateData: function() {
      this.ensureFields(["color", "width", "topLeft", "bottomRight", "uid"]);
    }
  }),

  // Draws a circle.  Requires center, radius, color, and width
  circlePenAction: createActionType("CirclePenAction", DrawingAction, {
    draw: function(drawing) {
      drawing.drawCircle(this.properties.center[0], this.properties.center[1], this.properties.radius, this.properties.width, this.properties.color, this.properties.backgroundColor);
    },

    calculateBounds: function() {
      var center = this.properties.center;
      var radius = this.properties.radius + parseInt(this.properties.width / 2);
      return [[center[0] - radius, center[1] - radius], [center[0] + radius, center[1] + radius]];
    },

    validateData: function() {
      this.ensureFields(["color", "width", "center", "radius", "uid"]);
    }
  }),

  // Draws a straight line.  Requires start, end, color, and width
  linePenAction: createActionType("LinePenAction", DrawingAction, {
    draw: function(drawing) {
      var lines = [{start: this.properties.start, end: this.properties.end}];
      drawing.drawLines(this.properties.color, this.properties.width, lines);
    },

    calculateBounds: function() {
      var start = this.properties.start;
      var end = this.properties.end;
      var margin = parseInt(this.properties.width / 2);
      var t = Math.min(start[1], end[1]);
      var l = Math.min(start[0], end[0]);
      var b = Math.max(start[1], end[1]);
      var r = Math.max(start[0], end[0]);
      return [[l - margin, t - margin], [r + margin, b + margin]];
    },

    validateData: function() {
      this.ensureFields(["color", "width", "start", "end", "uid"]);
    }
  }),

  pasteAction: createActionType("PasteAction", DrawingAction, {
    draw: function(drawing) {
      drawing.drawImage(this.properties.topLeft[0], this.properties.topLeft[1], this.properties.url)
    },

    calculateBounds: function() {
      var topLeft = this.properties.topLeft;
      return [topLeft, [topLeft[0] + this.properties.width, topLeft[1] + this.properties.height]];
    },

    validateData: function() {
      this.ensureFields(["uid", "url", "topLeft", "width", "height"]);
    }
  }),

  // An erase action consists of a width and a collection of lines
  eraseAction: createActionType("EraseAction", LineCollectionAction, {
    draw: function(drawing) {
      drawing.eraseLines(this.properties.width, this.properties.lines);
    },

    validateData: function() {
      this.ensureFields(["width", "lines", "uid"]);
    }
  }),

  // References a drawing action to remove
  removeDrawingAction: createActionType("RemoveDrawingAction", RemovalAction, {
    apply: function(board) {
      board.drawingLayer.removeAction(this.properties.actionId);
    }
  }),

  // References a drawing action to remove
  removeFogAction: createActionType("RemoveFogAction", RemovalAction, {
    apply: function(board) {
      board.drawingLayer.removeAction(this.properties.actionId);
    }
  }),

  removeTemplateAction: createActionType("RemoveTemplateAction", RemovalAction, {
    apply: function(board) {
      var index = null;

      for (var x = board.template_actions.length - 1; x >= 0; x--) {
        if (board.template_actions[x].uid == this.properties.actionId) {
          index = x;
          break;
        }
      }

      if (index != null) {
        if (index == 0) {
          board.template_actions.shift();
        } else {
          board.template_actions.splice(index, 1);
        }
      }
    }
  }),

  movementTemplateAction: createActionType("MovementTemplateAction", TemplateAction, {
    internalTranslateData: function(action, dx, dy, cellSize){
      action.properties.start = [this.properties.start[0] + dx, this.properties.start[1] + dy];
      action.properties.end = [this.properties.end[0] + dx, this.properties.end[1] + dy];
    },
    calculateCells: function(board) {
      return Geometry.getMovementPath(this.properties.start, this.properties.end);
    },
    drawExtras: function(board) {
      board.drawing.drawMovementLine(this.properties.start, this.properties.end);
    },

    validateData: function() {
      this.ensureFields(["start", "end", "color", "uid"]);
    }
  }),

  radiusTemplateAction: createActionType("RadiusTemplateAction", TemplateAction, {
    internalTranslateData: function(action, dx, dy, cellSize){
      action.properties.intersection = [this.properties.intersection[0] + dx, this.properties.intersection[1] + dy];
    },
    calculateCells: function(board) {
      return Geometry.getCellsInRadius(this.properties.intersection, this.properties.radius);
    },

    validateData: function() {
      this.ensureFields(["intersection", "radius", "color", "uid"]);
    }
  }),

  lineTemplateAction: createActionType("LineTemplateAction", TemplateAction, {
    internalTranslateData: function(action, dx, dy, cellSize){
      action.properties.start = [this.properties.start[0] + (dx * cellSize), this.properties.start[1] + (dy * cellSize)];
      action.properties.end = [this.properties.end[0] + (dx * cellSize), this.properties.end[1] + (dy * cellSize)];
    },
    drawExtras: function(board) {
      var cellSize = board.drawing.cellSize;
      var startCell = Geometry.getCell(this.properties.start, cellSize);
      var endCell = Geometry.getCell(this.properties.end, cellSize);
      var distance = Geometry.getCellDistance(startCell, endCell) * 5;
      board.drawing.drawMeasureLine(this.properties.start, this.properties.end, distance);
    },
    calculateCells: function(board) {
      return Geometry.getCellsOnLine(this.properties.start, this.properties.end, board.drawing.cellSize);
    },

    validateData: function() {
      this.ensureFields(["start", "end", "color", "uid"]);
    }
  }),

  coneTemplateAction: createActionType("ConeTemplateAction", TemplateAction, {
    internalTranslateData: function(action, dx, dy, cellSize){
      action.properties.intersection = [this.properties.intersection[0] + dx, this.properties.intersection[1] + dy];
    },
    calculateCells: function(board) {
      return Geometry.getCellsInCone(this.properties.intersection, this.properties.radius, this.properties.angle);
    },

    validateData: function() {
      this.ensureFields(["intersection", "radius", "angle", "color", "uid"]);
    }
  }),

  rectangleTemplateAction: createActionType("RectangleTemplateAction", TemplateAction, {
    internalTranslateData: function(action, dx, dy, cellSize){
      action.properties.topLeft = [this.properties.topLeft[0] + dx, this.properties.topLeft[1] + dy];
      action.properties.bottomRight = [this.properties.bottomRight[0] + dx, this.properties.bottomRight[1] + dy];
    },
    calculateCells: function(board) {
      return Geometry.getCellsInRectangle(this.properties.topLeft, this.properties.bottomRight);
    },

    validateData: function() {
      this.ensureFields(["topLeft", "bottomRight", "color", "uid"]);
    }
  }),

  reachTemplateAction: createActionType("ReachTemplateAction", TemplateAction, {
    internalTranslateData: function(action, dx, dy, cellSize){
      action.properties.anchor = [this.properties.anchor[0] + dx, this.properties.anchor[1] + dy];
    },
    calculateCells: function(board) {
      var template = Geometry.getReachCells(this.properties.anchor, this.properties.size, this.properties.reach, board.drawing.cellSize);
      return template.threat;
    },

    validateData: function() {
      this.ensureFields(["anchor", "size", "reach", "color", "uid"]);
    }
  }),

  pingAction: createActionType("PingAction", Action, {
    apply: function(board) {
      board.pingLayer.add(this.properties.point, this.properties.color);
    },
    validateData: function() {
      this.ensureFields(["uid", "point", "color"])
    }
  }),

  setTokensAction: createActionType("SetTokensAction", Action, {
    isPersistent: function() { return true; },
    apply: function(board) {
      board.tokenLayer.setTokens(this.properties.tokens);
    },
    validateData: function() {
      this.ensureFields(["uid", "tokens"]);
    }
  }),

  clearTokensAction: createActionType("ClearTokensAction", Action, {
    isPersistent: function() { return true; },
    apply: function(board) {
      board.tokenLayer.clearTokens();
      //board.toolBars.hideClearTokensButton();
    },
    validateData: function() {
      this.ensureFields(["uid"]);
    }
  })
});

