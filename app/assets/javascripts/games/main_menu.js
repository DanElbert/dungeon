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
      const boardContainer = document.getElementById("game_board_container");
      this.container = document.createElement("div");
      this.container.id = "main_menu";
      boardContainer.appendChild(this.container);
    }

    while (this.container.firstChild) this.container.removeChild(this.container.firstChild);

    const self = this;

    for (let b of this.buttons) {
      const anchor = document.createElement("button");
      anchor.className = "btn btn-secondary btn-sm";
      anchor.innerText = b.name;
      this.container.appendChild(anchor);

      anchor.addEventListener("click", function(e) {
        b.handler.call(self);
      });
    }

  },

  toolToggle: function() {
    this.board.toolManager.toggleDisplay();
  },

  initToggle: function() {
    this.board.initiative.toggleDisplay();
  },

  getInitiativeContainer: function() {
    return document.getElementById("game_board_container");
  }

});