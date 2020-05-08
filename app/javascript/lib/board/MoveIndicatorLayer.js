export class MoveIndicatorLayer {
  constructor(board) {
    this.board = board;
    this.indicators = new Map();
  }

  add(moveIndicator) {
    this.indicators.set(moveIndicator.uid, moveIndicator);
  }

  remove(moveIndicatorId) {
    this.indicators.delete(moveIndicatorId);
  }

  get(moveIndicatorId) {
    return this.indicators.get(moveIndicatorId);
  }

  draw(drawing) {
    // evict anything too old
    const now = new Date();
    for (let i of [...this.indicators.values()]) {
      if (now - i.age > 30000) {
        this.indicators.delete(i.uid);
      }
    }

    for (let i of this.indicators.values()) {
      i.draw(drawing);
    }
  }
}