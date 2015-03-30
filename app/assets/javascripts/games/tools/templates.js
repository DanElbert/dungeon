function Measure(manager) {
  Tool.call(this, manager);
  this.super = Tool.prototype;
  this.color = null;
  this.startCell = null;
  this.currentCell = null;
}
Measure.prototype = _.extend(Measure.prototype, Tool.prototype, {
  buildOptions: function() {
    this.options.add(this.toolManager.sharedTool("templateColor"));
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

function RadialTemplate(manager) {
  Tool.call(this, manager);
  this.super = Tool.prototype;
  this.color = null;
  this.dragging = false;
  this.center = null;
  this.radiusPoint = null;
}
RadialTemplate.prototype = _.extend(RadialTemplate.prototype, Tool.prototype, {
  buildOptions: function() {
    this.options.add(this.toolManager.sharedTool("templateColor"));
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

function RadiusTemplate(manager) {
  RadialTemplate.call(this, manager);
  this.super = RadialTemplate.prototype;
}
RadiusTemplate.prototype = _.extend(RadiusTemplate.prototype, RadialTemplate.prototype, {
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

function ConeTemplate(manager) {
  RadialTemplate.call(this, manager);
  this.super = RadialTemplate.prototype;
}
ConeTemplate.prototype = _.extend(ConeTemplate.prototype, RadialTemplate.prototype, {
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

function LineTemplate(manager) {
  Tool.call(this, manager);
  this.super = Tool.prototype;
  this.color = null;
  this.dragging = false;
  this.startPoint = null;
  this.currentPoint = null;
}
LineTemplate.prototype = _.extend(LineTemplate.prototype, Tool.prototype, {
  buildOptions: function() {
    this.options.add(this.toolManager.sharedTool("templateColor"));
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