
var actionMethods = {
  default: {
    apply: function (board) {},
    validateData: function() {},
    ensureFields: function(fieldList) {
      _.each(fieldList, function(field) {
        if (!_.has(this, field)) {
          throw new Error("Action of type " + this.actionType + " missing required field " + field);
        }
      }, this);
    }
  },

  // A pen action consists of a color, a width, and a collection of lines that are to be drawn on the drawing layer
  penAction: {
    apply: function(board) {
      board.drawing_actions.push(this);
      board.drawingDrawing.drawLines(this.color, this.width, this.lines);
    },

    validateData: function() {
      this.ensureFields(["color", "width", "lines"]);
    }
  }
};

// Usually actions will either get generated from tools / User input or come over the wire
// as json.  This provides a mechanism to attach methods to those purely data-containing objects.
function attachActionMethods(action) {
  _.defaults(action, {actionType: "default"});

  if (!_.has(actionMethods, action.actionType)) {
    throw new Error("Unknown Action Type: " + action.actionType);
  }

  // Apply action specific methods
  _.extend(action, actionMethods[action.actionType]);

  // Apply any defaults not overridden by action methods
  _.defaults(action, actionMethods.default);

  // Validate action data
  action.validateData();

  return action;
}