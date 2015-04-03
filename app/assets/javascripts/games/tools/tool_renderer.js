
function ToolRenderer(tools) {
  this.tools = tools;
  this.container = null;
  this.defaultPosition = {my: "left top", at: "left+25px top+20px", of: "#game_board_container"};
}

_.extend(ToolRenderer.prototype, {

  render: function() {
    if (!this.container) {
      this.initContainer();
    }
    this.buildTools(this.container, this.tools);
  },

  initContainer: function() {
    var self = this;
    this.container = $("<div id='tool_container'/>").appendTo($("#dialog_container"));

    this.container.dialog({
      autoOpen: true,
      closeOnEscape: false,
      resizable: false,
      minWidth: 10,
      width: 125,
      height: 350,
      position: this.defaultPosition,
      dialogClass: "tool_dialog",
      title: "Tools",
      open: function(evt, ui) {
        var $this = $(this);
        $this.dialog("option", "position", self.defaultPosition);
      }
    });
  },

  updateOptions: function(options) {

  },

  toggleDisplay: function() {
    if (this.container.dialog("isOpen")) {
      this.container.dialog("close");
    } else {
      this.container.dialog("open");
    }
  },

  buildTools: function(container, tools) {
    _.each(tools, function(t) {
      this.renderTool(container, t);
    }, this);
  },

  renderTool: function(container, tool) {
    var renderer = null;
    switch (tool.type) {
      case "container":
        renderer = new ToolContainerRenderer(container, tool);
        break;

      case "button":
        renderer = new ToolButtonRenderer(container, tool);
        break;

      default:
        renderer = new ToolItemRenderer(container, tool);
    }

    var $e = renderer.render();

    this.buildTools($e, tool.getChildren());
  }

});

function ToolItemRenderer(container, tool) {
  this.container = container;
  this.tool = tool;
}

_.extend(ToolItemRenderer.prototype, {
  createElement: function() {
    return $("<span />");
  },

  updateElement: function($e) {
    $e.text(this.tool.displayName());
  },

  ensureElement: function() {
    var $e = this.container.find(".tool-item-" + this.tool.name);
    if ($e.length) {
      return $e;
    } else {
      $e = this.createElement();
      $e.addClass("tool-item-" + this.tool.name);
      this.container.append($e);
      return $e;
    }
  },

  render: function() {
    var $e = this.ensureElement();
    this.updateElement($e);
    return $e;
  }
});

function ToolContainerRenderer(container, tool) {
  ToolItemRenderer.call(this, container, tool);
}

_.extend(ToolContainerRenderer.prototype, ToolItemRenderer.prototype, {
  createElement: function() {
    return $("<fieldset />")
      .append($("<legend />"));
  },
  updateElement: function($e) {
    $e.find("legend").text(this.tool.displayName());
    if (this.tool.visible) {
      $e.show();
    } else {
      $e.hide();
    }
  }
});

function ToolButtonRenderer(container, tool) {
  ToolItemRenderer.call(this, container, tool);
}

_.extend(ToolButtonRenderer.prototype, ToolItemRenderer.prototype, {
  createElement: function() {
    var self = this;
    return $("<button />")
      .addClass("tool_button")
      .on("click", function() { self.tool.handle(); });
  },
  updateElement: function($e) {
    $e.text(this.tool.displayName());
    if (this.tool.visible) {
      $e.show();
    } else {
      $e.hide();
    }
  }
});