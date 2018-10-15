function MainMenu(board) {
  this.board = board;

  this.buttons = [
    {name: 'Tools', handler: this.toolToggle},
    {name: 'Initiative', handler: this.initToggle},
    {name: 'Exit', handler: function() { window.location.href = "/campaigns/" + CAMPAIGN_ID; }}
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
          .addClass("btn btn-secondary btn-sm")
          .text(b.name)
          .click(function() { b.handler.call(self); })
          .appendTo(this.container);
    }, this);

  },

  toolToggle: function() {
    this.board.toolManager.toggleDisplay();
  },

  initToggle: function() {
    this.board.initiative.toggleDisplay();
  },

  getInitiativeContainer: function() {
    if (this.initiativeContainer == null) {
      this.initiativeContainer = $("<div />").appendTo("#game_board_container");
    }
    return this.initiativeContainer;
  }

});