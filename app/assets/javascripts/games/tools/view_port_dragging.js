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