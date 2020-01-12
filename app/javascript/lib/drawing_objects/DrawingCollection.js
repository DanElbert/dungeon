import { BaseDrawing } from "./BaseDrawing";

class DrawingCollection extends BaseDrawing {
  constructor(uid, board, position, scale, angle, isPcLayer, level) {
    super(uid, board, position, scale, angle, isPcLayer, level);

    this.children = [];
  }

  beforeDrawChildren(drawing, drawBounds, level) {

  }

  afterDrawChildren(drawing, drawBounds, level) {

  }

  drawChildren(drawing, drawBounds, level) {
    for (let c of this.children) {
      c.draw(drawing, drawBounds, level);
    }
  }

  draw(drawing, drawBounds, level) {
    this.beforeDrawChildren(drawing, drawBounds, level);

    this.drawChildren(drawing, drawBounds, level);

    this.afterDrawChildren(drawing, drawBounds, level);
  }
}


export {
  DrawingCollection
}