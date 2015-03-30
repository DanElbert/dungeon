function AddFogPen(board) {
  DrawTool.call(this, board);
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

RemoveFogPen.prototype = _.extend(RemoveFogPen.prototype, DrawTool.prototype, {
  buildOptions: function() {
    this.options.add(this.toolManager.sharedTool("fogWidth"));
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