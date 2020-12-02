import { BaseTemplate, BaseCellTemplate } from "./BaseTemplate";
import { Geometry, Rectangle, Vector2 } from "../geometry";

export class SavageWorldsBurstTemplate extends BaseTemplate {
  constructor(uid, board, position, color, size) {
    super(uid, board, position, color);
    this.size = size;
  }

  get radius() {
    if (this.size === "small") {
      return (this.cellSize * 2) / 2.0;
    } else if (this.size === "medium") {
      return (this.cellSize * 4) / 2.0;
    } else {
      return (this.cellSize * 6) / 2.0;
    }
  }

  setSize(newSize) {
    if (this.size !== newSize) {
      this.invalidateHandler(() => {
        this.size = newSize;
      });
    }
    return this;
  }

  containsPoint(point) {
    return this.position.distance(new Vector2(point)) <= this.radius;
  }

  drawHighlight(drawing, offset) {
    drawing.context.save();
    drawing.context.translate(offset.x, offset.y);
    drawing.drawCircle(this.position.x, this.position.y, this.radius, 6 / drawing.drawingSettings.zoom, "white", null);
    drawing.drawCircle(this.position.x, this.position.y, this.radius, 1 / drawing.drawingSettings.zoom, "black", null);
    drawing.context.restore();
  }

  executeDraw(drawing, drawBounds, level) {
    drawing.context.globalAlpha = 0.3;
    drawing.drawCircle(this.position.x, this.position.y, this.radius, 3, null, this.color);
    drawing.context.globalAlpha = 1;
    drawing.drawCircle(this.position.x, this.position.y, this.radius, 3, "black", null);
  }

  calculateBounds() {
    return new Rectangle(this.position.translate(-this.radius, -this.radius), this.radius * 2, this.radius * 2);
  }

  clone(uid) {
    return new SavageWorldsBurstTemplate(uid || this.uid, this.board, this.position, this.color, this.size);
  }

  toAction(newUid) {
    return {
      version: 1,
      actionType: "savageWorldsBurstTemplateAction",
      uid: newUid || this.uid,
      position: this.position.toArray(),
      color: this.color,
      size: this.size
    };
  }
}

export class SavageWorldsConeTemplate extends BaseTemplate {
  constructor(uid, board, position, color, angle) {
    super(uid, board, position, color);
    this.angle = angle;
    this.geometry = null;
  }

  clearDrawing() {
    super.clearDrawing();
    this.geometry = null;
  }

  containsPoint(point) {
    this.ensureGeometry();
    const points = this.geometry.triangle.map(p => p.toArray());
    points.push(points[0]);

    return this.geometry.circleCenter.distance(new Vector2(point)) <= this.geometry.radius || Geometry.isPointInPolygon(point, points);
  }

  drawHighlight(drawing, offset) {
    this.ensureGeometry();
    drawing.context.save();
    drawing.context.translate(offset.x, offset.y);
    this.drawBorder(drawing, 6 / drawing.drawingSettings.zoom, "white");
    this.drawBorder(drawing, 1 / drawing.drawingSettings.zoom, "black");
    drawing.context.restore();
  }

  executeDraw(drawing, drawBounds, level) {
    this.ensureGeometry();

    const triangle = this.geometry.triangle;
    drawing.context.globalAlpha = 0.3;
    drawing.drawCone(this.position, 9.0 * this.cellSize, 3.0 * this.cellSize, this.angle, 1, null, this.color);

    drawing.context.globalAlpha = 1;

    this.drawBorder(drawing, 3, "black");
  }

  drawBorder(drawing, width, color) {
    drawing.drawCone(this.position, 9.0 * this.cellSize, 3.0 * this.cellSize, this.angle, width, color);
  }

  calculateBounds() {
    return new Rectangle(new Vector2(0, 0), 0, 0);
  }

  ensureGeometry() {
    if (this.geometry === null) {
      const totalLength = 9.0 * this.cellSize;
      const maxWidth = 3.0 * this.cellSize;
      const radius = maxWidth / 2.0;
      const triangleLength = totalLength - radius;
      const triangle = [new Vector2(0, 0), new Vector2(radius, triangleLength), new Vector2(-radius, triangleLength)];
      let circleCenter = new Vector2(0, triangleLength);

      circleCenter = circleCenter.rotate(this.angle * (Math.PI / 180)).translate(this.position.x, this.position.y);
      for (let idx in triangle) {
        triangle[idx] = triangle[idx].rotate(this.angle * (Math.PI / 180)).translate(this.position.x, this.position.y);
      }

      this.geometry = {
        radius: radius,
        triangle: triangle,
        circleCenter: circleCenter
      }
    }
  }

  clone(uid) {
    return new SavageWorldsConeTemplate(uid || this.uid, this.board, this.position, this.color, this.angle);
  }

  toAction(newUid) {
    return {
      actionType: "savageWorldsConeTemplateAction",
      uid: newUid || this.uid,
      position: this.position.toArray(),
      color: this.color,
      angle: this.angle
    };
  }
}