
function Tool(board) {
  this.board = board;
}
_.extend(Tool.prototype, {
  enable: function() {},
  disable: function() {},
  draw: function() {},
  setCursor: function(s) {
    $(this.board.canvas).css('cursor', s);
  },
  clearCursor: function() {
    $(this.board.canvas).css('cursor', 'auto');
  }
});

function ViewPortDragging(parentTool, board, dragEventName) {
  this.parentTool = parentTool;
  this.board = board;
  this.dragEventName = dragEventName;
  this.enabled = false;

  this.drag_mouse_start = null;
  this.drag_viewport_start = null;
}
_.extend(ViewPortDragging.prototype, {
  eventName: function(suffix) {
    return this.dragEventName + suffix + '.ViewPortDragging' + this.dragEventName;
  },
  enable: function() {
    var self = this;
    var board = this.board;
    this.enabled = true;
    $(board.event_manager).on(this.eventName('start'), function(evt, mapEvt) {
      self.drag_mouse_start = mapEvt.mousePoint;
      self.drag_viewport_start = board.viewPortCoord;
    });

    $(board.event_manager).on(this.eventName(''), function(evt, mapEvt) {
      var deltaX = Math.floor((self.drag_mouse_start[0] - mapEvt.mousePoint[0]) / board.zoom);
      var deltaY = Math.floor((self.drag_mouse_start[1] - mapEvt.mousePoint[1]) / board.zoom);

      board.viewPortCoord = [self.drag_viewport_start[0] + deltaX, self.drag_viewport_start[1] + deltaY];

      // Ensure viewport is bound to within the map
      board.setZoom(board.zoom);
    });
  },
  disable: function() {
    this.enabled = false;
    $(this.board.event_manager).off('.ViewPortDragging' + this.dragEventName);
  }
});

function GlobalShortCuts(board) {
  Tool.call(this, board);
  this.super = Tool.prototype;
  this.viewPortDragging = new ViewPortDragging(this, board, 'rightdrag');
}

GlobalShortCuts.prototype = _.extend(new Tool(), {
  enable: function() {
    var self = this;

    var scrollZoomFactor = -0.001;
    var zoomMin = 0.3;
    var zoomMax = 2.5;

    this.viewPortDragging.enable();

    $(this.board.event_manager).on('scroll.GlobalShortCuts', function(evt, mapEvt) {
      var currentZoom = self.board.zoom;
      var newZoom = currentZoom + (mapEvt.deltaY * scrollZoomFactor);
      newZoom = Math.min(zoomMax, newZoom);
      newZoom = Math.max(zoomMin, newZoom);
      self.board.setZoom(newZoom);
    });
  },
  disable: function() {
    this.viewPortDragging.disable();
    $(this.board.event_manager).off(".GlobalShortCuts");
  }
});

function Pointer(board) {
  Tool.call(this, board);
  this.super = Tool.prototype;

  this.viewPortDragging = new ViewPortDragging(this, board, 'drag');
  this.selected_template = null;
  this.dragging_template = false;
  this.template_start_cell = null;
  this.template_current_cell = null;
}

