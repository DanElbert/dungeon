
class InitiativeManager extends Eventer {
  constructor(board, init_url) {
    super();
    this.board = board;
    this.container = this.board.mainMenu.getInitiativeContainer();
    this.data = new InitiativeData();

    this.data.on("changed", () => {
      this.trigger("changed", { initiative: this.data.initiatives });
    });

    this.element = document.createElement("div");
    this.container.appendChild(this.element);
    this.initiative = VUE_COMPONENTS.install(this.element, VUE_COMPONENTS.Initiative, {}, { initiativeData: this.data });
  }

  toggleDisplay() {
    this.initiative.toggle();
  }

  update(data) {
    this.initiative.updateInitiative(data);
  }
}

