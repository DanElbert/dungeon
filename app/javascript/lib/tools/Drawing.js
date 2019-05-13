import { Tool } from "./Tool";
import { generateActionId } from "../Actions";

export class DrawTool extends Tool {
  constructor(manager) {
    super(manager);

    this.lineBuffer = [];
    this.drawingObject = null;
    this.previous_point = null;
    this.cursor = null;
  }

  eventNamespace() { return "Drawing"; }
  minimumLineDistance() { return 0; }
  saveAction() { }
  isFog() { return false; }
  createDrawingObject() { }
  handleMouseMove(location) {
    location = this.roundPoint(location);
    if (this.previous_point == null) {
      this.previous_point = location;
    }

    var distance = Geometry.getDistance(this.previous_point, location);

    if (distance >= this.minimumLineDistance()) {
      this.lineBuffer.push({start: this.previous_point, end: location});
      this.drawingObject.setLines(this.lineBuffer);
      this.previous_point = location;
    }
  }
  ensureDrawingObject() {
    if (this.drawingObject === null) {
      this.drawingObject = this.createDrawingObject();
      if (this.isFog()) {
        this.board.drawingLayer.addFogAction(this.drawingObject);
      } else {
        this.board.drawingLayer.addAction(this.drawingObject);
      }
    }
  }
  enable() {
    var self = this;
    this.board.event_manager.on('dragstart.' + this.eventNamespace(), function(mapEvt) {
      self.previous_point = null;
      self.ensureDrawingObject();
      self.handleMouseMove(mapEvt.mapPoint);
    });

    this.board.event_manager.on('mousemove.' + this.eventNamespace(), function(mapEvt) {
      self.cursor = mapEvt.mapPoint;
    });

    this.board.event_manager.on('drag.' + this.eventNamespace(), function(mapEvt) {
      self.handleMouseMove(mapEvt.mapPoint);
    });

    this.board.event_manager.on('dragstop.' + this.eventNamespace(), function(mapEvt) {
      self.saveAction();
      self.lineBuffer = [];
      self.removeDrawingObject();
    });
  }

  disable() {
    this.saveAction();
    this.removeDrawingObject();
    this.lineBuffer = [];
    this.board.event_manager.off("." + this.eventNamespace());
  }

  removeDrawingObject() {
    if (this.drawingObject) {
      this.board.drawingLayer.removeAction(this.drawingObject.uid);
      this.drawingObject = null;
    }
  }
}

export class Pen extends DrawTool {
  constructor(board) {
    super(board);
    this.width = null;
    this.color = null;
    this.backgroundColor = null;
  }

  buildOptions() {
    this.options.add(this.toolManager.sharedTool("drawingColor"));
    this.options.add(this.toolManager.sharedTool("drawingWidth"));
  }

  optionsChanged() {
    this.width = this.options.get("width").value;
    this.color = this.options.get("color").value;
  }
  minimumLineDistance() { return this.width / 2; }
  eventNamespace() { return "Pen"; }
  createDrawingObject() {
    return new PenDrawing(generateActionId(), this.board, this.lineBuffer, this.width, this.color, this.board.pcMode);
  }
  draw() {
    if (this.cursor) {
      this.board.drawing.drawCircle(this.cursor[0], this.cursor[1], this.width / 2, 2, this.color, this.color)
    }
  }
  saveAction() {
    if (this.lineBuffer.length > 0) {
      var action = {actionType: "penAction", isPcLayer: this.board.pcMode, color: this.color, width: this.width, lines: this.lineBuffer, uid: generateActionId()};
      var undoAction = {actionType: "removeDrawingAction", actionId: action.uid, uid: generateActionId()};
      this.board.addAction(action, undoAction, true);
    }
  }
}


export class Eraser extends DrawTool {
  constructor(manager) {
    super(manager);
    this.width = null;
  }

  buildOptions() {
    this.options.add({type: "size", name: "width", label: "Width", sizes: [20, 50, 75, 100, 150, 200], value: 75 });
  }

  optionsChanged() {
    this.width = this.options.get("width").value;
  }
  minimumLineDistance() { return 0; }
  eventNamespace() { return "Eraser"; }
  createDrawingObject() {
    return new PenDrawing(generateActionId(), this.board, this.lineBuffer, this.width, -1, this.board.pcMode);
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
      this.board.drawing.drawCross(this.cursor[0], this.cursor[1], 5, 3, cursorColor);
    }
  }
  saveAction() {
    if (this.lineBuffer.length > 0) {
      var action = {actionType: "eraseAction", isPcLayer: this.board.pcMode, width: this.width, lines: this.lineBuffer, uid: generateActionId()};
      var undoAction = {actionType: "removeDrawingAction", actionId: action.uid, uid: generateActionId()};
      this.board.addAction(action, undoAction, true);
    }
  }
}


