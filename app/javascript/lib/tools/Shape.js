import { Geometry, Vector2 } from "../geometry";
import { Tool } from "./Tool";
import { feetToText } from "../Formatting";
import { generateActionId } from "../Actions";
import { CircleDrawing, LineDrawing, SquareDrawing } from "../drawing_objects";

export class ShapeTool extends Tool {
  constructor(manager) {
    super(manager);

    this.width = null;
    this.color = null;
    this.backgroundColor = null;
    this.shape = null;

    this.shiftDown = false;
    this.ctrlDown = false;

    this.mousePosition = null;

    this.drawingObject = null;
  }

  buildOptions() {
    this.options.add({type: "shapes", label: "Shape", name: "shape", value: "rectangle"});
    this.options.add(this.toolManager.sharedTool("drawingColor"));
    this.options.add(this.toolManager.sharedTool("drawingBackgroundColor"));
    this.options.add(this.toolManager.sharedTool("drawingWidth"));
  }

  optionsChanged() {
    this.width = this.options.get("width").value;
    this.color = this.options.get("color").value;
    this.shape = this.options.get("shape").value;
    if (this.options.get("backgroundColor")) {
      this.backgroundColor = this.options.get("backgroundColor").value;
    }
  }

  getPoint(mapPoint) {
    if (this.shiftDown && this.ctrlDown) {
      return Geometry.getNearestHalfCellSnap(mapPoint, this.board.drawing.cellSize);
    } else if (this.shiftDown) {
      return Geometry.getNearestCellIntersection(mapPoint, this.board.drawing.cellSize);
    } else if (this.ctrlDown) {
      return Geometry.getNearestCellCenter(mapPoint, this.board.drawing.cellSize);
    } else {
      return mapPoint;
    }
  }

  isFog() {
    return false;
  }

  eventNamespace() {
    return "ShapePen";
  }

  get cursor() {
    if (this.mousePosition) {
      return this.getPoint(this.mousePosition);
    } else {
      return null;
    }
  }

  enable() {

    var self = this;
    var board = this.board;

    board.event_manager.on('keydown.' + this.eventNamespace(), function(mapEvt) {
      self.shiftDown = mapEvt.isShift;
      self.ctrlDown = mapEvt.isCtrl;
    });

    board.event_manager.on('keyup.' + this.eventNamespace(), function(mapEvt) {
      self.shiftDown = mapEvt.isShift;
      self.ctrlDown = mapEvt.isCtrl;
    });

    board.event_manager.on('mousemove.' + this.eventNamespace(), function(mapEvt) {
      self.mousePosition = mapEvt.mapPoint;
    });

    board.event_manager.on('dragstart.' + this.eventNamespace(), function(mapEvt) {
      self.ensureDrawingObject(mapEvt.mapPoint);
      self.handleMouseMove(mapEvt.mapPoint);
    });

    board.event_manager.on('drag.' + this.eventNamespace(), function(mapEvt) {
      self.handleMouseMove(mapEvt.mapPoint);
    });

    board.event_manager.on('dragstop.' + this.eventNamespace(), function(mapEvt) {
      self.saveAction();
      self.removeDrawingObject();
    });
  }

  disable() {
    this.saveAction();
    this.removeDrawingObject();
    this.board.event_manager.off('.' + this.eventNamespace());
  }

  drawCross(point) {
    var crossSize = 10;
    var lines = [
      {start: [point[0] - crossSize, point[1]], end: [point[0] + crossSize, point[1]]},
      {start: [point[0], point[1] - crossSize], end: [point[0], point[1] + crossSize]}
    ];
    this.board.drawing.drawLines("black", 3, lines);
  }

  handleMouseMove(location) {
    location = this.roundPoint(this.getPoint(location));
    this.drawingObject.updateFromCursorPosition(new Vector2(location));
  }

  ensureDrawingObject(point) {
    if (this.drawingObject === null) {
      this.drawingObject = this.createDrawingObject(point);
      this.drawingObject.setMeasure(true);
      if (this.isFog()) {
        this.board.drawingLayer.addFogAction(this.drawingObject);
      } else {
        this.board.drawingLayer.addAction(this.drawingObject);
      }
    }
  }

  removeDrawingObject() {
    if (this.drawingObject) {
      this.board.drawingLayer.removeAction(this.drawingObject.uid);
      this.drawingObject = null;
    }
  }

  createDrawingObject(point) {
    const position = new Vector2(this.roundPoint(this.getPoint(point)));
    switch(this.shape) {
      case "rectangle":
        return new SquareDrawing(generateActionId(), this.board, this.board.pcMode, position, this.color, this.backgroundColor, this.width, new Vector2(0,0));
      case "circle":
        return new CircleDrawing(generateActionId(), this.board, this.board.pcMode, position, this.color, this.backgroundColor, this.width, 0);
      case "line":
        return new LineDrawing(generateActionId(), this.board, this.board.pcMode, position, this.color, this.backgroundColor, this.width, position);
    }
  }

  saveAction() {
    if (this.drawingObject) {
      const action = this.drawingObject.toAction(generateActionId());
      if (this.isFog()) {
        action.isFog = true;
      }
      const undoAction = {actionType: "removeDrawingAction", actionId: action.uid, uid: generateActionId()};
      this.board.addAction(action, undoAction, true);

      this.removeDrawingObject();
    }
  }

  draw() {
    if (this.cursor) {
      this.drawCross(this.cursor);
    }
  }
}

