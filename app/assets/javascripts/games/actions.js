
var actionMethods = {
  default: {
    isPersistent: false,
    isRemoval: false,
    apply: function (board) {},
    validateData: function() {},
    extend: function() { return null; },
    ensureFields: function(fieldList) {
      _.each(fieldList, function(field) {
        if (!_.has(this, field)) {
          throw new Error("Action of type " + this.actionType + " missing required field " + field);
        }
      }, this);
    },
    clone: function() {
      var clone = _.omit(this, _.functions(this));
      return clone;
    }
  },

  compositeAction: {
    apply: function(board) {
      _.each(this.actionList, function(a) {
        a.apply(board);
      }, this);
    },

    validateData: function() {
      this.ensureFields(["actionList"]);
    }
  },

  removalAction: {
    isRemoval: true,
    validateData: function() {
      this.ensureFields(["actionId", "uid"]);
    }
  },

  // An action that is managed by the drawing layer.  Requires bounds and draw methods.
  drawingAction: {
    isPersistent: true,
    apply: function(board) {
      board.drawingLayer.addAction(this);
    },

    // Returns the bounding box of the drawing action as an array of arrays as: [[LEFT, TOP], [RIGHT, BOTTOM]]
    bounds: function() {
      if (this.privateData.bounds == null) {
        this.privateData.bounds = this.calculateBounds();
      }
      return this.privateData.bounds;
    },

    calculateBounds: function() {
      return [[0,0], [1,1]];
    },

    // Given a drawing object, applies the drawing action to it
    draw: function(drawing) { }
  },

  // A pen action consists of a color, a width, and a collection of lines that are to be drawn on the drawing layer
  penAction: {
    extend: function() { return "drawingAction"; },
    draw: function(drawing) {
      drawing.drawLines(this.color, this.width, this.lines);
    },

    calculateBounds: function() {
      var l, t, r, b;
      var points = _.reduce(this.lines, function(memo, line) { memo.push(line.start); memo.push(line.end); return memo; }, []);
      _.each(points, function(p) {
        if (l == null || p[0] < l) l = p[0];
        if (t == null || p[1] < t) t = p[1];
        if (r == null || p[0] > r) r = p[0];
        if (b == null || p[1] > b) b = p[1];
      });
      return [[l, t], [r, b]];
    },

    validateData: function() {
      this.ensureFields(["color", "width", "lines", "uid"]);
    }
  },

  // An add fog action consists of a width, and a collection of lines that are to be drawn on the fog layer
  addFogPenAction: {
    extend: function() { return "drawingAction"; },
    apply: function(board) {
      board.drawingLayer.addFogAction(this);
    },
    draw: function(drawing) {
      drawing.drawLines('rgba(1, 1, 1, 1)', this.width, this.lines);
    },

    calculateBounds: function() {
      var l, t, r, b;
      var points = _.reduce(this.lines, function(memo, line) { memo.push(line.start); memo.push(line.end); return memo; }, []);
      _.each(points, function(p) {
        if (l == null || p[0] < l) l = p[0];
        if (t == null || p[1] < t) t = p[1];
        if (r == null || p[0] > r) r = p[0];
        if (b == null || p[1] > b) b = p[1];
      });
      return [[l, t], [r, b]];
    },

    validateData: function() {
      this.ensureFields(["width", "lines", "uid"]);
    }
  },

  // An remove fog action consists of a width, and a collection of lines that are to be drawn on the fog layer
  removeFogPenAction: {
    extend: function() { return "drawingAction"; },
    apply: function(board) {
      board.drawingLayer.addFogAction(this);
    },
    draw: function(drawing) {
      drawing.eraseLines(this.width, this.lines);
    },

    calculateBounds: function() {
      var l, t, r, b;
      var points = _.reduce(this.lines, function(memo, line) { memo.push(line.start); memo.push(line.end); return memo; }, []);
      _.each(points, function(p) {
        if (l == null || p[0] < l) l = p[0];
        if (t == null || p[1] < t) t = p[1];
        if (r == null || p[0] > r) r = p[0];
        if (b == null || p[1] > b) b = p[1];
      });
      return [[l, t], [r, b]];
    },

    validateData: function() {
      this.ensureFields(["width", "lines", "uid"]);
    }
  },

  // Draws a square.  Requires topLeft, bottomRight, color, and width
  squarePenAction: {
    extend: function() { return "drawingAction"; },
    draw: function(drawing) {
      drawing.drawSquare(this.topLeft, this.bottomRight, this.color, this.width);
    },

    calculateBounds: function() {
      return [this.topLeft, this.bottomRight];
    },

    validateData: function() {
      this.ensureFields(["color", "width", "topLeft", "bottomRight", "uid"]);
    }
  },

  // Draws a circle.  Requires center, radius, color, and width
  circlePenAction: {
    extend: function() { return "drawingAction"; },
    draw: function(drawing) {
      drawing.drawCircle(this.center[0], this.center[1], this.radius, this.width, this.color);
    },

    calculateBounds: function() {
      return [[this.center[0] - this.radius, this.center[1] - this.radius], [this.center[0] + this.radius, this.center[1] + this.radius]];
    },

    validateData: function() {
      this.ensureFields(["color", "width", "center", "radius", "uid"]);
    }
  },

  // Draws a straight line.  Requires start, end, color, and width
  linePenAction: {
    extend: function() { return "drawingAction"; },
    draw: function(drawing) {
      var lines = [{start: this.start, end: this.end}];
      drawing.drawLines(this.color, this.width, lines);
    },

    calculateBounds: function() {
      var t = Math.min(this.start[1], this.end[1]);
      var l = Math.min(this.start[0], this.end[0]);
      var b = Math.max(this.start[1], this.end[1]);
      var r = Math.max(this.start[0], this.end[0]);
      return [[l, t], [r, b]];
    },

    validateData: function() {
      this.ensureFields(["color", "width", "start", "end", "uid"]);
    }
  },

  // An erase action consists of a width and a collection of lines
  eraseAction: {
    extend: function() { return "drawingAction"; },
    draw: function(drawing) {
      drawing.eraseLines(this.width, this.lines);
    },

    calculateBounds: function() {
      var l, t, r, b;
      var points = _.reduce(this.lines, function(memo, line) { memo.push(line.start); memo.push(line.end); return memo; }, []);
      _.each(points, function(p) {
        if (l == null || p[0] < l) l = p[0];
        if (t == null || p[1] < t) t = p[1];
        if (r == null || p[0] > r) r = p[0];
        if (b == null || p[1] > b) b = p[1];
      });
      return [[l, t], [r, b]];
    },

    validateData: function() {
      this.ensureFields(["width", "lines", "uid"]);
    }
  },
  // References a drawing action to remove
  removeDrawingAction: {
    extend: function() { return "removalAction"; },
    apply: function(board) {
      board.drawingLayer.removeAction(this.actionId);
    }
  },

  // References a drawing action to remove
  removeFogAction: {
    extend: function() { return "removalAction"; },
    apply: function(board) {
      board.drawingLayer.removeAction(this.actionId);
    }
  },

  removeTemplateAction: {
    extend: function() { return "removalAction"; },
    apply: function(board) {
      var index = null;

      for (var x = board.template_actions.length - 1; x >= 0; x--) {
        if (board.template_actions[x].uid == this.actionId) {
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
  },

  templateAction: {
    isPersistent: true,
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
      board.drawing.drawTemplate(this.privateData.cells, this.privateData.border, this.color);
      this.drawExtras(board);
    },
    validateData: function() {
      throw "This shouldn't happen; templateAction isn't a real action";
    },
    ensureCells: function(board) {
      if (!this.privateData.cells) {
        this.privateData.cells = this.calculateCells(board);
        this.privateData.border = Geometry.getBorder(this.privateData.cells, board.drawing.cellSize);
      }
    },
    containsCell: function(board, cell) {
      this.ensureCells(board);
      return _.find(this.privateData.cells, function(c) { return c[0] == cell[0] && c[1] == cell[1]; });
    },
    getCells: function(board) {
      this.ensureCells(board);
      return this.privateData.cells;
    },
    getBorder: function(board) {
      this.ensureCells(board);
      return this.privateData.border;
    },
    clone: function() {
      var clone =  _.omit(this, _.functions(this).concat(["privateData", "isTemplate"]));
      return clone;
    }
  },

  movementTemplateAction: {
    extend: function() { return "templateAction"; },
    internalTranslateData: function(action, dx, dy, cellSize){
      action.start = [this.start[0] + dx, this.start[1] + dy];
      action.end = [this.end[0] + dx, this.end[1] + dy];
    },
    calculateCells: function(board) {
      return Geometry.getMovementPath(this.start, this.end);
    },
    drawExtras: function(board) {
      board.drawing.drawMovementLine(this.start, this.end);
    },

    validateData: function() {
      this.ensureFields(["start", "end", "color", "uid"]);
    }
  },

  radiusTemplateAction: {
    extend: function() { return "templateAction"; },
    internalTranslateData: function(action, dx, dy, cellSize){
      action.intersection = [this.intersection[0] + dx, this.intersection[1] + dy];
    },
    calculateCells: function(board) {
      return Geometry.getCellsInRadius(this.intersection, this.radius);
    },

    validateData: function() {
      this.ensureFields(["intersection", "radius", "color", "uid"]);
    }
  },

  lineTemplateAction: {
    extend: function() { return "templateAction"; },
    internalTranslateData: function(action, dx, dy, cellSize){
      action.start = [this.start[0] + (dx * cellSize), this.start[1] + (dy * cellSize)];
      action.end = [this.end[0] + (dx * cellSize), this.end[1] + (dy * cellSize)];
    },
    drawExtras: function(board) {
      var cellSize = board.drawing.cellSize;
      var startCell = Geometry.getCell(this.start, cellSize);
      var endCell = Geometry.getCell(this.end, cellSize);
      var distance = Geometry.getCellDistance(startCell, endCell) * 5;
      board.drawing.drawMeasureLine(this.start, this.end, distance);
    },
    calculateCells: function(board) {
      return Geometry.getCellsOnLine(this.start, this.end, board.drawing.cellSize);
    },

    validateData: function() {
      this.ensureFields(["start", "end", "color", "uid"]);
    }
  },

  coneTemplateAction: {
    extend: function() { return "templateAction"; },
    internalTranslateData: function(action, dx, dy, cellSize){
      action.intersection = [this.intersection[0] + dx, this.intersection[1] + dy];
    },
    calculateCells: function(board) {
      return Geometry.getCellsInCone(this.intersection, this.radius, this.angle);
    },

    validateData: function() {
      this.ensureFields(["intersection", "radius", "angle", "color", "uid"]);
    }
  },

  updateInitiativeAction: {
    isPersistent: false, // Technically this is persistent, but it's handled in a special case on the backend
    apply: function (board) {
      board.initiative.update(this.initiative);
    },
    validateData: function() {
      this.ensureFields(["uid", "initiative"]);
    }
  },

  pingAction: {
    apply: function(board) {
      board.pingLayer.add(this.point, this.color);
    },
    validateData: function() {
      this.ensureFields(["uid", "point", "color"])
    }
  }
};

// Generates random 4 digit code
function generateActionId() {
  return ("0000" + (Math.random()*Math.pow(36,4) << 0).toString(36)).substr(-4);
}

// Usually actions will either get generated from tools / User input or come over the wire
// as json.  This provides a mechanism to attach methods to those purely data-containing objects.
function attachActionMethods(action) {
  _.defaults(action, {actionType: "default"});

  if (!_.has(actionMethods, action.actionType)) {
    throw new Error("Unknown Action Type: " + action.actionType);
  }

  // Apply action specific methods
  _.extend(action, actionMethods[action.actionType]);

  // Apply any extend methods
  if (action.extend) {
    _.defaults(action, actionMethods[action.extend()]);
  }

  // Apply any defaults not overridden by action methods
  _.defaults(action, actionMethods.default);

  // Attach a new privateData object
  action.privateData = {};

  // Validate action data
  action.validateData();

  // Extra Special Magic Case
  if (action.actionType == "compositeAction") {
    _.each(action.actionList, function(a) { attachActionMethods(a);});
  }

  return action;
}