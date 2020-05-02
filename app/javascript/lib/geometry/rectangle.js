import Vector2 from "./vector2";

class Rectangle {
  constructor(topLeft, width, height) {
    this._topLeft = topLeft;
    this._width = width;
    this._height = height;

    if (this._width < 0) {
      this._topLeft = this._topLeft.translate(this._width, 0);
      this._width = -1 * this._width;
    }

    if (this._height < 0) {
      this._topLeft = this._topLeft.translate(0, this._height);
      this._height = -1 * this._height;
    }
  }

  static fromElement(el) {
    const bounds = el.getBoundingClientRect();
    return new Rectangle(new Vector2(bounds.left, bounds.top), bounds.width, bounds.height);
  }

  overlaps(otherRec) {
    // If one rectangle is on left side of other
    if (this.left() > otherRec.right() || otherRec.left() > this.right())
      return false;

    // If one rectangle is above other
    if (this.top() > otherRec.bottom() || otherRec.top() > this.bottom())
      return false;

    return true;
  }

  isEmpty() {
    return this.width() === 0 || this.height() === 0;
  }

  containsPoint(point) {
    return point.x >= this.left() &&
      point.x <= this.right() &&
      point.y >= this.top() &&
      point.y <= this.bottom();
  }

  // Returns the portion of this rectangle inside the given rec
  clipTo(otherRec) {
    var left = Math.max(this.left(), otherRec.left());
    var top = Math.max(this.top(), otherRec.top());
    var right = Math.min(this.right(), otherRec.right());
    var bottom = Math.min(this.bottom(), otherRec.bottom());

    return new Rectangle(
      new Vector2(left, top),
      right - left,
      bottom - top
    );
  }

  // Returns the largest square that can fit in this rectangle, centered
  centeredSquare() {
    const sqrSize = Math.min(this.width(), this.height());
    let left = this.left();
    let top = this.top();

    if (this.width() > sqrSize) {
      left = left + ((this.width() - sqrSize) / 2);
    }

    if (this.height() > sqrSize) {
      top = top + ((this.height() - sqrSize) / 2);
    }

    return new Rectangle(new Vector2(left, top), sqrSize, sqrSize);
  }

  // Snaps the rectangle to a multiple of the given param.
  // mode can be one one of: "closest" (default), "enlarge", "shrink"
  snapTo(multiple, mode) {
    if (!mode || mode === "closest") {
      return new Rectangle(
        new Vector2(Geometry.roundToNearest(this.left(), multiple), Geometry.roundToNearest(this.top(), multiple)),
        Geometry.roundToNearest(this.width(), multiple),
        Geometry.roundToNearest(this.height(), multiple));
    } else if (mode === "enlarge") {
      const tl = new Vector2(this.left() - (this.left() % multiple), this.top() - (this.top() % multiple));
      const delta = this.topLeft().subtract(tl);
      let w = this.width() + delta.x;
      if (w % multiple !== 0) {
        w = w + (multiple - (w % multiple))
      }

      let h = this.height() + delta.y;
      if (h % multiple !== 0) {
        h = h + (multiple - (h % multiple))
      }
      return new Rectangle(tl, w, h);
    } else if (mode === "shrink") {
      throw "shrink not implemented";
    } else {
      throw "Invalid mode " + mode;
    }
  }

  // Returns a rectangle that covers this rec and otherRec
  add(otherRec) {
    var left = Math.min(this.left(), otherRec.left());
    var top = Math.min(this.top(), otherRec.top());
    var right = Math.max(this.right(), otherRec.right());
    var bottom = Math.max(this.bottom(), otherRec.bottom());

    return new Rectangle(
      new Vector2(left, top),
      right - left,
      bottom - top
    );
  }

  translate(x, y) {
    return new Rectangle(
      this.topLeft().translate(x, y),
      this.width(),
      this.height()
    )
  }

  scale(x, y) {
    return new Rectangle(
      this.topLeft().scale(x, y),
      this.width() * x,
      this.height() * y
    );
  }

  enlarge(v) {
    return new Rectangle(
      this.topLeft().translate(-v, -v),
      this.width() + (v * 2),
      this.height() + (v * 2)
    );
  }

  shrink(v) {
    return new Rectangle(
      this.topLeft().translate(v, v),
      this.width() - (v * 2),
      this.height() - (v * 2)
    );
  }

  roundValues() {
    return new Rectangle(
      new Vector2(Math.floor(this.left()), Math.floor(this.top())),
      Math.ceil(this.width()),
      Math.ceil(this.height())
    );
  }

  toArray() {
    return [
      [this.topLeft().x, this.topLeft().y],
      [this.bottomRight().x, this.bottomRight().y]
    ];
  }

  size() {
    return new Vector2(
      this.width(),
      this.height()
    )
  }

  center() {
    return new Vector2(
      this.topLeft().x + this.width() / 2,
      this.topLeft().y + this.height() / 2
    )
  }

  topLeft() {
    return this._topLeft;
  }

  bottomRight() {
    return new Vector2(
      this.topLeft().x + this.width(),
      this.topLeft().y + this.height()
    )
  }

  topRight() {
    return new Vector2(
      this.topLeft().x + this.width(),
      this.topLeft().y
    )
  }

  bottomLeft() {
    return new Vector2(
      this.topLeft().x,
      this.topLeft().y + this.height()
    )
  }

  left() {
    return this.topLeft().x;
  }

  right() {
    return this.topLeft().x + this.width();
  }

  top() {
    return this.topLeft().y;
  }

  bottom() {
    return this.topLeft().y + this.height();
  }

  width() {
    return this._width;
  }

  height() {
    return this._height;
  }
}

export default Rectangle;