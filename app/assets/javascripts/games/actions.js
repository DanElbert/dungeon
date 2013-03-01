
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
      this.ensureFields(["color", "width", "lines", "uid"]);
    }
  },

  // References a drawing action to remove
  removeDrawingAction: {
    apply: function(board) {
      var index = null;

      for (var x = board.drawing_actions.length - 1; x >= 0; x--) {
        if (board.drawing_actions[x].uid == this.actionId) {
          index = x;
          break;
        }
      }

      if (index != null) {
        if (index == 0) {
          board.drawing_actions.shift();
        } else {
          board.drawing_actions.splice(index, 1);
        }
        board.regenerateDrawing();
      }

    },

    validateData: function() {
      this.ensureFields(["actionId", "uid"]);
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

  // Apply any defaults not overridden by action methods
  _.defaults(action, actionMethods.default);

  // Validate action data
  action.validateData();

  return action;
}