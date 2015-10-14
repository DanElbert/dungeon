function MainMenu(board) {
  this.board = board;

  this.buttons = [
    {name: 'Tools', handler: this.toolToggle},
    {name: 'Initiative', handler: this.initToggle},
    {name: 'Exit', handler: function() { window.history.back(); }}
  ];

  this.container = null;
}

_.extend(MainMenu.prototype, {

  render: function() {
    if (!this.container) {
      this.container = $("<div id='main_menu' />")
          .appendTo("#game_board_container");
    }

    this.container.empty();

    var self = this;

    _.each(this.buttons, function(b) {
      $("<button />")
          .addClass("btn btn-default btn-xs")
          .text(b.name)
          .click(function() { b.handler.call(self); })
          .appendTo(this.container);
    }, this);

  },

  toolToggle: function() {
    this.board.toolManager.toggleDisplay();
  },

  initToggle: function() {

  }

});