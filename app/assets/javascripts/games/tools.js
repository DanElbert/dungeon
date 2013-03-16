
function Tool(board) {
  this.board = board;
}
_.extend(Tool.prototype, {
  enable: function() {},
  disable: function() {},
  draw: function() {},
  getDistance: function(p1, p2) {
    return this.board.drawing.getDistance(p1, p2);
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

  var self = this;

  this.enable = function() {
    var board = this.board;
    $(board.event_manager).on('dragstart.Pointer', function(evt, mapEvt) {
      self.drag_mouse_start = mapEvt.mousePoint;
      self.drag_viewport_start = board.viewPortCoord;
    });

    $(board.event_manager).on('drag.Pointer', function(evt, mapEvt) {
      var deltaX = Math.floor((self.drag_mouse_start[0] - mapEvt.mousePoint[0]) / board.zoom);
      var deltaY = Math.floor((self.drag_mouse_start[1] - mapEvt.mousePoint[1]) / board.zoom);

      board.viewPortCoord = [self.drag_viewport_start[0] + deltaX, self.drag_viewport_start[1] + deltaY];

      // Ensure viewport is bound to within the map
      board.setZoom(board.zoom);
    });
  };

  this.disable = function() {
    $(this.board.event_manager).off(".Pointer");
  };
}

Pointer.prototype = new Tool();

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
  minimumLineDistance: function() { return this.width; },
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

      this.board.drawing.drawMovement(this.startCell, this.currentCell);
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

      this.board.drawing.drawRadiusTemplate(centerCell, distance, this.color);
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