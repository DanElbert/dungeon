
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
    "pointer": new Pointer(this),
    "pen": new Pen(this),
    "shape": new ShapeTool(this),
    "eraser": new Eraser(this),
    "template": new TemplateTool(this),
    "ping": new PingTool(this),
    "add_fog": new AddFogPen(this),
    "remove_fog": new RemoveFogPen(this),
    "label": new LabelTool(this),
    "copy": new CopyTool(this),
    "paste": new PasteTool(this)
  };

  this.toolSet = [
    new ToolMenuGroup("pointer_group", [
      new ToolMenuItem("pointer", {
        glyph: "glyphicon-move",
        handler: function() { self.setTool("pointer"); }
      }),

      new ToolMenuItem("ping", {
        glyph: "glyphicon-screenshot",
        handler: function() { self.setTool("ping"); }
      })
    ]),

    new ToolMenuGroup("view_group", [
      new ZoomMenuItem("zoom", {
        glyph: "glyphicon-zoom-in"
      }),

      new ToolMenuItem("add_viewport_savepoint", {
        glyph: "glyphicon-plus"
      })
    ]),

    new ToolMenuGroup("draw_group", [
      new ToolMenuItem("pen", {
        glyph: 'glyphicon-pencil',
        handler: function() { self.setTool("pen"); }
      }),

      new ToolMenuItem("erase", {
        glyph: "glyphicon-erase",
        handler: function() { self.setTool("eraser"); }
      }),

      new ToolMenuItem("shape", {
        glyph: "glyphicon-triangle-top",
        handler: function() { self.setTool("shape"); }
      }),

      new ToolMenuItem("label", {
        glyph: "glyphicon-text-color",
        handler: function() { self.setTool("label"); }
      }),

      new ToolMenuItem("copy", {
        glyph: "glyphicon-copy",
        handler: function() { self.setTool("copy"); }
      }),

      new ToolMenuItem("paste", {
        glyph: "glyphicon-paste",
        visible: false,
        handler: function() { self.setTool("paste"); }
      })
    ]),

    //new ToolMenuGroup("template_group", [
    //
    //]),
    //
    //new ToolMenuGroup("fog_group", [
    //
    //]),
    //
    //new ToolMenuGroup("tokens_group", [
    //
    //]),

    new ToolMenuItem("undo", {
      glyph: "glyphicon-menu-left",
      handler: function() { self.board.undo(); }
    })
  ];

  this.oldToolSet = [
      new ZoomMenuItem("Zoom", {
        doubleWide: true,
        glyph: "glyphicon-zoom-in"
      }),

      new ToolMenuItem("Ping", {
        glyph: "glyphicon-screenshot",
        handler: function() { self.setTool("Ping"); }
      }),

      new ToolMenuItem("Pen", {
        glyph: 'glyphicon-pencil',
        handler: function() { self.setTool("Pen"); }
      }),

      new ToolMenuItem("Erase", {
        glyph: "glyphicon-erase",
        handler: function() { self.setTool("Eraser"); }
      }),

      new ToolMenuItem("Shape", {
        glyph: "glyphicon-triangle-top",
        handler: function() { self.setTool("Shape"); }
      }),

      new ToolMenuItem("Label", {
        glyph: "glyphicon-text-color",
        handler: function() { self.setTool("Label"); }
      }),

      new ToolMenuItem("Copy", {
        glyph: "glyphicon-copy",
        handler: function() { self.setTool("Copy"); }
      }),

      new ToolMenuItem("Paste", {
        glyph: "glyphicon-paste",
        visible: false,
        handler: function() { self.setTool("Paste"); }
      }),

      new ToolMenuItem("Template", {
        glyph: "glyphicon-th",
        handler: function() { self.setTool("Template"); }
      }),

      new ToolMenuItem("AddFog", {
        toolTip: "Add Fog",
        glyph: "glyphicon-cloud-download",
        handler: function() { self.setTool("Add Fog"); }
      }),

      new ToolMenuItem("RemoveFog", {
        toolTip: "Remove Fog",
        glyph: "glyphicon-cloud-upload",
        handler: function() { self.setTool("Remove Fog"); }
      }),

      new ToolMenuItem("Tokens", {
        visible: false
      }),

      new ToolMenuItem("Undo", {
        glyph: "glyphicon-menu-left",
        doubleWide: true,
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
      this.setTool("pointer");
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

      // Select the tool in the menu, unselect anything else
      var recur = function(tools) {
        if (!tools || !tools.length) { return false; }
        var selected = false;
        _.each(tools, function(t) {
          t.selected = recur(t.children) || (t.name == name);
          selected = selected || t.selected;
        });
        return selected;
      };
      recur(this.toolSet);
      this.render();

    } else {
      throw "No such tool";
    }
  },

  setOptions: function() {
    if (this.currentTool) {
      this.renderer.updateOptions(this.currentTool.getOptions());
    }
  },

  updateZoom: function(zoom) {
    this.getMenuItem("zoom").value = zoom;
    this.render();
  },

  toggleDisplay: function() {
    this.renderer.toggleDisplay();
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

  showPasteTool: function() {
    this.getMenuItem("Paste").visible = true;
    this.render();
  },

  hideFogTools: function() {
    this.getMenuItem("AddFog").visible = false;
    this.getMenuItem("RemoveFog").visible = false;
    this.render();
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
        found = recur(i.children, name);
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
  this.tooltip = options.toolTip;
  this.visible = _.has(options, "visible") ? options.visible : true;
  this.selected = _.has(options, "selected") ? options.selected : false;
  this.glyph = options.glyph;
  this.children = options.children;
  this.handler = options.handler;
  this.type = _.has(options, "type") ? options.type : "button";
  this.uid = generateActionId() + generateActionId();
}

_.extend(ToolMenuItem.prototype, {
});

function ToolMenuGroup(name, children) {
  ToolMenuItem.call(this, name, {children: children, type: "mainButton"});
}

_.extend(ToolMenuGroup.prototype, ToolMenuItem.prototype, {

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