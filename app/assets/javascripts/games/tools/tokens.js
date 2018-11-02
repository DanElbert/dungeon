function TokenTool(manager) {
  Tool.call(this, manager);
  this.super = Tool.prototype;
  this.color = null;
  this.fontColor = null;
  this.fontSize = null;
  this.text = null;
  this.cell = null;

  this.editingToken = null;

  this.dragStart = null;
  this.dragEnd = null;
}
TokenTool.prototype = _.extend(TokenTool.prototype, Tool.prototype, {
  buildOptions: function() {
    var self = this;
    this.options.add({type: "color", name: "color", label: "Color", value: "#FFFFFF"});
    this.options.add({type: "tokenSize", name: "size", label: "Token Size", value: "1"});
    this.options.add({type: "color", name: "fontColor", label: "Font Color", value: "#000000"});
    this.options.add({type: "size", name: "fontSize", label: "Font Size", sizes: [12, 18, 24, 30, 40], value: 24});
    this.options.add({type: "text", name: "text", label: "Text", value: "", width: 'narrow'});
    this.options.add({type: "command", name: "save", label: "Update", visible: false, command: function() { self.update(); }});
    this.options.add({type: "command", name: "delete", label: "Remove", visible: false, command: function() { self.delete(); }});
  },

  optionsChanged: function() {
    this.color = this.options.get("color").value;
    this.fontColor = this.options.get("fontColor").value;
    this.fontSize = this.options.get("fontSize").value;
    this.text = this.options.get("text").value;
    this.size = parseInt(this.options.get("size").value);
    if (this.board.invalidate) {
      this.board.invalidate();
    }
  },
  enable: function() {
    var self = this;
    var board = this.board;

    board.event_manager.on('click.TokenTool', function(mapEvt) {

      var t = board.tokenLayer.tokenAtCell(mapEvt.mapPointCell);

      if (t !== null) {
        self.editToken(t);
      } else if (self.editingToken !== null) {
        self.editToken(null);
        self.cell = mapEvt.mapPointCell;
      } else {
        self.cell = mapEvt.mapPointCell;
        self.save();
      }

      self.draw();
    });

    board.event_manager.on('mousemove.TokenTool', function(mapEvt) {
      if (self.editingToken === null) {
        self.cell = mapEvt.mapPointCell;
      }
    });

    board.event_manager.on('dragstart.TokenTool', function(mapEvt) {
      
      var t = null;
      
      if (self.editingToken !== null) {
        if ((mapEvt.mapPointCell[0] >= self.editingToken.cell[0] && mapEvt.mapPointCell[0] < self.editingToken.cell[0] + self.editingToken.width) && (mapEvt.mapPointCell[1] >= self.editingToken.cell[1] && mapEvt.mapPointCell[1] < self.editingToken.cell[1] + self.editingToken.height)) {
          t = self.editingToken;
        }
      }

      if (t === null) {
        t = board.tokenLayer.tokenAtCell(mapEvt.mapPointCell);
      }
      
      if (t !== null) {
        if (self.editingToken === null || self.editingToken.uid !== t.uid) {
          self.editToken(t);
        }
        self.dragStart = mapEvt.mapPointCell;
        self.dragEnd = self.dragStart;
      }
    });

    board.event_manager.on('drag.TokenTool', function(mapEvt) {
      self.dragEnd = mapEvt.mapPointCell;
    });

    board.event_manager.on('dragstop.TokenTool', function(mapEvt) {
      self.move();
      self.dragStart = null;
      self.dragEnd = null;
    });

    this.board.event_manager.on('keydown.TokenTool', function(mapEvt) {

      if (self.editingToken && (mapEvt.key === 8 || mapEvt.key === 46)) {
        self.delete();
      }

    });
  },
  disable: function() {
    this.board.event_manager.off(".TokenTool");
    this.clear();
  },
  draw: function() {
    if (this.cell) {
      var borderColor = null;

      if (this.editingToken !== null) {
        borderColor = this.color === "#000000" ? "#FFFFFF" : 'black';
      }

      this.board.drawing.drawToken(this.cell[0], this.cell[1], this.size, this.size, this.color, this.text, this.fontColor, this.fontSize, borderColor);
    }

    if (this.anyDrag()) {
      var deltaX = this.dragEnd[0] - this.dragStart[0];
      var deltaY = this.dragEnd[1] - this.dragStart[1];

      var t = this.editingToken;
      this.board.drawing.drawToken(t.cell[0] + deltaX, t.cell[1] + deltaY, this.size, this.size, this.color, this.text, this.fontColor, this.fontSize, borderColor);

      var template = Geometry.getMovementPath(this.dragStart, this.dragEnd);
      var border = Geometry.getBorder(template, this.board.drawing.cellSize);

      this.board.drawing.drawTemplate(template, border, 'white');
      this.board.drawing.drawMovementLine(this.dragStart, this.dragEnd);
    }
  },

  editToken: function(t) {

    if (this.editingToken !== null) {
      this.board.tokenLayer.addToken(this.editingToken);
    }

    if (t !== null) {
      this.board.tokenLayer.removeToken(t.uid);
      this.options.get("color").value = t.color;
      this.options.get("fontColor").value = t.fontColor;
      this.options.get("fontSize").value = t.fontSize;
      this.options.get("text").value = t.text;
      this.options.get("size").value = t.width.toString();
      this.options.get("save").visible = true;
      this.options.get("delete").visible = true;
      this.cell = t.cell;
    } else {
      this.options.get("color").value = "#FFFFFF";
      this.options.get("fontColor").value = "#000000";
      this.options.get("fontSize").value = 24;
      this.options.get("text").value = "";
      this.options.get("size").value = "1";
      this.options.get("save").visible = false;
      this.options.get("delete").visible = false
    }

    this.editingToken = t;
    this.toolManager.setOptions();
  },

  save: function() {
    if (this.cell) {

      var action = {
        actionType: "addTokenAction",
        cell: this.cell,
        height: this.size,
        width: this.size,
        color: this.color,
        fontSize: this.fontSize,
        fontColor: this.fontColor,
        text: this.text,
        uid: generateActionId()};

      var undoAction = {actionType: "removeTokenAction", actionId: action.uid, uid: generateActionId()};

      this.board.addAction(action, undoAction, true);
    }

    this.clear();
  },

  update: function() {
    if (this.editingToken) {
      var addNewTokenAction = {
        actionType: "addTokenAction",
        cell: this.cell,
        height: this.size,
        width: this.size,
        color: this.color,
        fontSize: this.fontSize,
        fontColor: this.fontColor,
        text: this.text,
        uid: generateActionId()};

      var removeOldTokenAction = {
        actionType: "removeTokenAction",
        actionId: this.editingToken.uid,
        uid: generateActionId()
      };

      var removeNewTokenAction = {
        actionType: "removeTokenAction",
        actionId: addNewTokenAction.uid,
        uid: generateActionId()
      };

      var restoreOldToken = this.editingToken;
      restoreOldToken.uid = generateActionId();

      this.board.addAction(
        {actionType: "compositeAction", actionList: [removeOldTokenAction, addNewTokenAction]},
        {actionType: "compositeAction", actionList: [removeNewTokenAction, restoreOldToken]},
        true);

      this.editingToken = null;
      this.clear();
    }
  },

  delete: function() {
    if (this.editingToken) {
      var removeAction = {actionType: "removeTokenAction", actionId: this.editingToken.uid, uid: generateActionId()};
      var undoAction = this.editingToken;
      undoAction.uid = generateActionId();

      this.board.addAction(removeAction, undoAction, true);

      this.editingToken = null;
      this.clear();
    }
  },

  move: function() {
    if (this.anyDrag()) {
      var deltaX = this.dragEnd[0] - this.dragStart[0];
      var deltaY = this.dragEnd[1] - this.dragStart[1];

      this.cell = [this.cell[0] + deltaX, this.cell[1] + deltaY];
      this.update();
    }
  },

  anyDrag: function() {
    if (this.editingToken !== null && this.dragStart !== null && this.dragEnd !== null) {
      if (this.dragStart[0] !== this.dragEnd[0] || this.dragStart[1] !== this.dragEnd[1]) {
        return true;
      }
    }
    return false;
  },

  clear: function() {
    this.editToken(null);
    this.cell = null;
  }
});