
class InitiativeManager extends Eventer {
  constructor(board, container) {
    super();
    this.board = board;
    this.container = container;
    this.data = new InitiativeData();

    this.data.on("changed", () => this.handleDataChanged());

    this.initiativeActionManager = new ActionMessenger(this.board.gameServerClient, '/game/' + this.board.gameId + '/update_initiative', message => {
      this.handleAddActionMessage(message);
    });
    this.initiativeActionManager.ignoreReflections = false;
    this.initiativeActionManager.connect();

    this.element = document.createElement("div");
    this.container.appendChild(this.element);
    this.initiative = VUE_COMPONENTS.install(this.element, VUE_COMPONENTS.Initiative, {}, { initiativeData: this.data });
  }

  handleAddActionMessage(message) {
    switch (message.actionType) {
      case "updateInitiativeAction":
        this.update(message.initiative, message.initiative_names);
        break;
    }
  }

  handleDataChanged() {
    // send new action
    const action = {actionType: "updateInitiativeAction", initiative: this.data.initiatives, uid: generateActionId()};
    this.initiativeActionManager.sendActionMessage(action);
  }

  toggleDisplay() {
    this.initiative.toggle();
  }

  update(initiatives, names) {
    if (initiatives !== null) {
      this.data.update(initiatives);
    }
    if (names !== null) {
      this.initiative.updateNames(names);
    }
  }
}

