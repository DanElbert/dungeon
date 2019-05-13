
import { flashMessage } from "./FlashMessages";

class Action {
  constructor(actionData) {
    this.properties = this.defaultValues();
    Object.assign(this.properties, actionData || {});
    this.validateData();
  }

  get actionType() {
    return this.properties.actionType;
  }

  get uid() {
    return this.properties.uid;
  }

  get version() {
    return parseInt(this.properties.version) || 0;
  }

  isRemoval() {
    return false;
  }
  
  isPersistent() {
    return false;
  }
  
  apply(board) {}

  validateData() {}

  defaultValues() {
    return { isPersistent: this.isPersistent(), isRemoval: this.isRemoval() };
  }

  ensureFields(fieldList) {
    for (let field of fieldList) {
      if (!(field in this.properties)) {
        throw new Error("Action of type " + this.actionType + " missing required field " + field);
      }
    }
  }

  ensureVersionedFields(versionMap) {
    var v = this.version;
    var fields = versionMap[v];
    if (!fields) {
      throw new Error("Invalid version");
    }
    return this.ensureFields(fields);
  }

  clone() {
    return attachActionMethods(JSON.parse(JSON.stringify(this.properties)));
  }

  serialize() {
    return this.properties;
  }
}

class CompositeAction extends Action {
  constructor(actionData) {
    super(actionData);

    this.actionList = this.properties.actionList.map(a => attachActionMethods(a));
    this.properties.actionList = this.actionList.map(a => a.serialize());
  }

  apply(board) {
    for (let a of this.actionList) {
      a.apply(board);
    }
  }

  validateData() {
    this.ensureFields(["actionList"]);
  }
}

class UpdateInitiativeAction extends Action {
  apply(board) {
    board.initiative.update(this.properties.initiative);
  }

  validateData() {
    this.ensureFields(["uid", "initiative"]);
  }
}

class AlertAction extends Action {
  apply(board) {
    flashMessage(this.properties.type, this.properties.message);
  }

  validateData() {
    this.ensureFields(["uid", "type", "message"]);
  }
}


const actionTypes = {
  compositeAction: CompositeAction,
  updateInitiativeAction: UpdateInitiativeAction,
  alertAction: AlertAction
};

// Generates random 4 digit code
function generateActionId() {
  return ("0000" + (Math.random()*Math.pow(36,4) << 0).toString(36)).substr(-4);
}

// Usually actions will either get generated from tools / User input or come over the wire
// as json.  This provides a mechanism to attach methods to those purely data-containing objects.
function attachActionMethods(action) {
  if (!("actionType" in action) || !(action.actionType in actionTypes)) {
    throw new Error("Unknown Action Type: " + action.actionType);
  }

  return new actionTypes[action.actionType](action);
}

export {
  Action,
  generateActionId,
  attachActionMethods,
  actionTypes
}