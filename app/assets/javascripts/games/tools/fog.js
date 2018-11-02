function AddFogPen(manager) {
  DrawTool.call(this, manager);
  this.super = DrawTool.prototype;
  this.width = null;
}

AddFogPen.prototype = _.extend(AddFogPen.prototype, DrawTool.prototype, {
  buildOptions: function() {
    this.options.add(this.toolManager.sharedTool("fogWidth"));
  },

  optionsChanged: function() {
    this.width = this.options.get("width").value;
  },
  minimumLineDistance: function() { return Math.min(5, this.width / 2); },
  eventNamespace: function() { return "AddFog"; },
  isFog: function() { return true; },
  createDrawingObject: function() {
    return new PenDrawing(generateActionId(), this.board, this.lineBuffer, this.width, "black");
  },
  enable: function() {
    this.super.enable.apply(this);
    this.setCursor('none');
    var self = this;
    $(this.board.event_manager).bind('click.' + this.eventNamespace(), function(mapEvt) {
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
      this.board.drawing.drawCircle(this.cursor[0], this.cursor[1], this.width / 2, 2, cursorColor);
      this.board.drawing.drawCircle(this.cursor[0], this.cursor[1], 2, 1, cursorColor, cursorColor);
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

function RemoveFogPen(manager) {
  DrawTool.call(this, manager);
  this.super = DrawTool.prototype;
  this.width = null;
}

RemoveFogPen.prototype = _.extend(RemoveFogPen.prototype, DrawTool.prototype, {
  buildOptions: function() {
    this.options.add(this.toolManager.sharedTool("fogWidth"));
  },

  optionsChanged: function() {
    this.width = this.options.get("width").value;
  },
  minimumLineDistance: function() { return Math.min(5, this.width / 2); },
  eventNamespace: function() { return "AddFog"; },
  isFog: function() { return true; },
  createDrawingObject: function() {
    return new PenDrawing(generateActionId(), this.board, this.lineBuffer, this.width, -1);
  },
  enable: function() {
    this.super.enable.apply(this);
    this.setCursor('none');
    var self = this;
    $(this.board.event_manager).bind('click.' + this.eventNamespace(), function(mapEvt) {
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
      this.board.drawing.drawCircle(this.cursor[0], this.cursor[1], this.width / 2, 2, cursorColor);
      this.board.drawing.drawCircle(this.cursor[0], this.cursor[1], 2, 1, cursorColor, cursorColor);
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