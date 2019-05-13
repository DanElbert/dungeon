import { DragDeleteItem } from "./DragDeleteItem";
import { PathfinderRectangleTemplate, PathfinderReachTemplate, PathfinderRadiusTemplate, PathfinderMovementTemplate, PathfinderLineTemplate, PathfinderConeTemplate } from "../drawing_objects";
import { Tool } from "./Tool";
import { generateActionId } from "../Actions";

export class TemplateTool extends Tool {
  constructor(manager) {
    super(manager);

    this.shouldDrawMeasure = true;
    this.color = null;
    this.cursor = new Vector2(0, 0);
    this.cursorStart = null;
    this.tempTemplate = null;

    this.dragDeleteItem = new DragDeleteItem(this, this.board, this.eventNamespace());
  }

  eventNamespace() {
    throw "Not Implemented";
  }

  buildTemplate() {
    throw "Not Implemented";
  }

  updateTemplate(template) {
    throw "Not Implemented";
  }

  snapCursor(point, cell) {
    return new Vector2(Geometry.getNearestCellIntersection(point.toArray(), this.board.drawingSettings.cellSize));
  }

  buildOptions() {
    this.options.add(this.toolManager.sharedTool("templateColor"));
  }

  optionsChanged() {
    this.color = this.options.get("color").value;
  }

  enable() {
    this.board.event_manager.on(`mousemove.${this.eventNamespace()}`, mapEvt => {
      this.cursor = this.snapCursor(new Vector2(mapEvt.mapPoint), new Vector2(mapEvt.mapPointCell));
    });

    this.board.event_manager.on(`dragstart.${this.eventNamespace()}`, mapEvt => {
      if (!this.dragDeleteItem.selectedItem) {
        this.cursorStart = this.snapCursor(new Vector2(mapEvt.mapPoint), new Vector2(mapEvt.mapPointCell));
        this.tempTemplate = this.buildTemplate();
        this.board.templateLayer.addTemplate(this.tempTemplate);
      }
    });

    this.board.event_manager.on(`drag.${this.eventNamespace()}`, mapEvt => {
      if (this.tempTemplate) {
        this.cursor = this.snapCursor(new Vector2(mapEvt.mapPoint), new Vector2(mapEvt.mapPointCell));
        this.updateTemplate(this.tempTemplate);
      }
    });

    this.board.event_manager.on(`dragstop.${this.eventNamespace()}`, mapEvt => {
      if (this.tempTemplate) {
        this.saveAction();
        this.board.templateLayer.removeTemplate(this.tempTemplate.uid);
      }
      this.tempTemplate = null;
      this.cursorStart = null;
    });

    this.dragDeleteItem.enable();
  }

  disable() {
    this.board.event_manager.off(`.${this.eventNamespace()}`);
    this.dragDeleteItem.disable();
  }

  saveAction() {
    const action = this.tempTemplate.clone(generateActionId()).toAction();
    const undoAction = {actionType: "removeTemplateAction", actionId: action.uid, uid: generateActionId()};
    this.board.addAction(action, undoAction, true);
  }

  draw() {
    this.dragDeleteItem.draw();
    this.drawCross(this.cursor);

    if (this.cursorStart) {
      this.drawCross(this.cursorStart);
    }

    if (this.tempTemplate && this.shouldDrawMeasure) {
      this.drawMeasure();
    }
  }

  cursorDelta() {
    if (this.cursorStart === null) {
      return new Vector2(0, 0);
    }
    const cell1 = Geometry.getCell(this.cursorStart.toArray(), this.board.drawingSettings.cellSize);
    const cell2 = Geometry.getCell(this.cursor.toArray(), this.board.drawingSettings.cellSize);

    return new Vector2(cell2).subtract(new Vector2(cell1));
  }

  drawCross(point) {
    var crossSize = 10;
    var lines = [
      {start: [point.x - crossSize, point.y], end: [point.x + crossSize, point.y]},
      {start: [point.x, point.y - crossSize], end: [point.x, point.y + crossSize]}
    ];
    this.board.drawing.drawLines("black", 3, lines);
  }

  drawMeasure() {
    const cell1 = Geometry.getCell(this.cursorStart.toArray(), this.board.drawingSettings.cellSize);
    const cell2 = Geometry.getCell(this.cursor.toArray(), this.board.drawingSettings.cellSize);
    const distance = Geometry.getCellDistance(cell1, cell2) * this.board.drawingSettings.cellSizeFeet;

    this.board.drawing.drawMeasureLine(this.cursorStart.toArray(), this.cursor.toArray(), `${distance}'`, null, null, this.board.drawingSettings.zoom);
  }
}

