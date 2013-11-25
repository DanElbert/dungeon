
var actionMethods = {
  default: {
    isPersistent: false,
    isRemoval: false,
    apply: function (board) {},
    validateData: function() {},
    extend: function() { return null; },
    ensureFields: function(fieldList) {
      _.each(fieldList, function(field) {
        if (!_.has(this, field)) {
          throw new Error("Action of type " + this.actionType + " missing required field " + field);
        }
      }, this);
    },
    clone: function() {
      var clone = _.omit(this, _.functions(this));
      return clone;
    }
  },

  compositeAction: {
    apply: function(board) {
      _.each(this.actionList, function(a) {
        a.apply(board);
      }, this);
    },

    validateData: function() {
      this.ensureFields(["actionList"]);
    }
  },

  updateInitiativeAction: {
    apply: function (board) {
      board.initiative.update(this.initiative);
    },
    validateData: function() {
      this.ensureFields(["uid", "initiative"]);
    }
  }
};

// Generates random 4 digit code
function generateActionId() {
  return ("0000" + (Math.random()*Math.pow(36,4) << 0).toString(36)).substr(-4);
}

// Usually actions will either get generated from tools / User input or come over the wire
// as json.  This provides a mechanism to attach methods to those purely data-containing objects.
function attachActionMethods(action) {
  _.defaults(action, {actionType: "default"});

  if (!_.has(actionMethods, action.actionType)) {
    throw new Error("Unknown Action Type: " + action.actionType);
  }

  // Apply action specific methods
  _.extend(action, actionMethods[action.actionType]);

  // Apply any extend methods
  if (action.extend) {
    _.defaults(action, actionMethods[action.extend()]);
  }

  // Apply any defaults not overridden by action methods
  _.defaults(action, actionMethods.default);

  // Attach a new privateData object
  action.privateData = {};

  // Validate action data
  action.validateData();

  // Extra Special Magic Case
  if (action.actionType == "compositeAction") {
    _.each(action.actionList, function(a) { attachActionMethods(a);});
  }

  return action;
}