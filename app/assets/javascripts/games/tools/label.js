function LabelTool(manager) {
  Tool.call(this, manager);
  this.super = Tool.prototype;
  this.color = null;
  this.backgroundColor = null;
  this.fontSize = null;
  this.text = null;
  this.cursor = null;
  this.shiftDown = false;
  this.ctrlDown = false;
  this.textBounds = null;
}
LabelTool.prototype = _.extend(LabelTool.prototype, Tool.prototype, {
  buildOptions: function() {
    this.options.add({type: "color", name: "color", label: "Color", value: "#000000"});
    this.options.add({type: "color", name: "backgroundColor", label: "Background Color", value: "#FFFFFF"});
    this.options.add({type: "size", name: "fontSize", label: "Size", sizes: [12, 18, 24, 30, 40, 50], value: 24});
    this.options.add({type: "text", name: "text", label: "Text", value: ""});
  },

  optionsChanged: function() {
    this.color = this.options.get("color").value;
    this.fontSize = this.options.get("fontSize").value;
    this.text = this.options.get("text").value;

    var bg = this.hexToRgb(this.options.get("backgroundColor").value);
    this.backgroundColor = "rgba(" + bg.r + ", " + bg.g + ", " + bg.b + ", 0.25)";

  },
  enable: function() {
    var self = this;
    var board = this.board;

    $(board.event_manager).on('click.LabelTool', function(evt, mapEvt) {
      self.cursor = self.getPoint(mapEvt.mapPoint);
      self.draw();
      self.save();
    });

    $(board.event_manager).on('mousemove.LabelTool', function(evt, mapEvt) {
      self.cursor = self.getPoint(mapEvt.mapPoint);
    });

    $(board.event_manager).on('keydown.LabelTool', function(evt, mapEvt) {
      self.shiftDown = mapEvt.isShift;
      self.ctrlDown = mapEvt.isCtrl;
    });

    $(board.event_manager).on('keyup.LabelTool', function(evt, mapEvt) {
      self.shiftDown = mapEvt.isShift;
      self.ctrlDown = mapEvt.isCtrl;
    });
  },
  disable: function() {
    $(this.board.event_manager).off(".LabelTool");
    this.clear();
  },
  draw: function() {
    if (this.cursor && this.text && this.text.length) {
      this.textBounds = this.board.drawing.drawLabel(this.cursor, this.text, this.color, "rgba(0, 0, 0, 1.0)", this.backgroundColor, this.fontSize);
    }

    if (this.cursor) {
      this.drawCross(this.cursor);
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

      this.board.addAction(action, undoAction, true);
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
  },

  getPoint: function(mapPoint) {
    if (this.shiftDown) {
      return Geometry.getNearestCellIntersection(mapPoint, this.board.drawing.cellSize);
    } else if (this.ctrlDown) {
      return Geometry.getNearestCellCenter(mapPoint, this.board.drawing.cellSize);
    } else {
      return mapPoint;
    }
  },

  hexToRgb: function(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
      return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }
});