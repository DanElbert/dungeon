import { DragDeleteItem } from "./DragDeleteItem";
import { Tool } from "./Tool";
import { Geometry, Vector2 } from "../geometry";
import { generateActionId } from "../Actions";
import { TokenDrawing } from "../drawing_objects";

export class TokenTool extends Tool {
  constructor(manager) {
    super(manager);

    this.currentToken = null;
    this.cursor = [0,0];

    this.dragDeleteItem = new DragDeleteItem(this, this.board, "Tokens");
    this.dragDeleteItem.enableInstantDrag();
    this.dragDeleteItem.on("selected", () => this.suspendDrawing());
    this.dragDeleteItem.on("unselected", () => this.resumeDrawing());  
  }

  buildOptions() {
    var self = this;
    this.options.add({type: "tokenImage", name: "image", label: "Image", images: [], campaign_id: -1, isOwner: false, value: null});
    this.options.add({type: "color", name: "color", label: "Color", value: "#1CAC78"});
    this.options.add({type: "tokenSize", name: "size", label: "Token Size", value: "1"});
    this.options.add({type: "color", name: "fontColor", label: "Font Color", value: "#000000"});
    this.options.add({type: "size", name: "fontSize", label: "Font Size", sizes: [12, 18, 24, 30, 40], value: 24});
    this.options.add({type: "text", name: "totalHp", label: "Hit Points", value: 0, width: 'narrow'});
    this.options.add({type: "text", name: "text", label: "Text", value: "", width: '', placeholder: 'Token Label'});
  }

  optionsChanged() {
    if (this.currentToken) {
      this.syncCurrentToken();
    }
  }

  createCurrentToken() {
    if (this.currentToken === null) {
      this.currentToken = new TokenDrawing(generateActionId(), this.board, new Vector2(0, 0), 1, "#000000", "#FFFFFF", 20, "", null, 0, 0, []);
      this.currentToken.selectable = false;
      this.board.tokenLayer.addToken(this.currentToken);
    }
    this.syncCurrentToken();
  }

  syncCurrentToken() {
    const img = this.options.get("image").value;
    const hp = parseInt(this.options.get("totalHp").value) | 0;
    this.currentToken.updateProperties({
      position: new Vector2(this.cursor),
      tokenCellSize: parseInt(this.options.get("size").value),
      color: this.options.get("color").value,
      fontColor: this.options.get("fontColor").value,
      fontSize: this.options.get("fontSize").value,
      text: this.options.get("text").value,
      imageUrl: img ? img.raw_url : null,
      totalHp: hp,
      currentHp: hp
    })
  }

  enable() {
    var self = this;
    var board = this.board;

    this.options.get("image").images = this.board.token_images;
    this.options.get("image").campaign_id = this.board.campaign_id;
    this.options.get("image").isOwner = this.board.isOwner;
    this.options.get("totalHp").visible = this.board.isOwner;

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

