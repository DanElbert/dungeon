
function Tool(board) {
  this.board = board;
}
_.extend(Tool.prototype, {
  enable: function() {},
  disable: function() {},
  draw: function() {},
  getDistance: function(p1, p2) {
    return Geometry.getDistance(p1, p2);
  },
  setCursor: function(s) {
    $(this.board.canvas).css('cursor', s);
  },
  clearCursor: function() {
    $(this.board.canvas).css('cursor', 'auto');
  }
});


function Pointer(board) {
  Tool.call(this, board);
  this.super = Tool.prototype;

  this.drag_mouse_start = null;
  this.drag_viewport_start = null;
  this.selected_template = null;
  this.dragging_template = false;
  this.template_start_cell = null;
  this.template_current_cell = null;
}

Pointer.prototype = _.extend(new Tool(), {
  enable: function() {

    var self = this;
    var board = this.board;

    $(board.event_manager).on('click.Pointer', function(evt, mapEvt) {

      self.selected_template = null;

      for (var x = board.template_actions.length - 1; x >= 0; x--) {
        var action = board.template_actions[x];
        if (action.isTemplate && action.containsCell(board, mapEvt.mapPointCell)) {
          self.selected_template = action;
          break;
        }
      }
    });

    $(board.event_manager).on('dragstart.Pointer', function(evt, mapEvt) {
      if (self.selected_template && self.selected_template.containsCell(self.board, mapEvt.mapPointCell)) {
        self.dragging_template = true;
        self.template_start_cell = mapEvt.mapPointCell;
      } else {
        self.drag_mouse_start = mapEvt.mousePoint;
        self.drag_viewport_start = board.viewPortCoord;
      }

    });

    $(board.event_manager).on('drag.Pointer', function(evt, mapEvt) {

      if (self.dragging_template) {
        self.template_current_cell = mapEvt.mapPointCell;
      } else {
        var deltaX = Math.floor((self.drag_mouse_start[0] - mapEvt.mousePoint[0]) / board.zoom);
        var deltaY = Math.floor((self.drag_mouse_start[1] - mapEvt.mousePoint[1]) / board.zoom);

        board.viewPortCoord = [self.drag_viewport_start[0] + deltaX, self.drag_viewport_start[1] + deltaY];

        // Ensure viewport is bound to within the map
        board.setZoom(board.zoom);
      }
    });

    $(board.event_manager).on('dragstop.Pointer', function(evt, mapEvt) {

      self.saveAction();

      self.dragging_template = false;
      self.template_start_cell = null;
      self.template_current_cell = null;
    });
  },

  disable: function() {
    $(this.board.event_manager).off(".Pointer");
  },

  draw: function() {

    var border = null;

    if (this.dragging_template) {
      var dx = this.template_current_cell[0] - this.template_start_cell[0];
      var dy = this.template_current_cell[1] - this.template_start_cell[1];
      var cellSize = this.board.drawing.cellSize;

      border = _.map(this.selected_template.getBorder(this.board), function(line) {
        return {
          start: [line.start[0] + dx * cellSize, line.start[1] + dy * cellSize],
          end: [line.end[0] + dx * cellSize, line.end[1] + dy * cellSize]
        }
      });
    } else if (this.selected_template) {
      border = this.selected_template.getBorder(this.board);
    }

    if (border) {
      this.board.drawing.drawLines("white", 6, border);
    }
  },

  saveAction: function() {
    if (this.dragging_template) {
      var dx = this.template_current_cell[0] - this.template_start_cell[0];
      var dy = this.template_current_cell[1] - this.template_start_cell[1];

      var removeAction = {actionType: "removeTemplateAction", actionId: this.selected_template.uid, uid: generateActionId()};
      var addAction = this.selected_template.cloneAndTranslate(dx, dy);

      var restoreAction = this.selected_template.clone();
      var undoAction = {actionType: "removeTemplateAction", actionId: addAction.uid, uid: generateActionId()};

      this.board.addAction(
          {actionType: "compositeAction", actionList: [removeAction, addAction]},
          {actionType: "compositeAction", actionList: [undoAction, restoreAction]},
          true);

      this.selected_template = null;
    }
  }
});

