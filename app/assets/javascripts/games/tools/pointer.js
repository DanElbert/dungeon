function Pointer(manager) {
  Tool.call(this, manager);
  this.super = Tool.prototype;

  this.viewPortDragging = new ViewPortDragging(this, this.board, 'drag');
  this.selected_template = null;
  this.dragging_template = false;
  this.template_start_cell = null;
  this.template_current_cell = null;
}

Pointer.prototype = _.extend(Pointer.prototype, Tool.prototype, {
  enable: function() {

    var self = this;
    var board = this.board;

    this.viewPortDragging.enable();

    board.event_manager.on('click.Pointer', function(mapEvt) {

      var t = board.tokenLayer.tokenAtCell(mapEvt.mapPointCell);

      if (t !== null) {
        var tool = self.toolManager.setTool("tokens");
        tool.editToken(t);
      }

      self.selected_template = null;

      var tmpl = board.templateLayer.templateAt(mapEvt.mapPoint);

      if (tmpl !== null) {
        self.selected_template = tmpl;
      }
    });

    board.event_manager.on('dragstart.Pointer', function(mapEvt) {
      if (self.selected_template && self.selected_template.containsPoint(mapEvt.mapPoint)) {
        self.dragging_template = true;
        self.template_start_cell = mapEvt.mapPointCell;
        self.viewPortDragging.disable();
      }
    });

    board.event_manager.on('drag.Pointer', function(mapEvt) {

      if (self.dragging_template) {
        self.template_current_cell = mapEvt.mapPointCell;
      }
    });

    board.event_manager.on('dragstop.Pointer', function(mapEvt) {

      self.saveAction();

      if (!self.viewPortDragging.enabled) {
        self.viewPortDragging.enable();
      }

      self.dragging_template = false;
      self.template_start_cell = null;
      self.template_current_cell = null;
    });

    board.event_manager.on('keydown.Pointer', function(mapEvt) {
      if (self.selected_template && (mapEvt.key == "Backspace" || mapEvt.key == "Delete")) {
        self.removeTemplate(self.selected_template);
        self.selected_template = null;
      }
    });

    board.event_manager.on('hold.Pointer', function(mapEvt) {
      if (self.selected_template && self.selected_template.containsCell(self.board, mapEvt.mapPointCell)) {
        self.removeTemplate(self.selected_template);
        self.selected_template = null;
      }
    });
  },

  removeTemplate: function(template) {
    var removeAction = {actionType: "removeTemplateAction", actionId: template.uid, uid: generateActionId()};
    var restoreAction = template.clone(generateActionId()).toAction();
    this.board.addAction(removeAction, restoreAction, true);
  },

  disable: function() {
    this.viewPortDragging.disable();
    this.board.event_manager.off(".Pointer");
  },

  draw: function() {

    var offset = null;

    if (this.dragging_template) {
      var dx = this.template_current_cell[0] - this.template_start_cell[0];
      var dy = this.template_current_cell[1] - this.template_start_cell[1];
      offset = new Vector2(dx, dy);
    } else if (this.selected_template) {
      offset = new Vector2(0, 0);
    }

    if (offset) {
      this.selected_template.drawHighlight(this.board.drawing, offset.scale(this.board.drawingSettings.cellSize, this.board.drawingSettings.cellSize));

      if (offset.x !== 0 || offset.y !== 0) {
        this.board.drawing.drawMovementLine(this.template_start_cell, this.template_current_cell, this.board.getZoom());
      }
    }
  },

  saveAction: function() {
    if (this.dragging_template) {
      var dx = this.template_current_cell[0] - this.template_start_cell[0];
      var dy = this.template_current_cell[1] - this.template_start_cell[1];

      var removeAction = {actionType: "removeTemplateAction", actionId: this.selected_template.uid, uid: generateActionId()};
      var addAction = this.selected_template.clone(generateActionId()).translate(dx * this.board.drawingSettings.cellSize, dy * this.board.drawingSettings.cellSize).toAction();

      var restoreAction = this.selected_template.clone(generateActionId()).toAction();
      var undoAction = {actionType: "removeTemplateAction", actionId: addAction.uid, uid: generateActionId()};

      this.board.addAction(
          {actionType: "compositeAction", actionList: [removeAction, addAction]},
          {actionType: "compositeAction", actionList: [undoAction, restoreAction]},
          true);

      this.selected_template = null;
    }
  }
});