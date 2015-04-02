
var SHARED_TOOL_OPTIONS= {
  drawingColor: {type: "color", label: "Color", name: "color", value: "#000000"},
  drawingBackgroundColor: {type: "color", label: "Background Color", name: "backgroundColor", includeClear: true, value: null},
  drawingWidth: {type: "size", name: "width", label: "Width", sizes: [3, 5, 7, 10, 15, 20], value: 7 },
  fogWidth: {type: "size", name: "width", label: "Width", sizes: [25, 75, 100, 200, 500], value: 75 },
  templateColor: {type: "color", name: "color", label: "Color", value: "#EE204D"}
};

function ToolOptions() {
  this.sorted = [];
  this.indexed = {};
}

_.extend(ToolOptions.prototype, {
  add: function(option) {
    if (!option.name)
      throw "Options must have names";

    this.indexed[option.name] = option;
    this.sorted.push(option);
  },

  get: function(name) {
    return this.indexed[name];
  },

  each: function(iterator, context) {
    _.each(this.sorted, iterator, context);
  }
});

function Tool(board) {
  this.board = board;
  this.options = new ToolOptions();
  this.buildOptions();
  this.optionsChanged();
  var self = this;
  $(this.options).on('changed', function(e) {
    self.optionsChanged();
  });
}
_.extend(Tool.prototype, {
  enable: function() {},
  disable: function() {},
  getOptions: function() { return this.options; },
  optionsChanged: function() {},
  buildOptions: function() {},
  draw: function() {},
  roundPoint: function(p) {
    return [p[0]>>0, p[1]>>0];
  },
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
    var scaleZoomFactor = 0.5;

    this.viewPortDragging.enable();

    $(this.board.event_manager).on('pinchstart.GlobalShortCuts', function(evt, mapEvt) {
      self.originalZoom = self.board.zoom;
    });

    $(this.board.event_manager).on('pinch.GlobalShortCuts', function(evt, mapEvt) {
      var scale = ((mapEvt.scale - 1) * scaleZoomFactor) + 1;
      var newZoom = self.originalZoom * scale;
      self.board.setZoom(newZoom, mapEvt.center);
      self.board.toolBars.setZoom(newZoom);
    });

    $(this.board.event_manager).on('scroll.GlobalShortCuts', function(evt, mapEvt) {
      var currentZoom = self.board.zoom;
      var newZoom = currentZoom + (mapEvt.deltaY * scrollZoomFactor);
      self.board.setZoom(newZoom, mapEvt.mapPoint);
      self.board.toolBars.setZoom(newZoom);
    });

    $(this.board.event_manager).on('keydown.GlobalShortCuts', function(evt, mapEvt) {
      if (mapEvt.key == 90 && mapEvt.isCtrl) {
        // ctrl-z
        self.board.undo();
      }
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
        self.removeTemplate(self.selected_template);
        self.selected_template = null;
      }
    });

    $(board.event_manager).on('hold.Pointer', function(evt, mapEvt) {
      if (self.selected_template && self.selected_template.containsCell(self.board, mapEvt.mapPointCell)) {
        self.removeTemplate(self.selected_template);
        self.selected_template = null;
      }
    });
  },

  removeTemplate: function(template) {
    var removeAction = {actionType: "removeTemplateAction", actionId: template.uid, uid: generateActionId()};
    var restoreAction = template.clone();
    this.board.addAction(removeAction, restoreAction, true);
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
      var addAction = this.selected_template.cloneAndTranslate(dx, dy, this.board.drawing.cellSize).serialize();

      var restoreAction = this.selected_template.clone().serialize();
      var undoAction = {actionType: "removeTemplateAction", actionId: addAction.uid, uid: generateActionId()};

      this.board.addAction(
          {actionType: "compositeAction", actionList: [removeAction, addAction]},
          {actionType: "compositeAction", actionList: [undoAction, restoreAction]},
          true);

      this.selected_template = null;
    }
  }
});

