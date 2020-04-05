import { ShapeDrawing } from "./ShapeDrawing";
import { Geometry, Rectangle, Vector2 } from "../geometry";
import {feetToText} from "../Formatting";
import { stackBlurCanvasRGBA, stackBlurCanvasRGB } from "./StackBlur";

class LevelHoleDrawing extends ShapeDrawing {
  constructor(uid, board, position, size, level) {
    super(uid, board, false, position, null, null, 0, level);

    this.size = size;
  }

  setSize(newSize) {
    this.invalidateHandler(() => {
      this.size = newSize;
    });
    return this;
  }

  updateFromCursorPosition(point) {
    this.invalidateHandler(() => {
      this.size = point.subtract(this.position);
    });
  }

  get rectangle() {
    return new Rectangle(this.position, this.size.x, this.size.y);
  }

  drawMeasure(drawing) {
    const rec = this.rectangle;
    var xDist = Math.round((Math.abs(rec.width()) / this.board.drawing.cellSize) * this.board.drawing.cellSizeFeet);
    var yDist = Math.round((Math.abs(rec.height()) / this.board.drawing.cellSize) * this.board.drawing.cellSizeFeet);

    this.board.drawing.drawMeasureLine(rec.topLeft().translate(0, -30).toArray(), rec.topRight().translate(0, -30).toArray(), feetToText(xDist), null, null, this.board.getZoom());
    this.board.drawing.drawMeasureLine(rec.topRight().translate(30, 0).toArray(), rec.bottomRight().translate(30, 0).toArray(), feetToText(yDist), null, null, this.board.getZoom());
  }

  executeDraw(drawing, drawBounds) {
    if (this.size.x === 0 || this.size.y === 0) {
      return;
    }

    const rectangle = this.rectangle;
    const levels = this.board.getLevelData();
    let lvlIdx = levels.findIndex(l => l.id === this.level);

    if (lvlIdx !== -1 && lvlIdx < levels.length - 1) {
      const lvl = levels[lvlIdx + 1];
      const canvas = this.board.drawIntoNewCanvas(this.position.x, this.position.y, this.size.x, this.size.y, lvl.id);
      drawing.context.save();
      drawing.context.clearRect(rectangle.topLeft().x, rectangle.topLeft().y, this.size.x, this.size.y);
      //drawing.context.globalAlpha = 0.75;
      drawing.context.filter = "blur(2px) saturate(70%)";
      drawing.context.drawImage(canvas, rectangle.topLeft().x, rectangle.topLeft().y);
      drawing.context.restore();
    } else {
      drawing.drawSquare(rectangle.topLeft().toArray(), rectangle.bottomRight().toArray(), "black", "white", 3, null);
    }

    //drawing.drawSquare(rectangle.topLeft().toArray(), rectangle.bottomRight().toArray(), "red", null, 5, null);

    super.executeDraw(drawing, drawBounds);
  }

  calculateBounds() {
    const margin = 3;
    return this.rectangle.enlarge(margin);
  }

  toAction(uid) {
    return {
      uid: uid || this.uid,
      version: 0,
      actionType: "levelHoleAction",
      position: this.position.toArray(),
      size: this.size.toArray(),
      level: this.level
    };
  }
}

export {
  LevelHoleDrawing
}