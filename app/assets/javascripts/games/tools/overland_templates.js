function OverlandMeasureTemplateTool(manager) {
  Tool.call(this, manager);
  this.super = Tool.prototype;

  this.color = null;
  this.template = null;
  this.cursor = null;
}

OverlandMeasureTemplateTool.prototype = _.extend(OverlandMeasureTemplateTool.prototype, Tool.prototype, {
  buildOptions: function () {
    this.options.add(this.toolManager.sharedTool("templateColor"));
  },

  optionsChanged: function () {
    this.color = this.options.get("color").value;
  },

  eventNamespace: function () {
    return "OverlandMeasureTemplateTool";
  },

  enable: function () {

    var self = this;
    var board = this.board;

    board.event_manager.on('mousemove.' + this.eventNamespace(), function (mapEvt) {
      self.cursor = mapEvt.mapPoint;
    });

    board.event_manager.on('dragstart.' + this.eventNamespace(), function (mapEvt) {
      self.template = new OverlandMeasureTemplate(generateActionId(), board, new Vector2(mapEvt.mapPoint[0], mapEvt.mapPoint[1]), self.color, new Vector2(0,0));
      board.templateLayer.addTemplate(self.template);
    });

    board.event_manager.on('drag.' + this.eventNamespace(), function (mapEvt) {
      //console.log(self.template);
      var point = new Vector2(mapEvt.mapPoint[0], mapEvt.mapPoint[1]);
      var delta = point.subtract(self.template.position);
      self.template.setDelta(delta);
    });

    board.event_manager.on('dragstop.' + this.eventNamespace(), function (mapEvt) {
      self.saveAction();
    });
  },

  disable: function () {
    this.board.event_manager.off('.' + this.eventNamespace());
  },

  saveAction: function () {
    if (this.template) {
      var action = { actionType: "overlandMeasureTemplateAction", position: this.template.position.toArray(), delta: this.template.delta.toArray(), color: this.color, uid: generateActionId() };
      var undoAction = { actionType: "removeTemplateAction", actionId: action.uid, uid: generateActionId() };

      this.board.templateLayer.removeTemplate(this.template.uid);
      this.template = null;
      this.board.addAction(action, undoAction, true);
    }
  },

  draw: function () {
    if (this.cursor == null) {
      return;
    }

    // var template = Geometry.getReachCells(this.cursor, this.size, this.reach, this.board.drawing.cellSize);
    // var creature_border = Geometry.getBorder(template.threat, this.board.drawing.cellSize);
    //
    // this.board.drawing.drawTemplate(template.threat, creature_border, this.color);
  }
});