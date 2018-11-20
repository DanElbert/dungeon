
class Vector2 {
  constructor(x, y) {
    if (Array.isArray(x)) {
      this.x = x[0];
      this.y = x[1];
    } else {
      this.x = x;
      this.y = y;
    }
  }

  toArray() {
    return [this.x, this.y]
  }

  add(point) {
    return new Vector2(this.x + point.x, this.y + point.y);
  }

  subtract(point) {
    return new Vector2(this.x - point.x, this.y - point.y);
  }

  distance(point) {
    const a = this.x - point.x;
    const b = this.y - point.y;
    return Math.sqrt((a ** 2) + (b ** 2));
  }

  translate(x, y) {
    return new Vector2(this.x + x, this.y + y);
  }

  rotate(angle, point) {

    var m = TransformMatrix.Identity;

    if (point) {
      m = m.translate(point.x, point.y);
      m = m.rotate(angle);
      m = m.translate(-point.x, -point.y);
    } else {
      m = m.rotate(angle);
    }

    return this.matrixMultiply(m);
  }

  scale(x, y) {
    var m = TransformMatrix.Identity.scale(x, y);

    return this.matrixMultiply(m);
  }
  
  matrixMultiply(m) {
    var out = m.pointMultiply([this.x, this.y, 1]);
    return new Vector2(out[0], out[1]);
  }

  confineTo(rect) {
    let cX = Math.max(rect.left(), this.x);
    let cY = Math.max(rect.top(), this.y);

    cX = Math.min(rect.right(), cX);
    cY = Math.min(rect.bottom(), cY);

    return new Vector2(cX, cY);
  }
}


export default Vector2;