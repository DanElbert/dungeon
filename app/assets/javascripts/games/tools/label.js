function LabelTool(board) {
  Tool.call(this, board);
  this.super = Tool.prototype;
  this.color = null;
  this.cursor = null;
  this.shiftDown = false;
  this.ctrlDown = false;
  this.textLocation = null;
  this.textBox = null;
  this.textBounds = null;
}
LabelTool.prototype = _.extend(LabelTool.prototype, Tool.prototype, {
  buildOptions: function() {
    this.options.add({type: "color", name: "color", label: "Color", value: "#000000"});
  },

  optionsChanged: function() {
    this.color = this.options.get("color").value;
  },
  enable: function() {
    var self = this;
    var board = this.board;

    $(board.event_manager).on('click.LabelTool', function(evt, mapEvt) {
      if (self.textBox) {
        self.save();
      } else {
        self.textLocation = self.getPoint(mapEvt.mapPoint);

        self.textBox = $("<input type='text' />")
            .css({
              position: 'fixed',
              top: '-200px',
              left: '0px',
              'z-index': 99999
            })
            .focusout(function() {
              self.save();
            })
            .keydown(function(e) {
              if (e.keyCode == 13) { //enter
                self.save();
                return false;
              } else if (e.keyCode == 27) { // Esc
                self.clear();
                return false;
              }
              return true;
            })
            .appendTo("body")
            .focus();
      }
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
    if (this.textBox) {
      var txt = this.textBox.val();
      var seconds = parseInt(new Date().getTime() / 1000);
      var outlineColor = "rgba(255, 255, 255, 0.25";
      if ((seconds % 2) == 0) {
        outlineColor = "rgba(0, 0, 0, 1.0)";
      }
      this.textBounds = this.board.drawing.drawLabel(this.textLocation, txt, this.color, outlineColor, "rgba(255, 255, 255, 0.25");
    }

    if (this.cursor) {
      this.drawCross(this.cursor);
    }
  },

  save: function() {
    if (this.textBox) {

      var txt = this.textBox.val();
      var action = {
        actionType: "labelAction",
        point: this.textLocation,
        color: this.color,
        text: txt,
        bound: this.textBounds,
        uid: generateActionId()};

      var undoAction = {actionType: "removeDrawingAction", actionId: action.uid, uid: generateActionId()};

      this.board.addAction(action, undoAction, true);
    }

    this.clear();
  },

  clear: function() {
    if (this.textBox) {
      this.textBox.remove();
      this.textBox = null;
    }
    this.textLocation = null;
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
  }
});