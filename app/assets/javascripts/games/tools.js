
function Tool(board) {
  this.board = board;
}
_.extend(Tool.prototype, {
  enable: function() {},
  disable: function() {},
  draw: function() {},
  getDistance: function(p1, p2) {
    var x_side = Math.pow((p1[0] - p2[0]), 2);
    var y_side = Math.pow((p1[1] - p2[1]), 2);
    return Math.sqrt(x_side + y_side);
  }
});


function Pointer(board) {
  Tool.call(this, board);

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

function Pen(board, width, color) {
  Tool.call(this, board);
  this.width = width;
  this.color = color;

  this.lineBuffer = [];

  this.previous_point = null;

  var self = this;

  this.saveAction = function() {
    if (self.lineBuffer.length > 0) {
      var action = {actionType: "penAction", color: self.color, width: self.width, lines: self.lineBuffer, uid: generateActionId()};
      var undoAction = {actionType: "removeDrawingAction", actionId: action.uid, uid: generateActionId()};
      self.board.addAction(action, undoAction);
      self.lineBuffer = [];
    }
  };

  this.draw = function() {
    this.board.drawing.drawLines(this.color, this.width, this.lineBuffer);
  };

  this.enable = function() {
    $(this.board.event_manager).on('dragstart.Pen', function(evt, mapEvt) {
      self.previous_point = mapEvt.mapPoint;
    });

    $(this.board.event_manager).on('drag.Pen', function(evt, mapEvt) {
      if (self.previous_point && self.getDistance(self.previous_point, mapEvt.mapPoint) >= self.width) {
        self.lineBuffer.push({start: self.previous_point, end: mapEvt.mapPoint});
        self.previous_point = mapEvt.mapPoint;
      } else if (!self.previous_point) {
        self.previous_point = mapEvt.mapPoint;
      }
    });

    $(this.board.event_manager).on('dragstop.Pen', function(evt, mapEvt) {
      self.saveAction();
    });
  };

  this.disable = function() {
    self.saveAction();
    $(this.board.event_manager).off(".Pen");
  };
}

Pen.prototype = new Tool();