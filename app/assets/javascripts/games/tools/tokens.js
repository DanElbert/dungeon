function TokenTool(manager) {
  Tool.call(this, manager);
  this.super = Tool.prototype;
  this.color = null;
  this.fontColor = null;
  this.fontSize = null;
  this.text = null;
  this.cell = null;

  this.textBounds = null;
}
TokenTool.prototype = _.extend(TokenTool.prototype, Tool.prototype, {
  buildOptions: function() {
    this.options.add({type: "color", name: "color", label: "Color", value: "#FFFFFF"});
    this.options.add({type: "color", name: "fontColor", label: "Font Color", value: "#000000"});
    this.options.add({type: "size", name: "fontSize", label: "Size", sizes: [12, 18, 24, 30, 40], value: 24});
    this.options.add({type: "text", name: "text", label: "Text", value: "", width: 'narrow'});
  },

  optionsChanged: function() {
    this.color = this.options.get("color").value;
    this.fontColor = this.options.get("fontColor").value;
    this.fontSize = this.options.get("fontSize").value;
    this.text = this.options.get("text").value;

  },
  enable: function() {
    var self = this;
    var board = this.board;

    $(board.event_manager).on('click.TokenTool', function(evt, mapEvt) {
      self.cell = mapEvt.mapPointCell;
      self.draw();
      self.save();
    });

    $(board.event_manager).on('mousemove.TokenTool', function(evt, mapEvt) {
      self.cell = mapEvt.mapPointCell;
    });

    // $(board.event_manager).on('keydown.TokenTool', function(evt, mapEvt) {
    //   self.shiftDown = mapEvt.isShift;
    //   self.ctrlDown = mapEvt.isCtrl;
    // });
    //
    // $(board.event_manager).on('keyup.TokenTool', function(evt, mapEvt) {
    //   self.shiftDown = mapEvt.isShift;
    //   self.ctrlDown = mapEvt.isCtrl;
    // });
  },
  disable: function() {
    $(this.board.event_manager).off(".TokenTool");
    this.clear();
  },
  draw: function() {
    if (this.cell) {
      this.board.drawing.drawToken(this.cell[0], this.cell[1], 1, 1, this.color, this.text, this.fontColor, this.fontSize);
    }


  },

  save: function() {
    if (this.cursor && this.text && this.text.length) {

      var action = {
        actionType: "labelAction",
        point: this.cursor,
        color: this.color,
        backgroundColor: this.backgroundColor,
        fontSize: this.fontSize,
        text: this.text,
        bound: this.textBounds,
        uid: generateActionId()};

      var undoAction = {actionType: "removeDrawingAction", actionId: action.uid, uid: generateActionId()};

      //this.board.addAction(action, undoAction, true);
    }

    this.clear();
  },

  clear: function() {
    this.cursor = null;
  },

  drawCross: function(point) {
    var crossSize = 10;
    var lines = [
      {start: [point[0] - crossSize, point[1]], end: [point[0] + crossSize, point[1]]},
      {start: [point[0], point[1] - crossSize], end: [point[0], point[1] + crossSize]}
    ];
    this.board.drawing.drawLines("black", 3, lines);
  }
});