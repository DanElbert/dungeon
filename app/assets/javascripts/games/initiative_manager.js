class InitiativeManager extends Eventer {
  constructor(board, init_url) {
    super();
    this.board = board;
    this.container = this.board.mainMenu.getInitiativeContainer();


    this.element = document.createElement("div");
    this.container.appendChild(this.element);
    this.initiative = VUE_COMPONENTS.install(this.element, VUE_COMPONENTS.Initiative).$refs.component;
  }

  toggleDisplay() {
    this.initiative.toggle();
  }

  update(data) {
    //this.initiative.initiative("update", data);
  }

  triggerChanged(data) {
    // data = data || this.initiative.initiative("data");
    // $(this).trigger('changed', {
    //   initiative: data
    // });
  }
}

