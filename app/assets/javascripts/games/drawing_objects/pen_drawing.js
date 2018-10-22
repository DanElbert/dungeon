function PenDrawing(uid, board, lines, width, color) {
  BaseDrawing.call(this, uid, board);
  this.lines = lines;
  this.width = width;
  this.color = color;
}

PenDrawing.prototype = _.extend(PenDrawing.prototype, BaseDrawing.prototype, {
  calculateBounds: function() {
    var l, t, r, b;
    var margin = this.width / 2;
    var points = _.reduce(this.lines, function(memo, line) { memo.push(line.start); memo.push(line.end); return memo; }, []);
    _.each(points, function(p) {
      if (l == null || p[0] < l) l = p[0];
      if (t == null || p[1] < t) t = p[1];
      if (r == null || p[0] > r) r = p[0];
      if (b == null || p[1] > b) b = p[1];
    });
    return new Rectangle(new Vector2(l - margin, t - margin),
      r - l + margin,
      b - t + margin);
  },

  setLines: function(newLines) {
    this.lines = newLines;
    this.invalidate();
  },

  executeDraw: function(drawing, drawBounds) {
    if (this.color === -1) {
      drawing.eraseLines(this.width, this.lines);
    } else {
      drawing.drawLines(this.color, this.width, this.lines);
    }
  }
});