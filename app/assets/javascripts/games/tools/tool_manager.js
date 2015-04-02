
function ToolManager(board) {
  this.board = board;
  this.currentTool = null;

  var self = this;

  this.sharedToolOptions = {
    drawingColor: {type: "color", label: "Color", name: "color", value: "#000000"},
    drawingBackgroundColor: {type: "color", label: "Background Color", name: "backgroundColor", includeClear: true, value: null},
    drawingWidth: {type: "size", name: "width", label: "Width", sizes: [3, 5, 7, 10, 15, 20], value: 7 },
    fogWidth: {type: "size", name: "width", label: "Width", sizes: [25, 75, 100, 200, 500], value: 75 },
    templateColor: {type: "color", name: "color", label: "Color", value: "#EE204D"}
  };

  this.toolMap = {
    "Pointer": new Pointer(this),
    "Pen": new Pen(this),
    "Shape": new ShapeTool(this),
    "Eraser": new Eraser(this),
    "Template": new TemplateTool(this),
    "Ping": new PingTool(this),
    "Add Fog": new AddFogPen(this),
    "Remove Fog": new RemoveFogPen(this),
    "Label": new LabelTool(this),
    "Copy": new CopyTool(this),
    "Paste": new PasteTool(this)
  };

  this.toolSet = [
      new ToolMenuItem("View", {
        children: [
            new ToolMenuItem("Ping", {
              handler: function() { self.setTool("Ping"); }
            }),

          new ZoomMenuItem("Zoom", {})
        ]
      }),

      new ToolMenuItem("Draw", {
        children: [
          new ToolMenuItem("Pen", {
            handler: function() { self.setTool("Pen"); }
          }),

          new ToolMenuItem("Erase", {
            handler: function() { self.setTool("Eraser"); }
          }),

          new ToolMenuItem("Shape", {
            handler: function() { self.setTool("Shape"); }
          }),

          new ToolMenuItem("Label", {
            handler: function() { self.setTool("Label"); }
          }),

          new ToolMenuItem("Copy", {
            handler: function() { self.setTool("Copy"); }
          }),

          new ToolMenuItem("Paste", {
            visible: false,
            handler: function() { self.setTool("Paste"); }
          })
        ]
      }),

      new ToolMenuItem("Template", {
        children: [
          new ToolMenuItem("Template", {
            handler: function() { self.setTool("Template"); }
          })
        ]
      }),

      new ToolMenuItem("Fog", {
        visible: false,
        children: [
          new ToolMenuItem("Add", {
            handler: function() { self.setTool("Add Fog"); }
          }),

          new ToolMenuItem("Remove", {
            handler: function() { self.setTool("Remove Fog"); }
          })
        ]
      }),

      new ToolMenuItem("Tokens", {
        visible: false
      }),

      new ToolMenuItem("Undo", {
        handler: function() { self.board.undo(); }
      })
  ];

  this.globalShortcutTool = new GlobalShortCuts(this);
}

_.extend(ToolManager.prototype, {

  // Draws the current tool onto the board
  draw: function() {
    if (this.currentTool) {
      this.currentTool.draw();
    }
  },

  // Builds and/or updates the HTML tool menu
  render: function() {
    if (!this.renderer) {
      this.renderer = new ToolRenderer(this.toolSet);
    }
    this.renderer.render();
  },

  initialize: function() {
    // Ensure a current tool:
    if (!this.currentTool) {
      this.setTool("Pointer");
    }

    this.globalShortcutTool.disable();
    this.globalShortcutTool.enable();

    this.render();
  },

  setTool: function(name) {
    var tool = this.toolMap[name];

    if (tool) {
      if (this.currentTool) {
        this.currentTool.disable();
      }
      this.currentTool = tool;
      this.currentTool.enable();
      this.setOptions();
      this.currentTool.optionsChanged();
    } else {
      throw "No such tool";
    }
  },

  setOptions: function() {

  },

  updateZoom: function(zoom) {
    this.getMenuItem("Zoom").value = zoom;
    this.render();
  },

  undo: function() {
    this.board.undo();
  },

  clearTokens: function() {
    this.board.clearTokens();
  },

  changeZoom: function(zoom) {
    this.board.setZoom(zoom);
  },

  hideCameraButton: function() {

  },

  showCameraButton: function() {

  },

  getMenuItem: function(name) {
    var recur = function(items, name) {
      var found = null;
      _.find(items, function(i) {
        if (i.name == name) {
          found = i;
          return true;
        }
        found = recur(i.getChildren(), name);
        return found != null;
      }, this);
      return found;
    };

    return recur(this.toolSet, name);
  },

  sharedTool: function(name) {
    return this.sharedToolOptions[name];
  }
});

function ToolMenuItem(name, options) {
  this.name = name;
  this.label = options.label;
  this.toolTip = options.toolTip;
  this.active = _.has(options, "active") ? options.active : false;
  this.visible = _.has(options, "visible") ? options.visible : true;
  this.children = options.children;
  this.handler = options.handler;
  this.type = _.has(options, "type") ? options.type : (this.children ? "container" : "button");
  this.uid = generateActionId() + generateActionId();
}

_.extend(ToolMenuItem.prototype, {
  handle: function() {
    if (this.handler) {
      this.handler.call(this);
    }
  },

  displayName: function() {
    return this.label || this.name;
  },

  getChildren: function() {
    return this.children || [];
  }
});

function ZoomMenuItem(name, options) {
  ToolMenuItem.call(this, name, options);
  this.type = "zoom";
  this.value = options.value || 1.0;
}

_.extend(ZoomMenuItem.prototype, ToolMenuItem.prototype, {
  displayName: function() {
    return this.value;
  }
});