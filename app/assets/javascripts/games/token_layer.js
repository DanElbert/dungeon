function TokenLayer() {

  this.tokens = [];
}

_.extend(TokenLayer.prototype, {
  draw: function(drawing) {
    _.each(this.tokens, function(t) {
      drawing.drawCircleTiles(t.position_x, t.position_y, t.width, t.height, "rgba(255,0,0,1.0)");
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