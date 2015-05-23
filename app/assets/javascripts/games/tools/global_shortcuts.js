function GlobalShortCuts(manager) {
  Tool.call(this, manager);
  this.super = Tool.prototype;
  this.viewPortDragging = new ViewPortDragging(this, this.board, 'rightdrag');
}

GlobalShortCuts.prototype = _.extend(GlobalShortCuts.prototype, Tool.prototype, {
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
    });

    $(this.board.event_manager).on('scroll.GlobalShortCuts', function(evt, mapEvt) {
      var currentZoom = self.board.zoom;
      var newZoom = currentZoom + (mapEvt.deltaY * scrollZoomFactor);
      self.board.setZoom(newZoom, mapEvt.mapPoint);
    });

    $(this.board.event_manager).on('keydown.GlobalShortCuts', function(evt, mapEvt) {
      if (mapEvt.key == 90 && mapEvt.isCtrl) {
        // ctrl-z
        self.board.undo();
      }
    });

    $(this.board.event_manager).on('dblclick.GlobalShortcuts', function(evt, mapEvt) {
      var action = {actionType: "pingAction", point: mapEvt.mapPoint, color: "#EE204D", uid: generateActionId()};
      self.board.addAction(action, null, true);
    });
  },
  disable: function() {
    this.viewPortDragging.disable();
    $(this.board.event_manager).off(".GlobalShortCuts");
  }
});