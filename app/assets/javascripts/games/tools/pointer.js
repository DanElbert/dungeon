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

      for (var x = board.template_actions.length - 1; x >= 0; x--) {
        var action = board.template_actions[x];
        if (action.isTemplate && action.containsCell(board, mapEvt.mapPointCell)) {
          self.selected_template = action;
          break;
        }
      }
    });

    board.event_manager.on('dragstart.Pointer', function(mapEvt) {
      if (self.selected_template && self.selected_template.containsCell(self.board, mapEvt.mapPointCell)) {
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
      if (self.selected_template && (mapEvt.key == 8 || mapEvt.key == 46)) {
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
    var restoreAction = template.clone().properties;
    this.board.addAction(removeAction, restoreAction, true);
  },

  disable: function() {
    this.viewPortDragging.disable();
    this.board.event_manager.off(".Pointer");
  },

  draw: function() {

    var border = null;

    if (this.dragging_template) {
      var dx = this.template_current_cell[0] - this.template_start_cell[0];
      var dy = this.template_current_cell[1] - this.template_start_cell[1];
      var cellSize = this.board.drawing.cellSize;

      if (dx != 0 || dy != 0) {
        this.board.drawing.drawMovementLine(this.template_start_cell, this.template_current_cell);
      }

      border = _.map(this.selected_template.getBorder(this.board), function(line) {
        return {
          start: [line.start[0] + dx * cellSize, line.start[1] + dy * cellSize],
          end: [line.end[0] + dx * cellSize, line.end[1] + dy * cellSize]
        }
      });
    } else if (this.selected_template) {
      border = this.selected_template.getBorder(this.board);
    }

    if (border) {
      this.board.drawing.drawLines("white", 6, border);
    }
  },

  saveAction: function() {
    if (this.dragging_template) {
      var dx = this.template_current_cell[0] - this.template_start_cell[0];
      var dy = this.template_current_cell[1] - this.template_start_cell[1];

      var removeAction = {actionType: "removeTemplateAction", actionId: this.selected_template.uid, uid: generateActionId()};
      var addAction = this.selected_template.cloneAndTranslate(dx, dy, this.board.drawing.cellSize).serialize();

      var restoreAction = this.selected_template.clone().serialize();
      var undoAction = {actionType: "removeTemplateAction", actionId: addAction.uid, uid: generateActionId()};

      this.board.addAction(
          {actionType: "compositeAction", actionList: [removeAction, addAction]},
          {actionType: "compositeAction", actionList: [undoAction, restoreAction]},
          true);

      this.selected_template = null;
    }
  }
});