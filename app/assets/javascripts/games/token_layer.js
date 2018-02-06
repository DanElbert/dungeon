function TokenLayer() {
  this.tokens = [];
}

_.extend(TokenLayer.prototype, {
  draw: function(drawing) {
    _.each(this.tokens, function(t) {
      drawing.drawToken(t.cell[0], t.cell[1], t.height, t.width, t.color, t.text, t.fontColor, t.fontSize);
      // drawing.drawCircleTiles(t.x, t.y, t.width, t.height, "rgba(255,0,0,1.0)");
      // drawing.drawCircle(t.raw_x, t.raw_y, 4, "rgba(0,0,0,1.0)", true);
    }, this);
  },

  addToken: function(t) {
    this.tokens.push(t);
  },

  removeToken: function(uid) {
    var idx = null;
    for (var x = 0; x < this.tokens.length; x++) {
      if (this.tokens[x].uid === uid) {
        idx = x;
        break;
      }
    }

    if (idx !== null) {
      this.tokens.splice(idx, 1);
    }
  },

  tokenAtCell: function(cell) {
    for (var x = this.tokens.length - 1; x >= 0; x--) {
      var t = this.tokens[x];

      if ((cell[0] >= t.cell[0] && cell[0] < t.cell[0] + t.width) && (cell[1] >= t.cell[1] && cell[1] < t.cell[1] + t.height)) {
        return t;
      }
    }

    return null;
  },

  clearTokens: function() {
    this.tokens = [];
  },

  setTokens: function(tokenArray) {
    this.tokens = tokenArray;
  }
});