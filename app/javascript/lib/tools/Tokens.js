import { DragDeleteItem } from "./DragDeleteItem";
import { Tool } from "./Tool";
import { generateActionId } from "../Actions";

export class TokenTool extends Tool {
  constructor(manager) {
    super(manager);

    this.currentToken = null;
    this.cursor = [0,0];

    this.dragDeleteItem = new DragDeleteItem(this, this.board, "Tokens");
    this.dragDeleteItem.on("selected", () => this.suspendDrawing());
    this.dragDeleteItem.on("unselected", () => this.resumeDrawing());  
  }

  buildOptions() {
    var self = this;
    this.options.add({type: "color", name: "color", label: "Color", value: "#1CAC78"});
    this.options.add({type: "tokenSize", name: "size", label: "Token Size", value: "1"});
    this.options.add({type: "color", name: "fontColor", label: "Font Color", value: "#000000"});
    this.options.add({type: "size", name: "fontSize", label: "Font Size", sizes: [12, 18, 24, 30, 40], value: 24});
    this.options.add({type: "text", name: "text", label: "Text", value: "", width: 'narrow'});
  }

  optionsChanged() {
    if (this.currentToken) {
      this.syncCurrentToken();
    }
  }

  createCurrentToken() {
    if (this.currentToken === null) {
      this.currentToken = new TokenDrawing(generateActionId(), this.board, new Vector2(0, 0), 1, "#000000", "#FFFFFF", 20, "");
      this.currentToken.selectable = false;
      this.board.tokenLayer.addToken(this.currentToken);
    }
    this.syncCurrentToken();
  }

  syncCurrentToken() {
    this.currentToken.updateProperties({
      position: new Vector2(this.cursor),
      tokenCellSize: parseInt(this.options.get("size").value),
      color: this.options.get("color").value,
      fontColor: this.options.get("fontColor").value,
      fontSize: this.options.get("fontSize").value,
      text: this.options.get("text").value
    })
  }

  enable() {
    var self = this;
    var board = this.board;

    this.createCurrentToken();

    board.event_manager.on('click.TokenTool', function(mapEvt) {
      self.updateCursor(mapEvt.mapPoint);
      var t = board.tokenLayer.tokenAt(mapEvt.mapPoint);
      var tmp = board.templateLayer.templateAt(mapEvt.mapPoint);

      if (t.length === 0 && tmp.length === 0 && self.dragDeleteItem.selectedItem === null) {
        self.saveAction();
      }
    });

    board.event_manager.on('mousemove.TokenTool', function(mapEvt) {
      self.updateCursor(mapEvt.mapPoint);
    });

    this.dragDeleteItem.enable();

  }

  updateCursor(mapPoint) {
    var cell = Geometry.getCell(mapPoint, this.board.drawingSettings.cellSize);
    this.cursor = [cell[0] * this.board.drawingSettings.cellSize, cell[1] * this.board.drawingSettings.cellSize];
    this.syncCurrentToken();
  }

  disable() {
    this.dragDeleteItem.disable();
    this.board.event_manager.off(".TokenTool");
    this.clear();
  }

  draw() {
    this.dragDeleteItem.draw();
    if (this.cursor) {

    }
  }

  saveAction() {
    var createAction = this.currentToken.toAction();
    var removeAction = { actionType: "removeTokenAction", actionId: this.currentToken.uid, uid: generateActionId() };
    this.clear();
    this.createCurrentToken();

    this.board.addAction(createAction, removeAction, true);
  }

  clear() {
    if (this.currentToken) {
      this.board.tokenLayer.removeToken(this.currentToken.uid);
      this.currentToken = null;
    }
  }

  suspendDrawing() {
    if (this.currentToken) {
      this.board.tokenLayer.removeToken(this.currentToken.uid);
    }
  }

  resumeDrawing() {
    if (this.currentToken) {
      this.board.tokenLayer.addToken(this.currentToken);
    }
  }
}

