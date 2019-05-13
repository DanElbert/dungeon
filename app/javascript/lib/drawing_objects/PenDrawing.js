import { BaseDrawing } from "./BaseDrawing";
import { Geometry, Rectangle, Vector2 } from "../geometry";

class PenDrawing extends BaseDrawing {
  constructor(uid, board, lines, width, color, isPcLayer) {
    super(uid, board, new Vector2(0, 0), 1, 0, isPcLayer);
    this.lines = lines;
    this.width = width;
    this.color = color;
    this.isFog = true;
  }

  calculateBounds() {
    var l, t, r, b;
    var margin = (this.width / 2) + 2;
    const points = [];
    this.lines.forEach(line => {
      points.push(line.start);
      points.push(line.end);
    });

    points.forEach(p => {
      if (l == null || p[0] < l) l = p[0];
      if (t == null || p[1] < t) t = p[1];
      if (r == null || p[0] > r) r = p[0];
      if (b == null || p[1] > b) b = p[1];
    });


    return new Rectangle(new Vector2(l - margin, t - margin),
      r - l + (margin * 2),
      b - t + (margin * 2));
  }

  setLines(newLines) {
    this.invalidateHandler(() => {
      this.lines = newLines;
    });
  }

  executeDraw(drawing, drawBounds) {
    if (this.color === -1) {
      drawing.eraseLines(this.width, this.lines);
    } else {
      drawing.drawLines(this.color, this.width, this.lines);
    }
  }
}

export {
  PenDrawing
}