export class Measure extends TemplateTool {
  constructor(manager) {
    super(manager);
    this.shouldDrawMeasure = false;
  }

  eventNamespace() {
    return "Measure";
  }

  buildTemplate() {
    return new PathfinderMovementTemplate(generateActionId(), this.board, this.cursorStart, this.color, this.cursorDelta());
  }

  updateTemplate(template) {
    template.updateProperties({
      color: this.color,
      position: this.cursorStart,
      cellDelta: this.cursorDelta()
    });
  }

  snapCursor(point, cell) {
    return new Vector2(Geometry.getCellMidpoint(cell.toArray(), this.board.drawingSettings.cellSize));
  }
}

export class RadiusTemplate extends TemplateTool {
  constructor(manager) {
    super(manager);
  }

  eventNamespace() {
    return "Radius";
  }

  buildTemplate() {
    return new PathfinderRadiusTemplate(generateActionId(), this.board, this.cursorStart, this.color, Geometry.getCellDistance([0, 0], this.cursorDelta().toArray()));
  }

  updateTemplate(template) {
    template.updateProperties({
      color: this.color,
      position: this.cursorStart,
      cellRadius: Geometry.getCellDistance([0, 0], this.cursorDelta().toArray())
    });
  }
}

export class ConeTemplate extends TemplateTool {
  constructor(manager) {
    super(manager);
  }

  eventNamespace() {
    return "Cone";
  }

  buildTemplate() {
    return new PathfinderConeTemplate(generateActionId(), this.board, this.cursorStart, this.color, Geometry.getCellDistance([0, 0], this.cursorDelta().toArray()), this.getAngle());
  }

  updateTemplate(template) {
    template.updateProperties({
      color: this.color,
      position: this.cursorStart,
      cellRadius: Geometry.getCellDistance([0, 0], this.cursorDelta().toArray()),
      angle: this.getAngle()
    });
  }

  getAngle() {
    let cursorAngle = Math.atan2(this.cursor.x - this.cursorStart.x, -1 * (this.cursor.y - this.cursorStart.y)) * (180 / Math.PI);
    return (cursorAngle + 360 - 90) % 360;
  }
}

export class LineTemplate extends TemplateTool {
  constructor(manager) {
    super(manager);
  }

  eventNamespace() {
    return "Line";
  }

  buildTemplate() {
    return new PathfinderLineTemplate(generateActionId(), this.board, this.cursorStart, this.color, this.cursorDelta().scale(this.board.drawingSettings.cellSize));
  }

  updateTemplate(template) {
    template.updateProperties({
      color: this.color,
      position: this.cursorStart,
      delta: this.cursorDelta().scale(this.board.drawingSettings.cellSize)
    });
  }
}

export class RectangleTemplate extends TemplateTool {
  constructor(manager) {
    super(manager);
  }

  eventNamespace() {
    return "RectangleTemplate";
  }

  buildTemplate() {
    return new PathfinderRectangleTemplate(generateActionId(), this.board, this.cursorStart, this.color, this.cursorDelta());
  }

  updateTemplate(template) {
    template.updateProperties({
      color: this.color,
      position: this.cursorStart,
      cellDelta: this.cursorDelta()
    });
  }

  drawMeasure() {
    var cellDelta = this.cursorDelta();
    var xDist = Math.abs(cellDelta.x) * this.board.drawingSettings.cellSizeFeet;
    var yDist = Math.abs(cellDelta.y) * this.board.drawingSettings.cellSizeFeet;

    var xRange = [Math.min(this.cursorStart.x, this.cursor.x), Math.max(this.cursorStart.x, this.cursor.x)];
    var yRange = [Math.min(this.cursorStart.y, this.cursor.y), Math.max(this.cursorStart.y, this.cursor.y)];

    if (xDist > 0) {
      this.board.drawing.drawMeasureLine([xRange[0], yRange[0] - 30], [xRange[1], yRange[0] - 30], xDist, null, null, this.board.getZoom());
    }

    if (yDist > 0) {
      this.board.drawing.drawMeasureLine([xRange[1] + 30, yRange[0]], [xRange[1] + 30, yRange[1]], yDist, null, null, this.board.getZoom());
    }
  }
}