function ShapePen(board) {
  Tool.call(this, board);
  this.super = Tool.prototype;

  this.width = null;
  this.color = null;
  this.backgroundColor = null;

  this.shiftDown = false;
  this.ctrlDown = false;

  this.drag_start = null;
  this.drag_current = null;
  this.cursor = null;
}

ShapePen.prototype = _.extend(new Tool(), {
  buildOptions: function() {
    this.options.add(SHARED_TOOL_OPTIONS.drawingColor);
    this.options.add(SHARED_TOOL_OPTIONS.drawingBackgroundColor);
    this.options.add(SHARED_TOOL_OPTIONS.drawingWidth);
  },

  optionsChanged: function() {
    this.width = this.options.get("width").value;
    this.color = this.options.get("color").value;
    if (this.options.get("backgroundColor")) {
      this.backgroundColor = this.options.get("backgroundColor").value;
    }
  },

  getPoint: function(mapPoint) {
    if (this.shiftDown && this.ctrlDown) {
      return Geometry.getNearestHalfCellSnap(mapPoint, this.board.drawing.cellSize);
    } else if (this.shiftDown) {
      return Geometry.getNearestCellIntersection(mapPoint, this.board.drawing.cellSize);
    } else if (this.ctrlDown) {
      return Geometry.getNearestCellCenter(mapPoint, this.board.drawing.cellSize);
    } else {
      return mapPoint;
    }
  },

  eventNamespace: function() {
    return "ShapePen";
  },

  enable: function() {

    var self = this;
    var board = this.board;

    $(board.event_manager).on('keydown.' + this.eventNamespace(), function(evt, mapEvt) {
      self.shiftDown = mapEvt.isShift;
      self.ctrlDown = mapEvt.isCtrl;
      self.cursor = self.getPoint(self.cursor);
    });

    $(board.event_manager).on('keyup.' + this.eventNamespace(), function(evt, mapEvt) {
      self.shiftDown = mapEvt.isShift;
      self.ctrlDown = mapEvt.isCtrl;
      self.cursor = self.getPoint(self.cursor);
    });

    $(board.event_manager).on('mousemove.' + this.eventNamespace(), function(evt, mapEvt) {
      self.cursor = self.getPoint(mapEvt.mapPoint);
    });

    $(board.event_manager).on('dragstart.' + this.eventNamespace(), function(evt, mapEvt) {
      self.drag_start = self.roundPoint(self.getPoint(mapEvt.mapPoint));
    });

    $(board.event_manager).on('drag.' + this.eventNamespace(), function(evt, mapEvt) {
      self.drag_current = self.roundPoint(self.getPoint(mapEvt.mapPoint));
    });

    $(board.event_manager).on('dragstop.' + this.eventNamespace(), function(evt, mapEvt) {
      self.saveAction();

      self.drag_start = null;
      self.drag_current = null;
    });
  },

  disable: function() {
    this.saveAction();
    $(this.board.event_manager).off('.' + this.eventNamespace());
  },

  drawCross: function(point) {
    var crossSize = 10;
    var lines = [
      {start: [point[0] - crossSize, point[1]], end: [point[0] + crossSize, point[1]]},
      {start: [point[0], point[1] - crossSize], end: [point[0], point[1] + crossSize]}
    ];
    this.board.drawing.drawLines("black", 3, lines);
  },

  drawShape: function() {

  },

  draw: function() {
    if (this.cursor) {
      this.drawCross(this.cursor);
    }

    this.drawShape();
  }

});

function SquarePen(board) {
  ShapePen.call(this, board);
  this.super = ShapePen.prototype;
}

