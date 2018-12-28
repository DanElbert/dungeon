function TokenLayer(board) {
  this.board = board;
  this.tokens = new Map();
}

_.extend(TokenLayer.prototype, {
  draw: function(drawing) {
    for (let t of this.tokens.values()) {
      t.draw(drawing);
    }
  },

  addToken: function(t) {
    this.tokens.set(t.uid, t);
    this.board.invalidate();
  },

  removeToken: function(uid) {
    this.tokens.delete(uid);
    this.board.invalidate();
  },

  tokenAt: function(point) {
    return [...this.tokens.values()].filter(t => t.selectable !== false && t.containsPoint(point));
  },

  clearTokens: function() {
    this.tokens = new Map();
    this.board.invalidate();
  },

  setTokens: function(tokenArray) {
    for (let t of tokenArray) {
      this.addToken(t);
    }
  }
});