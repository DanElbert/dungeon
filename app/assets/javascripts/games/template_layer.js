class TemplateLayer {
  constructor(board) {
    this.board = board;
    this.templates = new Map();
  }

  addTemplate(t) {
    this.templates.set(t.uid, t);
  }

  removeTemplate(id) {
    this.templates.delete(id);
  }

  templateAt(point) {
    for (let t of this.templates.values()) {
      if (t.containsPoint(point)) {
        return t;
      }
    }
    return null;
  }

  draw(drawing) {
    for (let t of this.templates.values()) {
      t.draw(drawing);
    }
  }
}