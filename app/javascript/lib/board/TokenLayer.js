
export class TokenLayer {
  constructor(board) {
    this.board = board;
    this.tokens = new Map();
    this.visibleTokens = [];
  }

  draw(drawing) {
    this.visibleTokens = this.sortedTokens()
      .filter(t => !t.level || this.board.getLevel().id === t.level)
      .filter(t => this.board.isOwner || !t.hidden);
    const locationMap = new Map();
    const toLocationKey = (t) => `${t.position.x}|${t.position.y}`;

    for (let t of this.visibleTokens) {
      const k = toLocationKey(t);
      const arr = locationMap.get(k) || [];
      arr.push(t);
      locationMap.set(k, arr);
    }

    for (let t of this.visibleTokens) {
      const otherLocationTokens = locationMap.get(toLocationKey(t)).filter(lt => lt.uid !== t.uid);
      t.draw(drawing, otherLocationTokens);
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
    return this.visibleTokens.filter(t => t.selectable !== false && t.containsPoint(point));
  }

  getToken(uid) {
    return this.tokens.get(uid);
  }

  sortedTokens() {
    return [...this.tokens.values()].sort((a, b) => a.sort - b.sort);
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
