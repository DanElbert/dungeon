function ReachTemplateTool(manager) {
  Tool.call(this, manager);
  this.super = Tool.prototype;

  this.color = null;
  this.size = null;
  this.reach = null;
  this.cursor = null;
}

ReachTemplateTool.prototype = _.extend(ReachTemplateTool.prototype, Tool.prototype, {
  buildOptions: function () {
    this.options.add({type: "creatureSize", label: "Size", name: "size", value: "large_tall"});
    this.options.add({type: "boolean", label: "Reach", name: "reach", value: false});
    this.options.add(this.toolManager.sharedTool("templateColor"));
  },

  optionsChanged: function () {
    this.size = this.options.get("size").value;
    this.reach = this.options.get("reach").value;
    this.color = this.options.get("color").value;
  },

  eventNamespace: function () {
    return "ReachTemplate";
  },

  enable: function () {

    var self = this;
    var board = this.board;

    board.event_manager.on('mousemove.' + this.eventNamespace(), function (mapEvt) {
      self.cursor = mapEvt.mapPoint;
    });

    board.event_manager.on('click.' + this.eventNamespace(), function (mapEvt) {
      self.saveAction();
    });
  },

  disable: function () {
    this.board.event_manager.off('.' + this.eventNamespace());
  },

  saveAction: function () {
    if (this.cursor) {
      var action = {actionType: "reachTemplateAction", anchor: this.cursor, size: this.size, reach: this.reach, color: this.color, uid: generateActionId()};
      var undoAction = {actionType: "removeTemplateAction", actionId: action.uid, uid: generateActionId()};
      this.board.addAction(action, undoAction, true);
    }
  },

  draw: function () {
    if (this.cursor == null) {
      return;
    }

    var template = Geometry.getReachCells(this.cursor, this.size, this.reach, this.board.drawing.cellSize);
    var creature_border = Geometry.getBorder(template.threat, this.board.drawing.cellSize);

    this.board.drawing.drawTemplate(template.threat, creature_border, this.color);
  }
});