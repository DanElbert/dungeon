import ToolOptions from "../tool_menu/BoardToolOptions";

export class Tool {
  constructor(manager) {
    this.toolManager = manager;
    this.board = manager.board;

    this.options = new ToolOptions();
    this.buildOptions();
    this.optionsChanged();
    var self = this;
    this.options.on('changed', function(e) {
      self.optionsChanged();
    });  
  }

  enable() {}
  disable() {}
  getOptions() { return this.options; }
  optionsChanged() {}
  buildOptions() {}
  draw() {}
  roundPoint(p) {
    return [p[0]>>0, p[1]>>0];
  }
  setCursor(s) {
    this.board.canvas.style.cursor = s;
  }
  clearCursor() {
    this.board.canvas.style.cursor = "auto";
  }
}

window.Tool = Tool;