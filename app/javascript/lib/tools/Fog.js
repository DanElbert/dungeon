import { DrawTool } from "./Drawing";
import { Tool } from "./Tool";
import { PenDrawing } from "../drawing_objects";
import { ShapeTool } from "./Shape";
import { generateActionId } from "../Actions";

export class AddFogPen extends DrawTool {
  constructor(manager) {
    super(manager);
    this.width = null;
  }

  buildOptions() {
    this.options.add(this.toolManager.sharedTool("fogWidth"));
  }

  optionsChanged() {
    this.width = this.options.get("width").value;
  }
  minimumLineDistance() { return Math.min(5, this.width / 2); }
  eventNamespace() { return "AddFog"; }
  isFog() { return true; }
  createDrawingObject() {
    return new PenDrawing(generateActionId(), this.board, this.lineBuffer, this.width, "black");
  }
  enable() {
    super.enable();
    this.setCursor('none');
    var self = this;
    this.board.event_manager.on('click.' + this.eventNamespace(), function(mapEvt) {
      self.previous_point = null;
      self.ensureDrawingObject();
      self.handleMouseMove(mapEvt.mapPoint);
      self.saveAction();
      self.lineBuffer = [];
    });
  }
  disable() {
    super.disable();
    this.clearCursor();
  }
  draw() {

    var cursorColor = "#FFFFFF";

    if (this.lineBuffer.length > 0) {
      cursorColor = "#000000";
    }

    if (this.cursor) {
      this.board.drawing.drawCircle(this.cursor[0], this.cursor[1], this.width / 2, 2, cursorColor);
      this.board.drawing.drawCircle(this.cursor[0], this.cursor[1], 2, 1, cursorColor, cursorColor);
    }
  }
  saveAction() {
    if (this.lineBuffer.length > 0) {
      var action = {actionType: "addFogPenAction", width: this.width, lines: this.lineBuffer, uid: generateActionId()};
      var undoAction = {actionType: "removeFogAction", actionId: action.uid, uid: generateActionId()};
      this.board.addAction(action, undoAction, true);
    }
  }
}

export class AddFogRectangle extends ShapeTool {
  constructor(manager) {
    super(manager);
  }

  eventNamespace() {
    return "ShapePen";
  }
  isFog() {
    return true;
  }
  buildOptions() {
    super.buildOptions();
    for (let o of this.options) {
      o.visible = false;
    }
  }
}


export class RemoveFogPen extends DrawTool {
  constructor(manager) {
    super(manager);
    this.width = null;
  }

  buildOptions() {
    this.options.add(this.toolManager.sharedTool("fogWidth"));
  }

  optionsChanged() {
    this.width = this.options.get("width").value;
  }
  minimumLineDistance() { return Math.min(5, this.width / 2); }
  eventNamespace() { return "AddFog"; }
  isFog() { return true; }
  createDrawingObject() {
    return new PenDrawing(generateActionId(), this.board, this.lineBuffer, this.width, -1);
  }
  enable() {
    super.enable();
    this.setCursor('none');
    var self = this;
    this.board.event_manager.on('click.' + this.eventNamespace(), function(mapEvt) {
      self.previous_point = null;
      self.ensureDrawingObject();
      self.handleMouseMove(mapEvt.mapPoint);
      self.saveAction();
      self.lineBuffer = [];
    });
  }
  disable() {
    super.disable();
    this.clearCursor();
  }
  draw() {

    var cursorColor = "#FFFFFF";

    if (this.lineBuffer.length > 0) {
      cursorColor = "#000000";
    }

    if (this.cursor) {
      this.board.drawing.drawCircle(this.cursor[0], this.cursor[1], this.width / 2, 2, cursorColor);
      this.board.drawing.drawCircle(this.cursor[0], this.cursor[1], 2, 1, cursorColor, cursorColor);
    }
  }
  saveAction() {
    if (this.lineBuffer.length > 0) {
      var action = {actionType: "removeFogPenAction", width: this.width, lines: this.lineBuffer, uid: generateActionId()};
      var undoAction = {actionType: "removeFogAction", actionId: action.uid, uid: generateActionId()};
      this.board.addAction(action, undoAction, true);
    }
  }
}
