
export class TokenLayer {
  constructor(board) {
    this.board = board;
    this.tokens = new Map();
  }

  draw(drawing) {
    for (let t of this.tokens.values()) {
      if (!t.level || this.board.getLevel().id === t.level)
      t.draw(drawing);
    }
  }

  addToken(t) {
    this.tokens.set(t.uid, t);
    this.board.invalidate();
  }

  removeToken(uid) {
    this.tokens.delete(uid);
    this.board.invalidate();
  }

  tokenAt(point) {
    return [...this.tokens.values()].filter(t => t.selectable !== false && t.containsPoint(point));
  }

  clearTokens() {
    this.tokens = new Map();
    this.board.invalidate();
  }

  setTokens(tokenArray) {
    for (let t of tokenArray) {
      this.addToken(t);
    }
  }
}
