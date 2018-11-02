
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
}


export default Vector2;