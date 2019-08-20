import { BaseDrawing } from "./BaseDrawing";
import { Geometry, Rectangle, Vector2 } from "../geometry";
import { feetToText } from "../Formatting";

class ShapeDrawing extends BaseDrawing {
  constructor(uid, board, isPcLayer, position, color, backgroundColor, width) {
    super(uid, board, position, 1, 0, isPcLayer);
    this.color = color;
    this.backgroundColor = backgroundColor;
    this.width = width;
    this.measure = false;
  }

  setColor(newColor) {
    this.invalidateHandler(() => {
      this.color = newColor;
    });
  }

  setBackgroundColor(backgroundColor) {
    this.invalidateHandler(() => {
      this.backgroundColor = backgroundColor;
    });
  }

  setWidth(newWidth) {
    this.invalidateHandler(() => {
      this.width = newWidth;
    });
  }

  setMeasure(newMeasure) {
    this.invalidateHandler(() => {
      this.measure = newMeasure;
    });
  }

  drawMeasure(drawing) {}

  measureMargin() {
    if (this.measure) {
      return 250;
    } else {
      return 0;
    }
  }

  executeDraw(drawing, drawBounds) {
    if (this.measure === true) {
      this.drawMeasure(drawing);
    }
  }

  toAction(newUid) {
    return {
      version: 1,
      uid: newUid || this.uid,
      position: this.position.toArray(),
      isPcLayer: this.isPcLayer,
      color: this.color,
      backgroundColor: this.backgroundColor,
      width: this.width
    }
  }
}

class CircleDrawing extends ShapeDrawing {
  constructor(uid, board, isPcLayer, position, color, backgroundColor, width, radius) {
    super(uid, board, isPcLayer, position, color, backgroundColor, width);
    this.radius = radius;
    this.lastCursor = null;
  }

  updateFromCursorPosition(point) {
    this.invalidateHandler(() => {
      this.lastCursor = point;
      this.radius = parseInt(this.position.distance(point));
    });
  }

  drawMeasure(drawing) {
    const pathfinderDistance = Math.round((this.radius / this.board.drawing.cellSize) * this.board.drawing.cellSizeFeet);
    let endPoint;

    if (this.lastCursor) {
      endPoint = this.lastCursor;
    } else {
      endPoint = this.position.translate(this.radius, 0).rotate(-30, this.position);
    }

    drawing.drawMeasureLine(this.position.toArray(), endPoint.toArray(), pathfinderDistance, null, null, this.board.getZoom());
  }

  executeDraw(drawing, drawBounds) {
    if (this.color === -1) {
      // Implement erase circle
    } else {
      drawing.drawCircle(this.position.x, this.position.y, this.radius, this.width, this.color, this.backgroundColor);
    }

    super.executeDraw(drawing, drawBounds);
  }

  calculateBounds() {
    const radius = this.radius + parseInt(this.width / 2) + this.measureMargin();
    return new Rectangle(this.position.translate(-radius, -radius), 2 * radius, 2 * radius);
  }

  toAction(uid) {
    return Object.assign(super.toAction(uid), {
      actionType: "circlePenAction",
      radius: this.radius
    });
  }
}

class SquareDrawing extends ShapeDrawing {
  constructor(uid, board, isPcLayer, position, color, backgroundColor, width, size) {
    super(uid, board, isPcLayer, position, color, backgroundColor, width);
    this.size = size;
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

    drawing.drawMeasureLine(rec.topLeft().translate(0, -30).toArray(), rec.topRight().translate(0, -30).toArray(), feetToText(xDist), null, null, this.board.getZoom());
    drawing.drawMeasureLine(rec.topRight().translate(30, 0).toArray(), rec.bottomRight().translate(30, 0).toArray(), feetToText(yDist), null, null, this.board.getZoom());
  }

  executeDraw(drawing, drawBounds) {
    if (this.color === -1) {
      // Implement erase square
    } else {
      drawing.drawSquare(this.rectangle.topLeft().toArray(), this.rectangle.bottomRight().toArray(), this.color, this.backgroundColor, this.width);
    }

    super.executeDraw(drawing, drawBounds);
  }

  calculateBounds() {
    const margin = parseInt(this.width / 2) + 2 + this.measureMargin();
    return this.rectangle.enlarge(margin);
  }

  toAction(uid) {
    return Object.assign(super.toAction(uid), {
      actionType: "squarePenAction",
      size: this.size.toArray()
    });
  }
}

class LineDrawing extends ShapeDrawing {
  constructor(uid, board, isPcLayer, position, color, backgroundColor, width, endPoint) {
    super(uid, board, isPcLayer, position, color, backgroundColor, width);
    this.endPoint = endPoint;
  }

  updateFromCursorPosition(point) {
    this.invalidateHandler(() => {
      this.endPoint = point;
    });
  }

  executeDraw(drawing, drawBounds) {
    super.executeDraw(drawing, drawBounds);
    if (this.color === -1) {
      drawing.erasePointsLine(this.width, [this.position, this.endPoint]);
    } else {
      drawing.drawPointsLine(this.color, this.width, [this.position, this.endPoint]);
    }
  }

  calculateBounds() {
    var margin = parseInt(this.width / 2) + this.measureMargin();
    return new Rectangle(this.position, this.endPoint.x - this.position.x, this.endPoint.y - this.position.y).enlarge(margin);
  }

  toAction(uid) {
    return Object.assign(super.toAction(uid), {
      actionType: "linePenAction",
      end: this.endPoint.toArray()
    });
  }
}

export {
  CircleDrawing,
  SquareDrawing,
  LineDrawing
}
