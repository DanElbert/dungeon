export class MainMenu {
  constructor(board) {
    this.board = board;

    this.buttons = [
      {name: 'Tools', handler: this.toolToggle},
      {name: 'Compass', handler: this.compassToggle},
      {name: 'Initiative', handler: this.initToggle},
      {name: 'Exit', handler: function() { window.location.href = "/campaigns/" + CAMPAIGN_ID; }}
    ];

    this.container = null;
  }

  render() {
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
      anchor.className = "button is-secondary is-small";
      anchor.innerText = b.name;
      this.container.appendChild(anchor);

      anchor.addEventListener("click", function(e) {
        b.handler.call(self);
      });
    }

  }

  toolToggle() {
    this.board.toolManager.toggleDisplay();
  }

  initToggle() {
    this.board.initiative.toggleDisplay();
  }

  compassToggle() {
    this.board.compassManager.toggleDisplay();
  }

  getInitiativeContainer() {
    return document.getElementById("game_board_container");
  }
}

