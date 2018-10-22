function DrawTool(manager) {
  Tool.call(this, manager);
  this.super = Tool.prototype;

  this.lineBuffer = [];
  this.drawingObject = null;
  this.previous_point = null;
  this.cursor = null;
}
DrawTool.prototype = _.extend(DrawTool.prototype, Tool.prototype, {
  eventNamespace: function() { return "Drawing"; },
  minimumLineDistance: function() { return 0; },
  saveAction: function() { },
  isFog: function() { return false; },
  createDrawingObject: function() { },
  handleMouseMove: function(location) {
    location = this.roundPoint(location);
    if (this.previous_point == null) {
      this.previous_point = location;
    }

    var distance = Geometry.getDistance(this.previous_point, location);

    if (distance >= this.minimumLineDistance()) {
      this.lineBuffer.push({start: this.previous_point, end: location});
      this.drawingObject.setLines(this.lineBuffer);
      this.previous_point = location;
    }
  },
  enable: function() {
    var self = this;
    $(this.board.event_manager).on('dragstart.' + this.eventNamespace(), function(evt, mapEvt) {
      self.previous_point = null;
      self.drawingObject = self.createDrawingObject();
      if (self.isFog()) {
        self.board.drawingLayer.addFogAction(self.drawingObject);
      } else {
        self.board.drawingLayer.addAction(self.drawingObject);
      }
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
      self.removeDrawingObject();
    });
  },

  disable: function() {
    this.saveAction();
    this.removeDrawingObject();
    this.lineBuffer = [];
    $(this.board.event_manager).off("." + this.eventNamespace());
  },

  removeDrawingObject: function() {
    if (this.drawingObject) {
      this.board.drawingLayer.removeAction(this.drawingObject.uid);
      this.drawingObject = null;
    }
  }
});

function Pen(board) {
  DrawTool.call(this, board);
  this.super = DrawTool.prototype;
  this.width = null;
  this.color = null;
  this.backgroundColor = null;
}

Pen.prototype = _.extend(Pen.prototype, DrawTool.prototype, {
  buildOptions: function() {
    this.options.add(this.toolManager.sharedTool("drawingColor"));
    this.options.add(this.toolManager.sharedTool("drawingWidth"));
  },

  optionsChanged: function() {
    this.width = this.options.get("width").value;
    this.color = this.options.get("color").value;
  },
  minimumLineDistance: function() { return this.width / 2; },
  eventNamespace: function() { return "Pen"; },
  createDrawingObject: function() {
    return new PenDrawing(generateActionId(), this.board, this.lineBuffer, this.width, this.color);
  },
  draw: function() {
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

function Eraser(manager) {
  DrawTool.call(this, manager);
  this.super = DrawTool.prototype;
  this.width = null;
}

Eraser.prototype = _.extend(Eraser.prototype, DrawTool.prototype, {
  buildOptions: function() {
    this.options.add({type: "size", name: "width", label: "Width", sizes: [10, 30, 50, 75, 125], value: 30 });
  },

  optionsChanged: function() {
    this.width = this.options.get("width").value;
  },
  minimumLineDistance: function() { return 0; },
  eventNamespace: function() { return "Eraser"; },
  createDrawingObject: function() {
    return new PenDrawing(generateActionId(), this.board, this.lineBuffer, this.width, -1);
  },
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