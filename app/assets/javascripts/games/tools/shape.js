function ShapeTool(manager) {
  Tool.call(this, manager);
  this.super = Tool.prototype;

  this.width = null;
  this.color = null;
  this.backgroundColor = null;
  this.shape = null;

  this.shiftDown = false;
  this.ctrlDown = false;

  this.drag_start = null;
  this.drag_current = null;
  this.cursor = null;
}

ShapeTool.prototype = _.extend(ShapeTool.prototype, Tool.prototype, {
  buildOptions: function() {
    this.options.add({type: "shapes", label: "Shape", name: "shape", value: "rectangle"});
    this.options.add(this.toolManager.sharedTool("drawingColor"));
    this.options.add(this.toolManager.sharedTool("drawingBackgroundColor"));
    this.options.add(this.toolManager.sharedTool("drawingWidth"));
  },

  optionsChanged: function() {
    this.width = this.options.get("width").value;
    this.color = this.options.get("color").value;
    this.shape = this.options.get("shape").value;
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
    switch(this.shape) {
      case "rectangle":
        this.drawRectangle();
        break;
      case "circle":
        this.drawCircle();
        break;
      case "line":
        this.drawLine();
        break;
    }
  },
  
  saveAction: function() {
    switch(this.shape) {
      case "rectangle":
        this.saveRectangle();
        break;
      case "circle":
        this.saveCircle();
        break;
      case "line":
        this.saveLine();
        break;
    }
  },

  draw: function() {
    if (this.cursor) {
      this.drawCross(this.cursor);
    }

    this.drawShape();
  },

  drawRectangle: function() {
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

  drawCircle: function() {
    if (this.drag_start && this.drag_current) {
      var center = this.drag_start;
      var radius = Geometry.getDistance(this.drag_start, this.drag_current);

      this.board.drawing.drawCircle(center[0], center[1], radius, this.width, this.color, this.backgroundColor);

      var pathfinderDistance = Math.round((radius / this.board.drawing.cellSize) * 5);

      this.board.drawing.drawMeasureLine(this.drag_start, this.drag_current, pathfinderDistance);
    }
  },

  drawLine: function() {
    if (this.drag_start && this.drag_current) {

      var length = Geometry.getDistance(this.drag_start, this.drag_current);
      var pathfinderDistance = Math.round((length / this.board.drawing.cellSize) * 5);

      this.board.drawing.drawMeasureLine(this.drag_start, this.drag_current, pathfinderDistance, this.color, this.width);
    }
  },

  saveRectangle: function() {
    if (this.drag_start && this.drag_current) {
      var topLeft = [Math.min(this.drag_start[0], this.drag_current[0]) >> 0, Math.min(this.drag_start[1], this.drag_current[1]) >> 0];
      var bottomRight = [Math.max(this.drag_start[0], this.drag_current[0]) >> 0, Math.max(this.drag_start[1], this.drag_current[1]) >> 0];

      var action = {actionType: "squarePenAction", color: this.color, backgroundColor: this.backgroundColor, width: this.width, topLeft: topLeft, bottomRight: bottomRight, uid: generateActionId()};
      var undoAction = {actionType: "removeDrawingAction", actionId: action.uid, uid: generateActionId()};
      this.board.addAction(action, undoAction, true);
    }
  },

  saveCircle: function() {
    if (this.drag_start && this.drag_current) {
      var center = this.roundPoint(this.drag_start);
      var radius = Geometry.getDistance(this.drag_start, this.drag_current)>>0;

      var action = {actionType: "circlePenAction", color: this.color, backgroundColor: this.backgroundColor, width: this.width, center: center, radius: radius, uid: generateActionId()};
      var undoAction = {actionType: "removeDrawingAction", actionId: action.uid, uid: generateActionId()};
      this.board.addAction(action, undoAction, true);
    }
  },

  saveLine: function() {
    if (this.drag_start && this.drag_current) {

      var action = {actionType: "linePenAction", color: this.color, width: this.width, start: this.drag_start, end: this.drag_current, uid: generateActionId()};
      var undoAction = {actionType: "removeDrawingAction", actionId: action.uid, uid: generateActionId()};
      this.board.addAction(action, undoAction, true);
    }
  }

});
