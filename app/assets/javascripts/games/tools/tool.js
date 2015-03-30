function Tool(manager) {
  this.toolManager = manager;

  if (manager) {
    this.board = manager.board;
  }

  this.options = new ToolOptions();
  this.buildOptions();
  this.optionsChanged();
  var self = this;
  $(this.options).on('changed', function(e) {
    self.optionsChanged();
  });
}
_.extend(Tool.prototype, {
  enable: function() {},
  disable: function() {},
  getOptions: function() { return this.options; },
  optionsChanged: function() {},
  buildOptions: function() {},
  draw: function() {},
  roundPoint: function(p) {
    return [p[0]>>0, p[1]>>0];
  },
  setCursor: function(s) {
    $(this.board.canvas).css('cursor', s);
  },
  clearCursor: function() {
    $(this.board.canvas).css('cursor', 'auto');
  }
});