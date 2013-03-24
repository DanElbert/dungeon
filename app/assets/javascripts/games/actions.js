
var actionMethods = {
  default: {
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

  // A pen action consists of a color, a width, and a collection of lines that are to be drawn on the drawing layer
  penAction: {
    apply: function(board) {
      board.drawing_actions.push(this);
      board.drawingDrawing.drawLines(this.color, this.width, this.lines);
    },

    validateData: function() {
      this.ensureFields(["color", "width", "lines", "uid"]);
    }
  },

  // Draws a square.  Requires topLeft, bottomRight, color, and width
  squarePenAction: {
    apply: function(board) {
      board.drawing_actions.push(this);
      board.drawingDrawing.drawSquare(this.topLeft, this.bottomRight, this.color, this.width);
    },

    validateData: function() {
      this.ensureFields(["color", "width", "topLeft", "bottomRight", "uid"]);
    }
  },

  // Draws a circle.  Requires center, radius, color, and width
  circlePenAction: {
    apply: function(board) {
      board.drawing_actions.push(this);
      board.drawingDrawing.drawCircle(this.center[0], this.center[1], this.radius, this.width, this.color);
    },

    validateData: function() {
      this.ensureFields(["color", "width", "center", "radius", "uid"]);
    }
  },

  // An erase action consists of a width and a collection of lines
  eraseAction: {
    apply: function(board) {
      board.drawing_actions.push(this);
      board.drawingDrawing.eraseLines(this.width, this.lines);
    },

    validateData: function() {
      this.ensureFields(["width", "lines", "uid"]);
    }
  },
  // References a drawing action to remove
  removeDrawingAction: {
    apply: function(board) {
      var index = null;

      for (var x = board.drawing_actions.length - 1; x >= 0; x--) {
        if (board.drawing_actions[x].uid == this.actionId) {
          index = x;
          break;
        }
      }

      if (index != null) {
        if (index == 0) {
          board.drawing_actions.shift();
        } else {
          board.drawing_actions.splice(index, 1);
        }
        board.regenerateDrawing();
      }

    },

    validateData: function() {
      this.ensureFields(["actionId", "uid"]);
    }
  },

  removeTemplateAction: {
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
    },

    validateData: function() {
      this.ensureFields(["actionId", "uid"]);
    }
  },

  templateAction: {
    isTemplate: true,
    calculateCells: function() { return []; },
    drawExtras: function(board) { },
    internalTranslateData: function(action, dx, dy){},
    cloneAndTranslate: function(dx, dy) {
      var clone = this.clone();
      this.internalTranslateData(clone, dx, dy);
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
        this.privateData.cells = this.calculateCells();
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
    internalTranslateData: function(action, dx, dy){
      action.start = [this.start[0] + dx, this.start[1] + dy];
      action.end = [this.end[0] + dx, this.end[1] + dy];
    },
    calculateCells: function() {
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
    internalTranslateData: function(action, dx, dy){
      action.intersection = [this.intersection[0] + dx, this.intersection[1] + dy];
    },
    calculateCells: function() {
      return Geometry.getCellsInRadius(this.intersection, this.radius);
    },

    validateData: function() {
      this.ensureFields(["intersection", "radius", "color", "uid"]);
    }
  },

  lineTemplateAction: {
    extend: function() { return "templateAction"; },
    internalTranslateData: function(action, dx, dy){},
    calculateCells: function() {

    },

    validateData: function() {
      this.ensureFields(["start", "end", "color", "uid"]);
    }
  },

  coneTemplateAction: {
    extend: function() { return "templateAction"; },
    internalTranslateData: function(action, dx, dy){
      action.intersection = [this.intersection[0] + dx, this.intersection[1] + dy];
    },
    calculateCells: function() {
      return Geometry.getCellsInCone(this.intersection, this.radius, this.angle);
    },

    validateData: function() {
      this.ensureFields(["intersection", "radius", "angle", "color", "uid"]);
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