function TokenLayer() {

  this.tokens = [];
}

_.extend(TokenLayer.prototype, {
  draw: function(drawing) {
    _.each(this.tokens, function(t) {
      drawing.drawCircleTiles(t.x, t.y, t.width, t.height, "rgba(255,0,0,1.0)");
      drawing.drawCircle(t.raw_x, t.raw_y, 4, "rgba(0,0,0,1.0)", true);
    }, this);
  },

  addToken: function(t) {
    this.tokens.push(t);
  },

  clearTokens: function() {
    this.tokens = [];
  },

  setTokens: function(tokenArray) {
    this.tokens = tokenArray;
  }
});