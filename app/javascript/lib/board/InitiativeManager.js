import { ActionMessenger } from "../ActionMessenger";
import Eventer from "../Eventer";
import InitiativeData from "../InitiativeData";
import { generateActionId } from "../Actions";

export class InitiativeManager extends Eventer {
  constructor(container, gameId, disableFloating) {
    super();
    this.container = container;
    this.data = new InitiativeData();

    this.data.on("changed", () => this.handleDataChanged());

    this.initiativeActionManager = new ActionMessenger("InitiativeChannel", { game_id: gameId }, message => {
      this.handleAddActionMessage(message);
    });
    this.initiativeActionManager.ignoreReflections = false;

    this.element = document.createElement("div");
    this.container.appendChild(this.element);
    this.initiative = VUE_COMPONENTS.install(this.element, VUE_COMPONENTS.Initiative, {}, { initiativeData: this.data, floating: !disableFloating });
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

window.InitiativeManager = InitiativeManager;