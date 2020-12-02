import { Geometry, Rectangle, Vector2} from "../geometry";
import { ImageDrawing } from "../drawing_objects";
import { Tool } from "./Tool";
import { generateActionId } from "../Actions";

export class InsertImageTool extends Tool {
  constructor(manager) {
    super(manager);

    this.cursor = null;
    this.shiftDown = false;
    this.ctrlDown = false;

    this.scale = 1.0;
    this.angle = 0.0;
    this.allowEditing = true;
    this.isEditing = false;
    this.editPosition = null;
    this.editPoint = null;
    this.image = null;
  }

  buildOptions() {
    this.options.add({type: "boolean", label: "Edit Images?", name: "allowEditing", value: true});
    this.options.add({type: "images", label: "Image", name: "image", value: null});
    this.options.add({type: "image-edit-type", label: "Operation", name: "operation", visible: false, value: "move"});
    this.options.add({type: "command", name: "reset", label: "Reset", command: () => { this.scale = 1.0; this.angle = 0.0; }});
    this.options.add({type: "command", name: "save", label: "Insert", visible: false, command: () => { this.saveAction() }});
    this.options.add({type: "command", name: "cancel", label: "Cancel", visible: false, command: () => { this.leaveEditMode() }});
  }

  optionsChanged() {
    this.allowEditing = this.options.get("allowEditing").value;
    this.image = this.options.get("image").value;
    this.cleanImage();
    if (this.image) {
      const pos = this.editPosition || this.cursor || [0,0];
      this.imageDrawing = ImageDrawing.getImageDrawing(
        generateActionId(),
        this.board,
        this.image.url,
        new Vector2(this.image.width, this.image.height),
        new Vector2(pos),
        this.scale,
        this.angle,
        this.board.getLevel().id);
      this.board.drawingLayer.addAction(this.imageDrawing);
    }
  }

  eventNamespace() {
    return "InsertImageTool";
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

  cleanImage() {
    if (this.imageDrawing) {
      this.board.drawingLayer.removeAction(this.imageDrawing.uid);
    }
    this.imageDrawing = null;
  }

  enable() {
    var self = this;
    var board = this.board;

    this.options.get("image").images = this.board.campaign_images;

    board.event_manager.on('keydown.' + this.eventNamespace(), function(mapEvt) {
      self.shiftDown = mapEvt.isShift;
      self.ctrlDown = mapEvt.isCtrl;
      self.cursor = self.getPoint(self.cursor);
    });

    board.event_manager.on('keyup.' + this.eventNamespace(), function(mapEvt) {
      self.shiftDown = mapEvt.isShift;
      self.ctrlDown = mapEvt.isCtrl;
      self.cursor = self.getPoint(self.cursor);
    });

    board.event_manager.on('mousemove.' + this.eventNamespace(), function(mapEvt) {
      self.cursor = self.getPoint(mapEvt.mapPoint);
    });

    this.board.event_manager.on('dragstart.' + this.eventNamespace(), function(mapEvt) {
      if (self.isEditing) {
        self.editPoint = self.cursor;
        self.preEditSettings = {
          scale: self.scale,
          angle: self.angle,
          position: self.editPosition
        }
      }
    });

    this.board.event_manager.on('drag.' + this.eventNamespace(), function(mapEvt) {
      if (self.editPoint) {
        self.applyCursorDelta();
      }
    });

    this.board.event_manager.on('dragstop.' + this.eventNamespace(), function(mapEvt) {
      self.editPoint = null;
    });

    board.event_manager.on('click.' + this.eventNamespace(), function(mapEvt) {
      if (self.image && self.cursor && !self.isEditing) {
        if (self.allowEditing) {
          self.enterEditMode();
        } else {
          self.saveAction();
        }
      }
    });
  }

  disable() {
    this.board.event_manager.off('.' + this.eventNamespace());
    this.cleanImage();
  }

  enterEditMode() {
    setTimeout(() => {
      this.isEditing = true;
      this.editPoint = null;
      this.editPosition = this.cursor;
      this.options.get("operation").visible = true;
      this.options.get("save").visible = true;
      this.options.get("cancel").visible = true;
    }, 1);
  }

  leaveEditMode() {
    this.isEditing = false;
    this.editPoint = null;
    this.editPosition = null;
    this.options.get("operation").visible = false;
    this.options.get("save").visible = false;
    this.options.get("cancel").visible = false;
  }

  applyCursorDelta() {

    if (!this.editPoint || !this.cursor) {
      return;
    }

    const start = new Vector2(this.editPoint);
    const end = new Vector2(this.cursor);

    const operation = this.options.get("operation").value;

    if (operation === "move") {
      const delta = end.subtract(start);
      this.editPosition = [this.preEditSettings.position[0] + delta.x, this.preEditSettings.position[1] + delta.y];
    } else if (operation === "scale") {
      const deltaY = start.y - end.y;
      const ratio = Math.min(Math.abs(deltaY), 750.0) / 750.0;
      if (deltaY > 0) {
        this.scale = this.preEditSettings.scale * (1.0 + ratio);
      } else if (deltaY < -5) {
        this.scale = Math.max(0.01, this.preEditSettings.scale * (1.0 - ratio));
      }
    } else if (operation === "rotate") {
      const deltaY = start.y - end.y;
      const ratio = Math.min(Math.abs(deltaY), 750.0) / 750.0;
      let angle = 0;

      if (deltaY > 0) {
        angle = this.preEditSettings.angle + (ratio * 360);
      } else {
        angle = this.preEditSettings.angle - (ratio * 360);
      }

      this.angle = angle;
    } else {
      throw `Invalid Operation: ${operation}`
    }

  }

  saveAction() {
    const img = this.imageDrawing;
    const center = this.editPosition || this.cursor;

    if (img) {
      var action = {
        version: 1,
        level: this.board.getLevel().id,
        actionType: "insertImageAction",
        url: this.image.url,
        center: center,
        scale: this.scale,
        angle: this.angle,
        width: img.size.x,
        height: img.size.y,
        uid: generateActionId()};

      var undoAction = {actionType: "removeDrawingAction", actionId: action.uid, uid: generateActionId()};

      this.board.addAction(action, undoAction, true);
    }

    this.leaveEditMode();
    setTimeout(() => {
      this.board.drawingLayer.removeAction(this.imageDrawing.uid);
      this.board.drawingLayer.addAction(this.imageDrawing);
    }, 250);
  }

  draw() {
    if (this.imageDrawing) {
      this.drawImage();
    }

    if (this.cursor) {
      this.drawCross(this.cursor);
    }
  }

  drawImage() {
    var place = this.editPosition || this.cursor;
    if (place) {
      this.imageDrawing.setPosition(new Vector2(place[0], place[1]));
      this.imageDrawing.setScale(this.scale);
      this.imageDrawing.setAngle(this.angle * Math.PI / 180);
    }
  }

  drawCross(point) {
    var crossSize = 10;
    var lines = [
      {start: [point[0] - crossSize, point[1]], end: [point[0] + crossSize, point[1]]},
      {start: [point[0], point[1] - crossSize], end: [point[0], point[1] + crossSize]}
    ];
    this.board.drawing.drawLines("black", 3, lines);
  }
}

