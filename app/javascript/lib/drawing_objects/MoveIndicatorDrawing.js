import { BaseDrawing } from "./BaseDrawing";
import { Geometry, Rectangle, Vector2 } from "../geometry";

export class MoveIndicatorDrawing extends BaseDrawing {
  constructor(uid, board, position, endPosition, target, label, color, level) {
    super(uid, board, position, 1, 0, false, level);
    this.target = target;
    this.endPosition = endPosition;
    this.label = label;
    this.color = color;
    this.age = new Date();
  }

  touch() {
    this.age = new Date();
  }

  calculateBounds() {
    const delta = this.endPosition.subtract(this.position);
    const sqr1 = this.target.bounds();
    const sqr2 = sqr1.translate(delta.x, delta.y);
    return sqr1.add(sqr2);
  }

  executeDraw(drawing, drawBounds, level) {
    const delta = this.endPosition.subtract(this.position);
    this.target.drawHighlight(drawing, delta);
    let feetMoved = 0;

    if (delta.x !== 0 || delta.y !== 0) {
      const startCell = this.toCell(this.position);
      const endCell = this.toCell(this.endPosition);
      feetMoved = drawing.drawMovementLine(startCell.toArray(), endCell.toArray(), this.color, null, this.board.getZoom());
    }

    if (feetMoved >= 15) {
      drawing.drawText(this.label, this.endPosition.toArray(), 24, 'white', "black", 1, "left", "bottom");
    }

  }

  toCell(p) {
    return new Vector2(Math.floor(p.x / this.cellSize), Math.floor(p.y / this.cellSize));
  }
}