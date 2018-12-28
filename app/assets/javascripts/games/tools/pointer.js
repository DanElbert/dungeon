function Pointer(manager) {
  Tool.call(this, manager);
  this.super = Tool.prototype;

  this.viewPortDragging = new ViewPortDragging(this, this.board, 'drag');
  this.dragDeleteItem = new DragDeleteItem(this, this.board, "Tokens");
  this.dragDeleteItem.on("dragstart", () => this.viewPortDragging.disable());
  this.dragDeleteItem.on("dragstop", () => this.viewPortDragging.enable());
}

Pointer.prototype = _.extend(Pointer.prototype, Tool.prototype, {
  enable: function() {

    var self = this;
    var board = this.board;

    this.viewPortDragging.enable();
    this.dragDeleteItem.enable();
  },

  disable: function() {
    this.viewPortDragging.disable();
    this.dragDeleteItem.disable();
    this.board.event_manager.off(".Pointer");
  },

  draw: function() {
    this.dragDeleteItem.draw();
  }
});