function DrawTool(board) {
  Tool.call(this, board);
  this.super = Tool.prototype;

  this.lineBuffer = [];
  this.previous_point = null;
  this.cursor = null;
}
DrawTool.prototype = _.extend(new Tool(), {
  eventNamespace: function() { return "Drawing"; },
  minimumLineDistance: function() { return 0; },
  saveAction: function() { },
  handleMouseMove: function(location) {
    if (this.previous_point == null) {
      this.previous_point = location;
    }

    var distance = this.getDistance(this.previous_point, location);

    if (distance >= this.minimumLineDistance()) {
      this.lineBuffer.push({start: this.previous_point, end: location});
      this.previous_point = location;
    }
  },
  enable: function() {
    var self = this;
    $(this.board.event_manager).on('dragstart.' + this.eventNamespace(), function(evt, mapEvt) {
      self.previous_point = null;
      self.handleMouseMove(mapEvt.mapPoint);
    });

    $(this.board.event_manager).on('mousemove.' + this.eventNamespace(), function(evt, mapEvt) {
      self.cursor = mapEvt.mapPoint;
    });

    $(this.board.event_manager).on('drag.' + this.eventNamespace(), function(evt, mapEvt) {
      self.handleMouseMove(mapEvt.mapPoint);
    });

    $(this.board.event_manager).on('dragstop.' + this.eventNamespace(), function(evt, mapEvt) {
      self.saveAction();
      self.lineBuffer = [];
    });
  },

  disable: function() {
    this.saveAction();
    this.lineBuffer = [];
    $(this.board.event_manager).off("." + this.eventNamespace());
  }
});

function Pen(board, width, color) {
  DrawTool.call(this, board);
  this.super = DrawTool.prototype;
  this.width = width;
  this.color = color;
}

Pen.prototype = _.extend(new DrawTool(), {
  minimumLineDistance: function() { return this.width / 2; },
  eventNamespace: function() { return "Pen"; },
  draw: function() {
    this.board.drawing.drawLines(this.color, this.width, this.lineBuffer);
  },
  saveAction: function() {
    if (this.lineBuffer.length > 0) {
      var action = {actionType: "penAction", color: this.color, width: this.width, lines: this.lineBuffer, uid: generateActionId()};
      var undoAction = {actionType: "removeDrawingAction", actionId: action.uid, uid: generateActionId()};
      this.board.addAction(action, undoAction, true);
    }
  }
});

function Eraser(board, width) {
  DrawTool.call(this, board);
  this.super = DrawTool.prototype;
  this.width = width;
}

Eraser.prototype = _.extend(new DrawTool(), {
  minimumLineDistance: function() { return 0; },
  eventNamespace: function() { return "Eraser"; },
  enable: function() {
    this.super.enable.apply(this);
    this.setCursor('none');
    var self = this;
    $(this.board.event_manager).bind('click.' + this.eventNamespace(), function(evt, mapEvt) {
      self.previous_point = null;
      self.handleMouseMove(mapEvt.mapPoint);
      self.saveAction();
      self.lineBuffer = [];
    });
  },
  disable: function() {
    this.super.disable.apply(this);
    this.clearCursor();
  },
  draw: function() {

    var cursorColor = "#FFFFFF";

    if (this.lineBuffer.length > 0) {
      this.board.drawing.eraseLines(this.width, this.lineBuffer);
      cursorColor = "#000000";
    }

    if (this.cursor) {
      this.board.drawing.drawCircle(this.cursor[0], this.cursor[1], this.width / 2, 2, cursorColor)
    }
  },
  saveAction: function() {
    if (this.lineBuffer.length > 0) {
      var action = {actionType: "eraseAction", width: this.width, lines: this.lineBuffer, uid: generateActionId()};
      var undoAction = {actionType: "removeDrawingAction", actionId: action.uid, uid: generateActionId()};
      this.board.addAction(action, undoAction, true);
    }
  }
});