SquarePen.prototype = _.extend(new ShapePen(), {

  eventNamespace: function() {
    return "SquarePen";
  },

  drawShape: function() {
    if (this.drag_start && this.drag_current) {
      var topLeft = [Math.min(this.drag_start[0], this.drag_current[0]), Math.min(this.drag_start[1], this.drag_current[1])];
      var bottomRight = [Math.max(this.drag_start[0], this.drag_current[0]), Math.max(this.drag_start[1], this.drag_current[1])];

      this.board.drawing.drawSquare(topLeft, bottomRight, this.color, this.backgroundColor, this.width);

      var xDist = Math.round((Math.abs(topLeft[0] - bottomRight[0]) / this.board.drawing.cellSize) * 5);
      var yDist = Math.round((Math.abs(topLeft[1] - bottomRight[1]) / this.board.drawing.cellSize) * 5);

      this.board.drawing.drawMeasureLine([topLeft[0], topLeft[1] - 30], [bottomRight[0], topLeft[1] - 30], xDist);
      this.board.drawing.drawMeasureLine([bottomRight[0] + 30, topLeft[1]], [bottomRight[0] + 30, bottomRight[1]], yDist);
    }
  },

  saveAction: function() {
    if (this.drag_start && this.drag_current) {
      var topLeft = [Math.min(this.drag_start[0], this.drag_current[0]) >> 0, Math.min(this.drag_start[1], this.drag_current[1]) >> 0];
      var bottomRight = [Math.max(this.drag_start[0], this.drag_current[0]) >> 0, Math.max(this.drag_start[1], this.drag_current[1]) >> 0];

      var action = {actionType: "squarePenAction", color: this.color, backgroundColor: this.backgroundColor, width: this.width, topLeft: topLeft, bottomRight: bottomRight, uid: generateActionId()};
      var undoAction = {actionType: "removeDrawingAction", actionId: action.uid, uid: generateActionId()};
      this.board.addAction(action, undoAction, true);
    }
  }
});

function CirclePen(board) {
  ShapePen.call(this, board);
  this.super = ShapePen.prototype;
}

CirclePen.prototype = _.extend(new ShapePen(), {
  eventNamespace: function() {
    return "CirclePen";
  },
  drawShape: function() {
    if (this.drag_start && this.drag_current) {
      var center = this.drag_start;
      var radius = Geometry.getDistance(this.drag_start, this.drag_current);

      this.board.drawing.drawCircle(center[0], center[1], radius, this.width, this.color, this.backgroundColor);

      var pathfinderDistance = Math.round((radius / this.board.drawing.cellSize) * 5);

      this.board.drawing.drawMeasureLine(this.drag_start, this.drag_current, pathfinderDistance);
    }
  },

  saveAction: function() {
    if (this.drag_start && this.drag_current) {
      var center = this.roundPoint(this.drag_start);
      var radius = Geometry.getDistance(this.drag_start, this.drag_current)>>0;

      var action = {actionType: "circlePenAction", color: this.color, backgroundColor: this.backgroundColor, width: this.width, center: center, radius: radius, uid: generateActionId()};
      var undoAction = {actionType: "removeDrawingAction", actionId: action.uid, uid: generateActionId()};
      this.board.addAction(action, undoAction, true);
    }
  }
});

function LinePen(board) {
  ShapePen.call(this, board);
  this.super = ShapePen.prototype;
}

