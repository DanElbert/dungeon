import { DrawTool } from "./Drawing";
import { Tool } from "./Tool";
import { PenDrawing } from "../drawing_objects";
import { ShapeTool } from "./Shape";
import { generateActionId } from "../Actions";
import simplify from "simplify-js";

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
    return new PenDrawing(generateActionId(), this.board, this.pointBuffer, this.width, "black");
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
      self.pointBuffer = [];
    });
  }
  disable() {
    super.disable();
    this.clearCursor();
  }
  draw() {

    var cursorColor = "#FFFFFF";

    if (this.pointBuffer.length > 0) {
      cursorColor = "#000000";
    }

    if (this.cursor) {
      this.board.drawing.drawCircle(this.cursor[0], this.cursor[1], this.width / 2, 2, cursorColor);
      this.board.drawing.drawCircle(this.cursor[0], this.cursor[1], 2, 1, cursorColor, cursorColor);
    }
  }
  saveAction() {
    if (this.pointBuffer.length > 0) {
      var action = {actionType: "addFogPenAction", version: 1, width: this.width, points: simplify(this.pointBuffer, 1, true).map(p => [p.x, p.y]), uid: generateActionId()};
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
    return "AddFogRectangle";
  }
  isFog() {
    return true;
  }
  buildOptions() {
    super.buildOptions();
    for (let o of this.options) {
      if (o.name !== "shape") {
        //o.visible = false;
      }
    }
  }

  get backgroundColor() {
    return "#000000";
  }

  set backgroundColor(v) {}

  get color() {
    return "#000000";
  }

  set color(v) {}

  get width() {
    return 2;
  }

  set width(v) {}
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
    return new PenDrawing(generateActionId(), this.board, this.pointBuffer, this.width, -1);
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
      self.pointBuffer = [];
    });
  }
  disable() {
    super.disable();
    this.clearCursor();
  }
  draw() {

    var cursorColor = "#FFFFFF";

    if (this.pointBuffer.length > 0) {
      cursorColor = "#000000";
    }

    if (this.cursor) {
      this.board.drawing.drawCircle(this.cursor[0], this.cursor[1], this.width / 2, 2, cursorColor);
      this.board.drawing.drawCircle(this.cursor[0], this.cursor[1], 2, 1, cursorColor, cursorColor);
    }
  }
  saveAction() {
    if (this.pointBuffer.length > 0) {
      var action = {actionType: "removeFogPenAction", version: 1, width: this.width, points: simplify(this.pointBuffer, 1, true).map(p => [p.x, p.y]), uid: generateActionId()};
      var undoAction = {actionType: "removeFogAction", actionId: action.uid, uid: generateActionId()};
      this.board.addAction(action, undoAction, true);
    }
  }
}
