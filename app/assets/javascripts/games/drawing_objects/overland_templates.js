
function OverlandMeasureTemplate(uid, board, position, color, delta) {
  BaseTemplate.call(this, uid, board, position, color);
  this.delta = delta;
}

OverlandMeasureTemplate.prototype = _.extend(OverlandMeasureTemplate.prototype, BaseTemplate.prototype, {
  calculateBounds: function() {
    var r = new Rectangle(this.position, this.delta.x, this.delta.y);
    return r.enlarge(20);
  },

  containsPoint: function(point) {
    const lineEnd = this.position.add(this.delta);
    const dist = this.position.distance(lineEnd);
    const rads = Math.atan2(this.delta.y, this.delta.x);
    const height = 40 / this.board.drawingSettings.zoom;

    let rec = new Rectangle(new Vector2(0, 0 - height / 2), dist, height);
    let mat = TransformMatrix.Identity.translate(this.position.x, this.position.y).rotate(rads);

    let verts = [
      rec.topLeft().matrixMultiply(mat),
      rec.bottomLeft().matrixMultiply(mat),
      rec.bottomRight().matrixMultiply(mat),
      rec.topRight().matrixMultiply(mat)
    ];

    verts.push(verts[0]);

    verts = verts.map(v => v.toArray());

    return Geometry.isPointInPolygon(point, verts);
  },

  drawHighlight(drawing, offset) {
    drawing.context.save();
    drawing.context.translate(offset.x, offset.y);
    drawing.drawOverlandMeasure(this.position.toArray(), this.position.add(this.delta).toArray(), "white", true);
    drawing.context.restore();
  },

  executeDraw: function(drawing) {
    drawing.drawOverlandMeasure(this.position.toArray(), this.position.add(this.delta).toArray(), this.color);
  },

  setDelta: function(delta) {
    this.invalidateHandler(() => {
      this.delta = delta;
    });
    return this;
  },

  clone: function(uid) {
    return new OverlandMeasureTemplate(uid, this.board, this.position, this.color, this.delta);
  },

  toAction(newUid) {
    return {
      version: 1,
      actionType: "overlandMeasureTemplateAction",
      uid: newUid || this.uid,
      position: this.position.toArray(),
      color: this.color,
      delta: this.delta.toArray()
    };
  }
});