LinePen.prototype = _.extend(new ShapePen(), {
  buildOptions: function() {
    this.options.add(SHARED_TOOL_OPTIONS.drawingColor);
    this.options.add(SHARED_TOOL_OPTIONS.drawingWidth);
  },
  eventNamespace: function() {
    return "LinePen";
  },
  drawShape: function() {
    if (this.drag_start && this.drag_current) {

      var length = Geometry.getDistance(this.drag_start, this.drag_current);
      var pathfinderDistance = Math.round((length / this.board.drawing.cellSize) * 5);

      this.board.drawing.drawMeasureLine(this.drag_start, this.drag_current, pathfinderDistance, this.color, this.width);
    }
  },

  saveAction: function() {
    if (this.drag_start && this.drag_current) {

      var action = {actionType: "linePenAction", color: this.color, width: this.width, start: this.drag_start, end: this.drag_current, uid: generateActionId()};
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
    location = this.roundPoint(location);
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

function Pen(board) {
  DrawTool.call(this, board);
  this.super = DrawTool.prototype;
  this.width = null;
  this.color = null;
  this.backgroundColor = null;
}

Pen.prototype = _.extend(new DrawTool(), {
  buildOptions: function() {
    this.options.add(SHARED_TOOL_OPTIONS.drawingColor);
    this.options.add(SHARED_TOOL_OPTIONS.drawingWidth);
  },

  optionsChanged: function() {
    this.width = this.options.get("width").value;
    this.color = this.options.get("color").value;
  },
  minimumLineDistance: function() { return this.width / 2; },
  eventNamespace: function() { return "Pen"; },
  draw: function() {
    this.board.drawing.drawLines(this.color, this.width, this.lineBuffer);

    if (this.cursor) {
      this.board.drawing.drawCircle(this.cursor[0], this.cursor[1], this.width / 2, 2, this.color, this.color)
    }
  },
  saveAction: function() {
    if (this.lineBuffer.length > 0) {
      var action = {actionType: "penAction", color: this.color, width: this.width, lines: this.lineBuffer, uid: generateActionId()};
      var undoAction = {actionType: "removeDrawingAction", actionId: action.uid, uid: generateActionId()};
      this.board.addAction(action, undoAction, true);
    }
  }
});

function Eraser(board) {
  DrawTool.call(this, board);
  this.super = DrawTool.prototype;
  this.width = null;
}

Eraser.prototype = _.extend(new DrawTool(), {
  buildOptions: function() {
    this.options.add({type: "size", name: "width", label: "Width", sizes: [10, 30, 50, 75, 125], value: 30 });
  },

  optionsChanged: function() {
    this.width = this.options.get("width").value;
  },
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

function AddFogPen(board) {
  DrawTool.call(this, board);
  this.super = DrawTool.prototype;
  this.width = null;
}

AddFogPen.prototype = _.extend(new DrawTool(), {
  buildOptions: function() {
    this.options.add(SHARED_TOOL_OPTIONS.fogWidth);
  },

  optionsChanged: function() {
    this.width = this.options.get("width").value;
  },
  minimumLineDistance: function() { return 0; },
  eventNamespace: function() { return "AddFog"; },
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
      var action = {actionType: "addFogPenAction", width: this.width, lines: this.lineBuffer, uid: generateActionId()};
      var undoAction = {actionType: "removeFogAction", actionId: action.uid, uid: generateActionId()};
      this.board.addAction(action, undoAction, true);
    }
  }
});

function RemoveFogPen(board) {
  DrawTool.call(this, board);
  this.super = DrawTool.prototype;
  this.width = null;
}

RemoveFogPen.prototype = _.extend(new DrawTool(), {
  buildOptions: function() {
    this.options.add(SHARED_TOOL_OPTIONS.fogWidth);
  },

  optionsChanged: function() {
    this.width = this.options.get("width").value;
  },
  minimumLineDistance: function() { return 0; },
  eventNamespace: function() { return "AddFog"; },
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
      var action = {actionType: "removeFogPenAction", width: this.width, lines: this.lineBuffer, uid: generateActionId()};
      var undoAction = {actionType: "removeFogAction", actionId: action.uid, uid: generateActionId()};
      this.board.addAction(action, undoAction, true);
    }
  }
});

function Measure(board) {
  Tool.call(this, board);
  this.super = Tool.prototype;
  this.color = null;
  this.startCell = null;
  this.currentCell = null;
}
Measure.prototype = _.extend(new Tool(), {
  buildOptions: function() {
    this.options.add(SHARED_TOOL_OPTIONS.templateColor);
  },

  optionsChanged: function() {
    this.color = this.options.get("color").value;
  },
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

function RadialTemplate(board) {
  Tool.call(this, board);
  this.super = Tool.prototype;
  this.color = null;
  this.dragging = false;
  this.center = null;
  this.radiusPoint = null;
}
RadialTemplate.prototype = _.extend(new Tool(), {
  buildOptions: function() {
    this.options.add(SHARED_TOOL_OPTIONS.templateColor);
  },

  optionsChanged: function() {
    this.color = this.options.get("color").value;
  },
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
      self.center = Geometry.getNearestCellIntersection(mapEvt.mapPoint, cellSize);
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

function RadiusTemplate(board) {
  RadialTemplate.call(this, board);
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

function ConeTemplate(board) {
  RadialTemplate.call(this, board);
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

function LineTemplate(board) {
  Tool.call(this, board);
  this.super = Tool.prototype;
  this.color = null;
  this.dragging = false;
  this.startPoint = null;
  this.currentPoint = null;
}
LineTemplate.prototype = _.extend(new Tool(), {
  buildOptions: function() {
    this.options.add(SHARED_TOOL_OPTIONS.templateColor);
  },

  optionsChanged: function() {
    this.color = this.options.get("color").value;
  },
  enable: function () {
    var board = this.board;
    var self = this;
    var cellSize = this.board.drawing.cellSize;

    $(board.event_manager).on('mousemove.LineTemplate', function(evt, mapEvt) {
      if (!self.dragging) {
        self.startPoint = Geometry.getNearestCellIntersection(mapEvt.mapPoint, cellSize);
      }
    });

    $(board.event_manager).on('dragstart.LineTemplate', function (evt, mapEvt) {
      self.dragging = true;
    });

    $(board.event_manager).on('drag.LineTemplate', function (evt, mapEvt) {
      self.currentPoint = Geometry.getNearestCellIntersection(mapEvt.mapPoint, cellSize); //mapEvt.mapPoint;
    });

    $(board.event_manager).on('dragstop.LineTemplate', function (evt, mapEvt) {
      self.saveAction();
      self.currentPoint = null;
      self.dragging = false;
      self.startPoint = Geometry.getNearestCellIntersection(mapEvt.mapPoint, cellSize);
    });
  },

  disable: function () {
    $(this.board.event_manager).off(".LineTemplate");
  },

  draw: function() {

    if (this.startPoint) {
      this.drawCross(this.startPoint);
    }

    if (this.currentPoint) {
      this.drawCross(this.currentPoint);
    }

    if (this.startPoint && this.currentPoint) {
      if (this.startPoint[0] == this.currentPoint[0] && this.startPoint[1] == this.currentPoint[1]) {
        return;
      }

      var cellSize = this.board.drawing.cellSize;
      var template = Geometry.getCellsOnLine(this.startPoint, this.currentPoint, cellSize);
      var border = Geometry.getBorder(template, this.board.drawing.cellSize);

      var startCell = Geometry.getCell(this.startPoint, cellSize);
      var endCell = Geometry.getCell(this.currentPoint, cellSize);
      var distance = Geometry.getCellDistance(startCell, endCell) * 5;

      this.board.drawing.drawTemplate(template, border, this.color);
      this.board.drawing.drawMeasureLine(this.startPoint, this.currentPoint, distance);
    }
  },

  drawCross: function(point) {
    var crossSize = 10;
    var lines = [
      {start: [point[0] - crossSize, point[1]], end: [point[0] + crossSize, point[1]]},
      {start: [point[0], point[1] - crossSize], end: [point[0], point[1] + crossSize]}
    ];
    this.board.drawing.drawLines("black", 3, lines);
  },

  saveAction: function() {
    if (this.startPoint && this.currentPoint) {
      var action = {actionType: "lineTemplateAction", start: this.startPoint, end: this.currentPoint, color: this.color, uid: generateActionId()};
      var undoAction = {actionType: "removeTemplateAction", actionId: action.uid, uid: generateActionId()};
      this.board.addAction(action, undoAction, true);
    }
  }
});

function PingTool(board) {
  Tool.call(this, board);
  this.super = Tool.prototype;
  this.color = null;
}
PingTool.prototype = _.extend(new Tool(), {
  buildOptions: function() {
    this.options.add({type: "color", name: "color", label: "Color", value: "#EE204D"});
  },

  optionsChanged: function() {
    this.color = this.options.get("color").value;
  },
  enable: function() {
    var self = this;
    var board = this.board;

    $(board.event_manager).on('click.PingTool', function(evt, mapEvt) {
      var action = {actionType: "pingAction", point: mapEvt.mapPoint, color: self.color, uid: generateActionId()};
      self.board.addAction(action, null, true);
    });
  },
  disable: function() {
    $(this.board.event_manager).off(".PingTool");
  },
  draw: function() {}
});

function LabelTool(board) {
  Tool.call(this, board);
  this.super = Tool.prototype;
  this.color = null;
  this.cursor = null;
  this.shiftDown = false;
  this.ctrlDown = false;
  this.textLocation = null;
  this.textBox = null;
  this.textBounds = null;
}
LabelTool.prototype = _.extend(new Tool(), {
  buildOptions: function() {
    this.options.add({type: "color", name: "color", label: "Color", value: "#000000"});
  },

  optionsChanged: function() {
    this.color = this.options.get("color").value;
  },
  enable: function() {
    var self = this;
    var board = this.board;

    $(board.event_manager).on('click.LabelTool', function(evt, mapEvt) {
      if (self.textBox) {
        self.save();
      } else {
        self.textLocation = self.getPoint(mapEvt.mapPoint);

        self.textBox = $("<input type='text' />")
            .css({
              position: 'fixed',
              top: '-200px',
              left: '0px',
              'z-index': 99999
            })
            .focusout(function() {
              self.save();
            })
            .keydown(function(e) {
              if (e.keyCode == 13) { //enter
                self.save();
                return false;
              } else if (e.keyCode == 27) { // Esc
                self.clear();
                return false;
              }
              return true;
            })
            .appendTo("body")
            .focus();
      }
    });

    $(board.event_manager).on('mousemove.LabelTool', function(evt, mapEvt) {
      self.cursor = self.getPoint(mapEvt.mapPoint);
    });

    $(board.event_manager).on('keydown.LabelTool', function(evt, mapEvt) {
      self.shiftDown = mapEvt.isShift;
      self.ctrlDown = mapEvt.isCtrl;
    });

    $(board.event_manager).on('keyup.LabelTool', function(evt, mapEvt) {
      self.shiftDown = mapEvt.isShift;
      self.ctrlDown = mapEvt.isCtrl;
    });
  },
  disable: function() {
    $(this.board.event_manager).off(".LabelTool");
    this.clear();
  },
  draw: function() {
    if (this.textBox) {
      var txt = this.textBox.val();
      var seconds = parseInt(new Date().getTime() / 1000);
      var outlineColor = "rgba(255, 255, 255, 0.25";
      if ((seconds % 2) == 0) {
        outlineColor = "rgba(0, 0, 0, 1.0)";
      }
      this.textBounds = this.board.drawing.drawLabel(this.textLocation, txt, this.color, outlineColor, "rgba(255, 255, 255, 0.25");
    }

    if (this.cursor) {
      this.drawCross(this.cursor);
    }
  },

  save: function() {
    if (this.textBox) {

      var txt = this.textBox.val();
      var action = {
        actionType: "labelAction",
        point: this.textLocation,
        color: this.color,
        text: txt,
        bound: this.textBounds,
        uid: generateActionId()};

      var undoAction = {actionType: "removeDrawingAction", actionId: action.uid, uid: generateActionId()};

      this.board.addAction(action, undoAction, true);
    }

    this.clear();
  },

  clear: function() {
    if (this.textBox) {
      this.textBox.remove();
      this.textBox = null;
    }
    this.textLocation = null;
  },

  drawCross: function(point) {
    var crossSize = 10;
    var lines = [
      {start: [point[0] - crossSize, point[1]], end: [point[0] + crossSize, point[1]]},
      {start: [point[0], point[1] - crossSize], end: [point[0], point[1] + crossSize]}
    ];
    this.board.drawing.drawLines("black", 3, lines);
  },

  getPoint: function(mapPoint) {
    if (this.shiftDown) {
      return Geometry.getNearestCellIntersection(mapPoint, this.board.drawing.cellSize);
    } else if (this.ctrlDown) {
      return Geometry.getNearestCellCenter(mapPoint, this.board.drawing.cellSize);
    } else {
      return mapPoint;
    }
  }
});

function CopyTool(board) {
  Tool.call(this, board);
  this.super = Tool.prototype;
  this.cursor = null;
  this.shiftDown = false;
  this.ctrlDown = false;
  this.drag_start = null;
  this.drag_current = null;
}
CopyTool.prototype = _.extend(new Tool(), {
  buildOptions: function() {
    this.options.add({type: "copiedImage", url: this.board.copiedArea, name: 'copiedImage'});
  },

  getPoint: function(mapPoint) {
    if (this.shiftDown && this.ctrlDown) {
      return Geometry.getNearestHalfCellSnap(mapPoint, this.board.drawing.cellSize);
    } else if (this.shiftDown) {
      return Geometry.getNearestCellIntersection(mapPoint, this.board.drawing.cellSize);
    } else if (this.ctrlDown) {
      return Geometry.getNearestCellCenter(mapPoint, this.board.drawing.cellSize);
    } else {
      return mapPoint;
    }
  },

  eventNamespace: function() {
    return "CopyTool";
  },

  enable: function() {

    var self = this;
    var board = this.board;

    $(board.event_manager).on('keydown.' + this.eventNamespace(), function(evt, mapEvt) {
      self.shiftDown = mapEvt.isShift;
      self.ctrlDown = mapEvt.isCtrl;
      self.cursor = self.getPoint(self.cursor);
    });

    $(board.event_manager).on('keyup.' + this.eventNamespace(), function(evt, mapEvt) {
      self.shiftDown = mapEvt.isShift;
      self.ctrlDown = mapEvt.isCtrl;
      self.cursor = self.getPoint(self.cursor);
    });

    $(board.event_manager).on('mousemove.' + this.eventNamespace(), function(evt, mapEvt) {
      self.cursor = self.getPoint(mapEvt.mapPoint);
    });

    $(board.event_manager).on('dragstart.' + this.eventNamespace(), function(evt, mapEvt) {
      self.drag_start = self.roundPoint(self.getPoint(mapEvt.mapPoint));
    });

    $(board.event_manager).on('drag.' + this.eventNamespace(), function(evt, mapEvt) {
      self.drag_current = self.roundPoint(self.getPoint(mapEvt.mapPoint));
    });

    $(board.event_manager).on('dragstop.' + this.eventNamespace(), function(evt, mapEvt) {
      self.saveAction();

      self.drag_start = null;
      self.drag_current = null;
    });
  },

  disable: function() {
    this.saveAction();
    $(this.board.event_manager).off('.' + this.eventNamespace());
  },

  saveAction: function() {

    var self = this;

    if (!this.drag_start || !this.drag_current) {
      return;
    }

    var topLeft = [Math.min(this.drag_start[0], this.drag_current[0]), Math.min(this.drag_start[1], this.drag_current[1])];
    var bottomRight = [Math.max(this.drag_start[0], this.drag_current[0]), Math.max(this.drag_start[1], this.drag_current[1])];

    var height = bottomRight[1] - topLeft[1];
    var width = bottomRight[0] - topLeft[0];

    var data = this.board.copyArea(topLeft[0], topLeft[1], height, width);

    var formData = new FormData();
    formData.append("image[filename]", "copied_data.png");
    formData.append("image[data]", data);

    $.ajax({
      url: ROOT_URL + 'copied_images.json',
      type: 'POST',
      data: formData,
      contentType: false,
      processData: false,
      success: function(data, status, xhr) {
        self.board.setCopiedArea(data.url);
        self.getOptions().get("copiedImage").url = data.url;
        self.board.toolBars.setOptions(self.getOptions());
      }
    });
  },

  drawCross: function(point) {
    var crossSize = 10;
    var lines = [
      {start: [point[0] - crossSize, point[1]], end: [point[0] + crossSize, point[1]]},
      {start: [point[0], point[1] - crossSize], end: [point[0], point[1] + crossSize]}
    ];
    this.board.drawing.drawLines("black", 3, lines);
  },

  drawShape: function() {
    if (this.drag_start && this.drag_current) {
      var topLeft = [Math.min(this.drag_start[0], this.drag_current[0]), Math.min(this.drag_start[1], this.drag_current[1])];
      var bottomRight = [Math.max(this.drag_start[0], this.drag_current[0]), Math.max(this.drag_start[1], this.drag_current[1])];

      this.board.drawing.drawSquare(topLeft, bottomRight, 'black', null, 5);

      var xDist = Math.round((Math.abs(topLeft[0] - bottomRight[0]) / this.board.drawing.cellSize) * 5);
      var yDist = Math.round((Math.abs(topLeft[1] - bottomRight[1]) / this.board.drawing.cellSize) * 5);

      this.board.drawing.drawMeasureLine([topLeft[0], topLeft[1] - 30], [bottomRight[0], topLeft[1] - 30], xDist);
      this.board.drawing.drawMeasureLine([bottomRight[0] + 30, topLeft[1]], [bottomRight[0] + 30, bottomRight[1]], yDist);
    }
  },

  draw: function() {
    if (this.cursor) {
      this.drawCross(this.cursor);
    }

    this.drawShape();
  }
});

function PasteTool(board) {
  Tool.call(this, board);
  this.super = Tool.prototype;
  this.cursor = null;
  this.shiftDown = false;
  this.ctrlDown = false;
}
PasteTool.prototype = _.extend(new Tool(), {
  buildOptions: function() {
    this.options.add({type: "copiedImage", url: this.board.copiedArea, name: 'copiedImage'});
  },

  getPoint: function(mapPoint) {
    if (this.shiftDown && this.ctrlDown) {
      return Geometry.getNearestHalfCellSnap(mapPoint, this.board.drawing.cellSize);
    } else if (this.shiftDown) {
      return Geometry.getNearestCellIntersection(mapPoint, this.board.drawing.cellSize);
    } else if (this.ctrlDown) {
      return Geometry.getNearestCellCenter(mapPoint, this.board.drawing.cellSize);
    } else {
      return mapPoint;
    }
  },

  eventNamespace: function() {
    return "PasteTool";
  },

  drawCross: function(point) {
    var crossSize = 10;
    var lines = [
      {start: [point[0] - crossSize, point[1]], end: [point[0] + crossSize, point[1]]},
      {start: [point[0], point[1] - crossSize], end: [point[0], point[1] + crossSize]}
    ];
    this.board.drawing.drawLines("black", 3, lines);
  },

  enable: function() {

    var self = this;
    var board = this.board;

    $(board.event_manager).on('keydown.' + this.eventNamespace(), function(evt, mapEvt) {
      self.shiftDown = mapEvt.isShift;
      self.ctrlDown = mapEvt.isCtrl;
      self.cursor = self.getPoint(self.cursor);
    });

    $(board.event_manager).on('keyup.' + this.eventNamespace(), function(evt, mapEvt) {
      self.shiftDown = mapEvt.isShift;
      self.ctrlDown = mapEvt.isCtrl;
      self.cursor = self.getPoint(self.cursor);
    });

    $(board.event_manager).on('mousemove.' + this.eventNamespace(), function(evt, mapEvt) {
      self.cursor = self.getPoint(mapEvt.mapPoint);
    });

    $(board.event_manager).on('click.' + this.eventNamespace(), function(evt, mapEvt) {
      self.saveAction();
    });
  },

  disable: function() {
    $(this.board.event_manager).off('.' + this.eventNamespace());
  },

  draw: function() {
    if (this.cursor) {
      this.drawCross(this.cursor);
    }

    this.drawImage();
  },

  drawImage: function() {
    if (this.board.copiedArea && this.cursor) {
      this.board.drawing.drawImage(this.cursor[0], this.cursor[1], this.board.copiedArea);
    }
  },

  saveAction: function() {
    if (this.board.copiedArea && this.cursor) {
      var imgObj = this.board.imageCache.getImage(this.board.copiedArea);

      if (imgObj) {
        var width = imgObj.width;
        var height = imgObj.height;

        var action = {
          actionType: "pasteAction",
          url: this.board.copiedArea,
          topLeft: this.cursor,
          width: width,
          height: height,
          uid: generateActionId()};

        var undoAction = {actionType: "removeDrawingAction", actionId: action.uid, uid: generateActionId()};

        this.board.addAction(action, undoAction, true);
      }
    }
  }
});