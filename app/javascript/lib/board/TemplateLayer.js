export class TemplateLayer {
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

  getTemplate(id) {
    return this.templates.get(id);
  }

  templateAt(point) {
    return [...this.templates.values()].filter(t => t.selectable !== false && t.containsPoint(point));
  }

  draw(drawing) {
    for (let t of this.templates.values()) {
      t.draw(drawing);
    }
  }
}