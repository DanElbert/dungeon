import { Geometry, Vector2, Rectangle } from "../geometry";
import _min from "lodash/min";
import _max from "lodash/max";

class BaseDrawing {
  constructor(uid, board, position, scale, angle, isPcLayer, level) {
    if (!uid) throw "Invalid UID";
    if (!board) throw "board cannot be null";
    this.uid = uid;
    this.board = board;
    this.position = position;
    this.scale = scale;
    this.angle = angle;
    this.isFog = false;
    this.isPcLayer = !!isPcLayer;
    this.selectable = false;
    this.canInvalidateByBounds = true;
    this.level = level || null;

    this._bounds = null;
  }
  
  get cellSize() {
    return this.board.drawingSettings.cellSize;
  }

  bounds() {
    if (this._bounds === null) {
      this._bounds = this.calculateBounds();
    }
    return this._bounds;
  }

  calculateBounds() {
    return new Rectangle(new Vector2(0, 0), 0, 0);
  }

  clearDrawing() {
    this._bounds = null;
  }

  setPosition(newPosition) {
    if (this.position !== newPosition) {
      this.invalidateHandler(() => {
        this.position = newPosition;
      });
    }
    return this;
  }

  setScale(newScale) {
    if (this.scale !== newScale) {
      this.invalidateHandler(() => {
        this.scale = newScale;
      });
    }
    return this;
  }

  setAngle(newAngle) {
    if (this.angle !== newAngle) {
      this.invalidateHandler(() => {
        this.angle = newAngle;
      });
    }
    return this;
  }

  // Given a rectangle and an angle, returns a non-rotated containing rectangle
  getRotatedRecBounds(rec, angle) {
    let points = [rec.topLeft(), rec.topRight(), rec.bottomLeft(), rec.bottomRight()];
    const center = rec.center();

    points = points.map(p => p.rotate(angle, center));

    const xVals = points.map(p => p.x);
    const yVals = points.map(p => p.y);

    const left = _min(xVals);
    const right = _max(xVals);
    const top = _min(yVals);
    const bottom = _max(yVals);

    return new Rectangle(
      new Vector2(left, top),
      right - left,
      bottom - top
    );
  }

  invalidateHandler(changeFn) {
    var originalBounds = this.bounds();
    changeFn();
    this.clearDrawing();
    var newBounds = this.bounds();

    if (this.canInvalidateByBounds) {
      this.board.invalidate(originalBounds.add(newBounds), this.isFog);
    } else {
      this.board.invalidate();
    }
  }

  invalidate() {
    this.clearDrawing();
    if (this.canInvalidateByBounds) {
      this.board.invalidate(this.bounds(), this.isFog);
    } else {
      this.board.invalidate();
    }
  }

  updateProperties(props) {
    this.invalidateHandler(() => {
      for (let key in props) {
        this[key] = props[key];
      }
    });
    return this;
  }

  draw(drawing, drawBounds, detailLevel) {
    this.executeDraw(drawing, drawBounds, detailLevel);
  }

  executeDraw(drawing, drawBounds, detailLevel) {
  }
}


export {
  BaseDrawing
};