Pointer.prototype = _.extend(new Tool(), {
  enable: function() {

    var self = this;
    var board = this.board;

    this.viewPortDragging.enable();

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
        self.viewPortDragging.disable();
      }
    });

    $(board.event_manager).on('drag.Pointer', function(evt, mapEvt) {

      if (self.dragging_template) {
        self.template_current_cell = mapEvt.mapPointCell;
      }
    });

    $(board.event_manager).on('dragstop.Pointer', function(evt, mapEvt) {

      self.saveAction();

      if (!self.viewPortDragging.enabled) {
        self.viewPortDragging.enable();
      }

      self.dragging_template = false;
      self.template_start_cell = null;
      self.template_current_cell = null;
    });

    $(board.event_manager).on('keydown.Pointer', function(evt, mapEvt) {
      if (self.selected_template && (mapEvt.key == 8 || mapEvt.key == 46)) {
        var removeAction = {actionType: "removeTemplateAction", actionId: self.selected_template.uid, uid: generateActionId()};
        var restoreAction = self.selected_template.clone();
        self.board.addAction(removeAction, restoreAction, true);
        self.selected_template = null;
      }
    });
  },

  disable: function() {
    this.viewPortDragging.disable();
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

function SquarePen(board, width, color) {
  Tool.call(this, board);
  this.super = Tool.prototype;

  this.width = width;
  this.color = color;

  this.shiftDown = false;
  this.ctrlDown = false;

  this.drag_start = null;
  this.drag_current = null;
}

SquarePen.prototype = _.extend(new Tool(), {
  getPoint: function(mapPoint) {
    if (this.shiftDown) {
      return Geometry.getNearestCellIntersection(mapPoint, this.board.drawing.cellSize);
    } else if (this.ctrlDown) {
      return Geometry.getNearestCellCenter(mapPoint, this.board.drawing.cellSize);
    } else {
      return mapPoint;
    }
  },

  enable: function() {

    var self = this;
    var board = this.board;

    $(board.event_manager).on('keydown.SquarePen', function(evt, mapEvt) {
      self.shiftDown = mapEvt.isShift;
      self.ctrlDown = mapEvt.isCtrl;
    });

    $(board.event_manager).on('keyup.SquarePen', function(evt, mapEvt) {
      self.shiftDown = mapEvt.isShift;
      self.ctrlDown = mapEvt.isCtrl;
    });

    $(board.event_manager).on('dragstart.SquarePen', function(evt, mapEvt) {
      self.drag_start = self.getPoint(mapEvt.mapPoint);
    });

    $(board.event_manager).on('drag.SquarePen', function(evt, mapEvt) {
      self.drag_current = self.getPoint(mapEvt.mapPoint);
    });

    $(board.event_manager).on('dragstop.SquarePen', function(evt, mapEvt) {
      self.saveAction();

      self.drag_start = null;
      self.drag_current = null;
    });
  },

  disable: function() {
    this.saveAction();
    $(this.board.event_manager).off('.SquarePen');
  },

  draw: function() {
    if (this.drag_start && this.drag_current) {
      var topLeft = [Math.min(this.drag_start[0], this.drag_current[0]), Math.min(this.drag_start[1], this.drag_current[1])];
      var bottomRight = [Math.max(this.drag_start[0], this.drag_current[0]), Math.max(this.drag_start[1], this.drag_current[1])];

      this.board.drawing.drawSquare(topLeft, bottomRight, this.color, this.width);

      var xDist = Math.round((Math.abs(topLeft[0] - bottomRight[0]) / this.board.drawing.cellSize) * 5);
      var yDist = Math.round((Math.abs(topLeft[1] - bottomRight[1]) / this.board.drawing.cellSize) * 5);

      this.board.drawing.drawMeasureLine([topLeft[0], topLeft[1] - 30], [bottomRight[0], topLeft[1] - 30], xDist);
      this.board.drawing.drawMeasureLine([bottomRight[0] + 30, topLeft[1]], [bottomRight[0] + 30, bottomRight[1]], yDist);
    }
  },

  saveAction: function() {
    if (this.drag_start && this.drag_current) {
      var topLeft = [Math.min(this.drag_start[0], this.drag_current[0]), Math.min(this.drag_start[1], this.drag_current[1])];
      var bottomRight = [Math.max(this.drag_start[0], this.drag_current[0]), Math.max(this.drag_start[1], this.drag_current[1])];

      var action = {actionType: "squarePenAction", color: this.color, width: this.width, topLeft: topLeft, bottomRight: bottomRight, uid: generateActionId()};
      var undoAction = {actionType: "removeDrawingAction", actionId: action.uid, uid: generateActionId()};
      this.board.addAction(action, undoAction, true);
    }
  }
});

function CirclePen(board, width, color) {
  Tool.call(this, board);
  this.super = Tool.prototype;

  this.width = width;
  this.color = color;

  this.drag_start = null;
  this.drag_current = null;
}

CirclePen.prototype = _.extend(new Tool(), {
  enable: function() {

    var self = this;
    var board = this.board;

    $(board.event_manager).on('dragstart.CirclePen', function(evt, mapEvt) {
      self.drag_start = mapEvt.mapPoint;
    });

    $(board.event_manager).on('drag.CirclePen', function(evt, mapEvt) {
      self.drag_current = mapEvt.mapPoint;
    });

    $(board.event_manager).on('dragstop.CirclePen', function(evt, mapEvt) {
      self.saveAction();

      self.drag_start = null;
      self.drag_current = null;
    });
  },

  disable: function() {
    this.saveAction();
    $(this.board.event_manager).off('.CirclePen');
  },

  draw: function() {
    if (this.drag_start && this.drag_current) {
      var center = this.drag_start;
      var radius = Geometry.getDistance(this.drag_start, this.drag_current);

      this.board.drawing.drawCircle(center[0], center[1], radius, this.width, this.color);

      var pathfinderDistance = Math.round((radius / this.board.drawing.cellSize) * 5);

      this.board.drawing.drawMeasureLine(this.drag_start, this.drag_current, pathfinderDistance);
    }
  },

  saveAction: function() {
    if (this.drag_start && this.drag_current) {
      var center = this.drag_start;
      var radius = Geometry.getDistance(this.drag_start, this.drag_current);

      var action = {actionType: "circlePenAction", color: this.color, width: this.width, center: center, radius: radius, uid: generateActionId()};
      var undoAction = {actionType: "removeDrawingAction", actionId: action.uid, uid: generateActionId()};
      this.board.addAction(action, undoAction, true);
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

    var distance = Geometry.getDistance(this.previous_point, location);

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

function RadialTemplate(board, color) {
  Tool.call(this, board);
  this.super = Tool.prototype;
  this.color = color;
  this.dragging = false;
  this.center = null;
  this.radiusPoint = null;
}
RadialTemplate.prototype = _.extend(new Tool(), {
  saveAction: function() {},
  toolName: function() { return "Radial"; },
  getCells: function(centerCell, endCell, distance) { return []; },
  enable: function () {
    var board = this.board;
    var self = this;
    var cellSize = this.board.drawing.cellSize;

    $(board.event_manager).on('mousemove.' + this.toolName(), function(evt, mapEvt) {
      if (!self.dragging) {
        self.center = Geometry.getNearestCellIntersection(mapEvt.mapPoint, cellSize);
      }
    });

    $(board.event_manager).on('dragstart.' + this.toolName(), function (evt, mapEvt) {
      self.dragging = true;
    });

    $(board.event_manager).on('drag.' + this.toolName(), function (evt, mapEvt) {
      self.radiusPoint = Geometry.getNearestCellIntersection(mapEvt.mapPoint, cellSize);
    });

    $(board.event_manager).on('dragstop.' + this.toolName(), function (evt, mapEvt) {
      self.saveAction();
      self.radiusPoint = null;
      self.dragging = false;
      self.center = Geometry.getNearestCellIntersection(mapEvt.mapPoint, cellSize);
    });
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

      var template = this.getCells(centerCell, endCell, distance);
      var border = Geometry.getBorder(template, this.board.drawing.cellSize);

      this.board.drawing.drawTemplate(template, border, this.color);

      this.board.drawing.drawMeasureLine(this.center, this.radiusPoint, distance * 5);
    }
  },

  disable: function () {
    $(this.board.event_manager).off('.' + this.toolName());
  },

  drawCross: function(point) {
    var crossSize = 10;
    var lines = [
      {start: [point[0] - crossSize, point[1]], end: [point[0] + crossSize, point[1]]},
      {start: [point[0], point[1] - crossSize], end: [point[0], point[1] + crossSize]}
    ];
    this.board.drawing.drawLines("black", 3, lines);
  }
});

function RadiusTemplate(board, color) {
  RadialTemplate.call(this, board, color);
  this.super = RadialTemplate.prototype;
}
RadiusTemplate.prototype = _.extend(new RadialTemplate(), {
  toolName: function() { return "Radius"; },

  getCells: function(centerCell, endCell, distance) {
    return Geometry.getCellsInRadius(centerCell, distance);
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

function ConeTemplate(board, color) {
  RadialTemplate.call(this, board, color);
  this.super = RadialTemplate.prototype;
}
ConeTemplate.prototype = _.extend(new RadialTemplate(), {
  toolName: function() { return "Cone"; },

  getCells: function(centerCell, endCell, distance) {
    var cursorAngle = Math.atan2(this.radiusPoint[0] - this.center[0], -1 * (this.radiusPoint[1] - this.center[1])) * (180 / Math.PI);
    cursorAngle = (cursorAngle + 360 - 90) % 360;

    return Geometry.getCellsInCone(centerCell, distance, cursorAngle);
  },

  saveAction: function() {
    if (this.center && this.radiusPoint) {
      var centerCell = [this.center[0] / this.board.drawing.cellSize, this.center[1] / this.board.drawing.cellSize];
      var endCell = [this.radiusPoint[0] / this.board.drawing.cellSize, this.radiusPoint[1] / this.board.drawing.cellSize];
      var distance = Geometry.getCellDistance(centerCell, endCell);
      var cursorAngle = Math.atan2(this.radiusPoint[0] - this.center[0], -1 * (this.radiusPoint[1] - this.center[1])) * (180 / Math.PI);
      cursorAngle = (cursorAngle + 360 - 90) % 360;

      var action = {actionType: "coneTemplateAction", intersection: centerCell, radius: distance, angle: cursorAngle, color: this.color, uid: generateActionId()};
      var undoAction = {actionType: "removeTemplateAction", actionId: action.uid, uid: generateActionId()};
      this.board.addAction(action, undoAction, true);
    }
  }
});