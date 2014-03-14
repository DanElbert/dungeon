
function createActionType(name, superclass, methods) {
  methods = methods || {};
  var str =
    "var " + name + " = function() {\n" +
    "  if (superclass) {\n" +
    "    this.super = superclass.prototype;\n" +
    "  }\n" +
    "  if (this.initialize) { this.initialize.apply(this, arguments); }\n" +
    "};\n" +
    name + ";";

  var klass = eval(str);

  klass.prototype = _.extend({}, superclass ? superclass.prototype : klass.prototype, methods);
  return klass;
}

var Action = createActionType("Action", null, {
  initialize: function(actionData) {
    this.properties = this.defaultValues();
    _.extend(this.properties, actionData);

    Object.defineProperty(this, "actionType", { enumerable : true, get: function() { return this.properties.actionType; }});
    Object.defineProperty(this, "uid", { enumerable : true, get: function() { return this.properties.uid; }});

    this.validateData();
  },
  isRemoval: function() { return false; },
  isPersistent: function() { return false; },
  defaultValues: function() {
    return { isPersistent: this.isPersistent(), isRemoval: this.isRemoval() };
  },
  apply: function (board) {},
  validateData: function() {},
  extend: function() { return null; },
  ensureFields: function(fieldList) {
    _.each(fieldList, function(field) {
      if (!_.has(this.properties, field)) {
        throw new Error("Action of type " + this.actionType + " missing required field " + field);
      }
    }, this);
  },
  clone: function() {
    return attachActionMethods(JSON.parse(JSON.stringify(this.properties)));
  },
  serialize: function() {
    return this.properties;
  }
});

var actionTypes = {
  compositeAction: createActionType("CompositeAction", Action, {
    initialize: function(actionData) {
      this.super.initialize.apply(this, arguments);
      this.actionList = _.map(this.properties.actionList, function(a) {
        return attachActionMethods(a);
      }, this);

      this.properties.actionList = _.map(this.actionList, function(a) {
        return a.serialize();
      }, this);
    },

    apply: function(board) {
      _.each(this.actionList, function(a) {
        a.apply(board);
      }, this);
    },

    validateData: function() {
      this.ensureFields(["actionList"]);
    }
  }),

  updateInitiativeAction: createActionType("UpdateInitiativeAction", Action, {
    apply: function (board) {
      board.initiative.update(this.properties.initiative);
    },
    validateData: function() {
      this.ensureFields(["uid", "initiative"]);
    }
  }),

  alertAction: createActionType("AlertAction", Action, {
    apply: function(board) {
      flashMessage(this.properties.type, this.properties.message);
    },
    validateData: function() {
      this.ensureFields(["uid", "type", "message"])
    }
  })
};

// Generates random 4 digit code
function generateActionId() {
  return ("0000" + (Math.random()*Math.pow(36,4) << 0).toString(36)).substr(-4);
}

// Usually actions will either get generated from tools / User input or come over the wire
// as json.  This provides a mechanism to attach methods to those purely data-containing objects.
function attachActionMethods(action) {
  if (!_.has(action, 'actionType') || !_.has(actionTypes, action.actionType)) {
    throw new Error("Unknown Action Type: " + action.actionType);
  }

  return new actionTypes[action.actionType](action);
}