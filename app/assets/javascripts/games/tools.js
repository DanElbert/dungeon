
function Pointer(board) {
  this.board = board;

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

function Pen(board, width, color) {
  this.board = board;
  this.width = width;
  this.color = color;

  this.previous_point = null;

  var self = this;

  this.enable = function() {
    $(this.board.event_manager).on('dragstart.Pen', function(evt, mapEvt) {
      self.previous_point = mapEvt.mapPoint;
    });

    $(this.board.event_manager).on('drag.Pen', function(evt, mapEvt) {
      if (self.previous_point && self.getDistance(self.previous_point, mapEvt.mapPoint) >= self.width) {
        var drawAction = {type: "line", start: self.previous_point, end: mapEvt.mapPoint, width: self.width, color: self.color};
        self.board.drawing_queue.push(drawAction);
        self.previous_point = mapEvt.mapPoint;
      } else if (!self.previous_point) {
        self.previous_point = mapEvt.mapPoint;
      }
    });

    $(this.board.event_manager).on('dragstop.Pen', function(evt, mapEvt) {

    });
  };

  this.getDistance = function(p1, p2) {
    var x_side = Math.pow((p1[0] - p2[0]), 2);
    var y_side = Math.pow((p1[1] - p2[1]), 2);
    return Math.sqrt(x_side + y_side);
  };

  this.disable = function() {
    $(this.board.event_manager).off(".Pen");
  };
}