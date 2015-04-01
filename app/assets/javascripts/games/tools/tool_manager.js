
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
    "Square": new SquarePen(this),
    "Circle": new CirclePen(this),
    "Line Pen": new LinePen(this),
    "Eraser": new Eraser(this),
    "Measure": new Measure(this),
    "Radius": new RadiusTemplate(this),
    "Cone": new ConeTemplate(this),
    "Line": new LineTemplate(this),
    "Ping": new PingTool(this),
    "Add Fog": new AddFogPen(this),
    "Remove Fog": new RemoveFogPen(this),
    "Label": new LabelTool(this),
    "Copy": new CopyTool(this),
    "Paste": new PasteTool(this)
  };

  this.toolSet = [
      new ToolMenu("View", {
        children: [
            new ToolMenu("Ping", {
              handler: function() { self.setTool("Ping"); }
            }),

            new ToolMenu("Zoom", {

            })
        ]
      }),

      new ToolMenu("Draw", {
        children: [
          new ToolMenu("Pen", {
            handler: function() { self.setTool("Pen"); }
          }),

          new ToolMenu("Line", {
            handler: function() { self.setTool("Line Pen"); }
          }),

          new ToolMenu("Box", {
            handler: function() { self.setTool("Square"); }
          }),

          new ToolMenu("Circle", {
            handler: function() { self.setTool("Circle"); }
          }),

          new ToolMenu("Erase", {
            handler: function() { self.setTool("Eraser"); }
          }),

          new ToolMenu("Label", {
            handler: function() { self.setTool("Label"); }
          }),

          new ToolMenu("Copy", {
            handler: function() { self.setTool("Copy"); }
          }),

          new ToolMenu("Paste", {
            visible: false,
            handler: function() { self.setTool("Paste"); }
          })
        ]
      }),

      new ToolMenu("Template", {
        children: [
          new ToolMenu("Measure", {
            handler: function() { self.setTool("Measure"); }
          }),

          new ToolMenu("Line", {
            handler: function() { self.setTool("Line"); }
          }),

          new ToolMenu("Radius", {
            handler: function() { self.setTool("Radius"); }
          }),

          new ToolMenu("Cone", {
            handler: function() { self.setTool("Cone"); }
          })
        ]
      }),

      new ToolMenu("Fog", {
        visible: false,
        children: [
          new ToolMenu("Add", {
            handler: function() { self.setTool("Add Fog"); }
          }),

          new ToolMenu("Remove", {
            handler: function() { self.setTool("Remove Fog"); }
          })
        ]
      }),

      new ToolMenu("Tokens", {
        visible: false
      }),

      new ToolMenu("Undo", {
        handler: function() { self.board.undo(); }
      })
  ];

  this.globalShortcutTool = new GlobalShortCuts(this);
}

_.extend(ToolManager.prototype, {

  draw: function() {
    if (this.currentTool) {
      this.currentTool.draw();
    }
  },

  initialize: function() {
    // Ensure a current tool:
    if (!this.currentTool) {
      this.setTool("Pointer");
    }

    this.globalShortcutTool.disable();
    this.globalShortcutTool.enable();

    this.renderer = new ToolRenderer(this.toolSet);
    this.renderer.render();
  },

  setTool: function(name) {
    var tool = this.toolMap[name];

    if (tool) {
      if (this.currentTool) {
        this.currentTool.disable();
      }
      this.currentTool = tool;
      this.currentTool.enable();
      this.currentTool.optionsChanged();
    } else {
      throw "No such tool";
    }
  },

  updateZoom: function(zoom) {

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

  sharedTool: function(name) {
    return this.sharedToolOptions[name];
  }
});

function ToolMenu(name, options) {
  this.name = name;
  this.label = options.label;
  this.toolTip = options.toolTip;
  this.visible = _.has(options, "visible") ? options.visible : true;
  this.children = options.children;
  this.handler = options.handler;
  this.type = _.has(options, "type") ? options.type : (this.children ? "container" : "button");
}

_.extend(ToolMenu.prototype, {
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