function Measure(board, color) {
  Tool.call(this, board);
  this.super = Tool.prototype;
  this.color = color;
  this.startCell = null;
  this.currentCell = null;
}
Measure.prototype = _.extend(new Tool(), {
  enable: function () {
    var board = this.board;
    var self = this;
    $(board.event_manager).on('dragstart.Measure', function (evt, mapEvt) {
      self.startCell = mapEvt.mapPointCell;
    });

    $(board.event_manager).on('drag.Measure', function (evt, mapEvt) {
      self.currentCell = mapEvt.mapPointCell;
    });

    $(board.event_manager).on('dragstop.Measure', function (evt, mapEvt) {
      self.saveAction();
      self.startCell = null;
      self.currentCell = null;
    });
  },

  disable: function () {
    $(this.board.event_manager).off(".Measure");
  },

  draw: function() {
    if (this.startCell && this.currentCell) {
      if (this.startCell[0] == this.currentCell[0] && this.startCell[1] == this.currentCell[1]) {
        return;
      }

      var template = Geometry.getMovementPath(this.startCell, this.currentCell);
      var border = Geometry.getBorder(template, this.board.drawing.cellSize);

      this.board.drawing.drawTemplate(template, border, this.color);
      this.board.drawing.drawMovementLine(this.startCell, this.currentCell);
    }
  },

  saveAction: function() {
    if (this.startCell && this.currentCell) {
      var action = {actionType: "movementTemplateAction", start: this.startCell, end: this.currentCell, color: this.color, uid: generateActionId()};
      var undoAction = {actionType: "removeTemplateAction", actionId: action.uid, uid: generateActionId()};
      this.board.addAction(action, undoAction, true);
    }
  }
});

function RadiusTemplate(board, color) {
  Tool.call(this, board);
  this.super = Tool.prototype;
  this.color = color;
  this.dragging = false;
  this.center = null;
  this.radiusPoint = null;
}
RadiusTemplate.prototype = _.extend(new Tool(), {
  enable: function () {
    var board = this.board;
    var self = this;
    var cellSize = this.board.drawing.cellSize;

    $(board.event_manager).on('mousemove.RadiusTemplate', function(evt, mapEvt) {
      if (!self.dragging) {
        self.center = Geometry.getNearestCellIntersection(mapEvt.mapPoint, cellSize);
      }
    });

    $(board.event_manager).on('dragstart.RadiusTemplate', function (evt, mapEvt) {
      self.dragging = true;
    });

    $(board.event_manager).on('drag.RadiusTemplate', function (evt, mapEvt) {
      self.radiusPoint = Geometry.getNearestCellIntersection(mapEvt.mapPoint, cellSize);
    });

    $(board.event_manager).on('dragstop.RadiusTemplate', function (evt, mapEvt) {
      self.saveAction();
      self.radiusPoint = null;
      self.dragging = false;
      self.center = Geometry.getNearestCellIntersection(mapEvt.mapPoint, cellSize);
    });
  },

  disable: function () {
    $(this.board.event_manager).off(".RadiusTemplate");
  },

  drawCross: function(point) {
    var crossSize = 10;
    var lines = [
      {start: [point[0] - crossSize, point[1]], end: [point[0] + crossSize, point[1]]},
      {start: [point[0], point[1] - crossSize], end: [point[0], point[1] + crossSize]}
    ];
    this.board.drawing.drawLines("black", 3, lines);
  },

  draw: function() {

    if (this.center) {
      this.drawCross(this.center);
    }

    if (this.radiusPoint) {
      this.drawCross(this.radiusPoint);
    }

    if (this.center && this.radiusPoint) {
      var centerCell = [this.center[0] / this.board.drawing.cellSize, this.center[1] / this.board.drawing.cellSize];
      var endCell = [this.radiusPoint[0] / this.board.drawing.cellSize, this.radiusPoint[1] / this.board.drawing.cellSize];
      var distance = Geometry.getCellDistance(centerCell, endCell);

      var template = Geometry.getCellsInRadius(centerCell, distance);
      var border = Geometry.getBorder(template, this.board.drawing.cellSize);

      this.board.drawing.drawTemplate(template, border, this.color);

      this.board.drawing.drawMeasureLine(this.center, this.radiusPoint, distance * 5);
    }
  },

  saveAction: function() {
    if (this.center && this.radiusPoint) {
      var centerCell = [this.center[0] / this.board.drawing.cellSize, this.center[1] / this.board.drawing.cellSize];
      var endCell = [this.radiusPoint[0] / this.board.drawing.cellSize, this.radiusPoint[1] / this.board.drawing.cellSize];
      var distance = Geometry.getCellDistance(centerCell, endCell);

      var action = {actionType: "radiusTemplateAction", intersection: centerCell, radius: distance, color: this.color, uid: generateActionId()};
      var undoAction = {actionType: "removeTemplateAction", actionId: action.uid, uid: generateActionId()};
      this.board.addAction(action, undoAction, true);
    }
  }
});