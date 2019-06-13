import { BaseDrawing } from "./BaseDrawing";
import { Geometry, Rectangle, Vector2 } from "../geometry";

class PenDrawing extends BaseDrawing {
  constructor(uid, board, points, width, color, isPcLayer) {
    super(uid, board, new Vector2(0, 0), 1, 0, isPcLayer);
    this.points = points;
    this.width = width;
    this.color = color;
    this.isFog = true;
  }

  calculateBounds() {
    var l, t, r, b;
    var margin = (this.width / 2) + 2;

    this.points.forEach(p => {
      if (l == null || p.x < l) l = p.x;
      if (t == null || p.y < t) t = p.y;
      if (r == null || p.x > r) r = p.x;
      if (b == null || p.y > b) b = p.y;
    });


    return new Rectangle(new Vector2(l - margin, t - margin),
      r - l + (margin * 2),
      b - t + (margin * 2));
  }

  setPoints(newPoints) {
    this.invalidateHandler(() => {
      this.points = newPoints;
    });
  }

  executeDraw(drawing, drawBounds) {
    if (this.color === -1) {
      drawing.erasePointsLine(this.width, this.points);
    } else {
      drawing.drawPointsLine(this.color, this.width, this.points);
    }
  }
}

export {
  PenDrawing
}