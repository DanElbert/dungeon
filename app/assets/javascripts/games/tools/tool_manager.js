
function ToolManager(board) {
  this.board = board;
  this.currentTool = null;

  var self = this;

  this.sharedToolOptions = {
    drawingColor: new EventingOption({type: "color", label: "Color", name: "color", value: "#000000"}),
    drawingBackgroundColor: new EventingOption({type: "color", label: "Background Color", name: "backgroundColor", includeClear: true, value: null}),
    drawingWidth: new EventingOption({type: "size", name: "width", label: "Width", sizes: [3, 5, 7, 10, 15, 20], value: 7 }),
    fogWidth: new EventingOption({type: "size", name: "width", label: "Width", sizes: [25, 75, 100, 200, 500], value: 75 }),
    templateColor: new EventingOption({type: "color", name: "color", label: "Color", value: "#EE204D"})
  };

  this.toolMap = {
    "pointer": new Pointer(this),
    "pen": new Pen(this),
    "shape": new ShapeTool(this),
    "eraser": new Eraser(this),
    "template": new TemplateTool(this),
    "measure_template": new Measure(this),
    "line_template": new LineTemplate(this),
    "radius_template": new RadiusTemplate(this),
    "cone_template": new ConeTemplate(this),
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

    new ToolMenuGroup("view_group", {noClickthrough: true}, [
      new ZoomMenuItem("zoom", {
        glyph: "glyphicon-zoom-in",
        handler: function(zoom) { self.changeZoom(zoom); }
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

      new ToolMenuItem("eraser", {
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

    new ToolMenuGroup("template_group", [
      new ToolMenuItem("measure_template", {
        glyph: "glyphicon-option-vertical",
        handler: function() { self.setTool("measure_template"); }
      }),

      new ToolMenuItem("line_template", {
        glyph: "glyphicon-minus",
        handler: function() { self.setTool("line_template"); }
      }),

      new ToolMenuItem("radius_template", {
        glyph: "glyphicon-record",
        handler: function() { self.setTool("radius_template"); }
      }),

      new ToolMenuItem("cone_template", {
        glyph: "glyphicon-triangle-bottom",
        handler: function() { self.setTool("cone_template"); }
      })
    ]),

    new ToolMenuGroup("fog_group", [
      new ToolMenuItem("add_fog", {
        glyph: "glyphicon-cloud",
        handler: function() { self.setTool("add_fog"); }
      }),

      new ToolMenuItem("remove_fog", {
        glyph: "glyphicon-eye-open",
        handler: function() { self.setTool("remove_fog"); }
      })
    ]),

    //new ToolMenuGroup("tokens_group", [
    //
    //]),

    new ToolMenuItem("undo", {
      glyph: "glyphicon-menu-left",
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

      var menuItem = this.getMenuItem(name);

      if (menuItem) {
        _.each(this.toolSet, function(t) {t.unselect();});
        menuItem.select();
      }

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

  // Updates the menu UI
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

  // Changes the board's zoom, which will call updateZoom and update the UI
  changeZoom: function(zoom) {
    this.board.setZoom(zoom);
  },

  showPasteTool: function() {
    this.getMenuItem("paste").visible = true;
    this.render();
  },

  hideFogTools: function() {
    this.getMenuItem("fog_group").visible = false;
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
  this.noClickthrough = _.has(options, "noClickthrough") ? options.noClickthrough : false;
  this.glyph = options.glyph;
  this.children = options.children;
  this.handler = options.handler;
  this.type = _.has(options, "type") ? options.type : "button";

  _.each(this.children, function(c) {c.parent = this;}, this);
}

_.extend(ToolMenuItem.prototype, {
  unselect: function() { this.selected = false; },

  unselectOtherChildren: function(keep) {
    _.each(this.children, function(c) {
      if (c.name != keep) {c.unselect();}
    }, this);
  },

  select: function() {
    this.selected = true;
    if (this.parent) {
      this.parent.unselectOtherChildren(this.name);
      this.parent.select();
    }
  }
});

function ToolMenuGroup(name, options, children) {
  if (arguments.length == 2) {
    children = options;
    options = {};
  }
  _.extend(options, {children: children, type: "mainButton"});
  ToolMenuItem.call(this, name, options);
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