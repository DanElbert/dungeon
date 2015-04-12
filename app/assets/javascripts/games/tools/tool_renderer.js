
function ToolRenderer(tools) {
  this.tools = tools;
  this.options = null;
  this.container = null;
  this.optionContainer = null;
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
    this.options = options;
    this.renderOptions();
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

      case "zoom":
        renderer = new ZoomToolRenderer(container, tool);
        break;

      default:
        renderer = new ToolItemRenderer(container, tool);
    }

    var $e = renderer.render();

    this.buildTools($e, tool.getChildren());
  },

  renderOptions: function() {
    if (this.optionContainer) {
      this.optionContainer.remove();
    }

    this.optionContainer = $("<div id='option_container' />")
      .appendTo(this.container);

    if (this.options) {
      this.options.each(function(o) {
        switch (o.type) {
          case "color":
            new ColorOptionRenderer(this.optionContainer, o).render();
            break;

          default:
            $("<span />").text(o.name + ": " + o.value).appendTo(this.optionContainer);
        }
      }, this);
    }
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
      if (this.tool.doubleWide) {
        $e.addClass("double_wide");
      }
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
        .attr("data-toggle", "tooltip")
        .attr("data-placement", "right")
        .attr("title", this.tool.toolTip())
        .on("click", function() { self.tool.handle(); })
        .tooltip({container: 'body', delay: 250});
  },
  updateElement: function($e) {
    $e.empty();
    if (this.tool.glyph) {
      $e.append(
          $("<span />").addClass('glyphicon').addClass(this.tool.glyph)
      );
    } else {
      $e.text(this.tool.displayName());
    }

    if (this.tool.visible) {
      $e.show();
    } else {
      $e.hide();
    }
  }
});

function ZoomToolRenderer(container, tool) {
  ToolItemRenderer.call(this, container, tool);
}

_.extend(ZoomToolRenderer.prototype, ToolItemRenderer.prototype, {
  createElement: function() {
    var self = this;
    return $("<button />")
        .addClass("tool_button zoom")
        .on("click", function() { self.tool.handle(); });
  },
  updateElement: function($e) {
    $e.empty();

    $e.append(
        $("<span />").addClass('glyphicon').addClass(this.tool.glyph)
    );

    $e.append(
        $("<span />").text(this.tool.displayName())
    );


    if (this.tool.visible) {
      $e.show();
    } else {
      $e.hide();
    }
  }
});

function ListOptionRenderer(container, opt) {
  this.container = container;
  this.option = opt;
}

_.extend(ListOptionRenderer.prototype, {
  render: function() {

  }
});

function ColorOptionRenderer(container, opt) {
  ListOptionRenderer.call(this, container, opt);
  this.baseColors = [
    {name: "Black", color: "#000000"},
    {name: "Blue", color: "#1F75FE"},
    {name: "Brown", color: "#B4674D"},
    {name: "Green", color: "#1CAC78"},
    {name: "Orange", color: "#FF7538"},
    {name: "Red", color: "#EE204D"},
    {name: "Purple", color: "#926EAE"},
    {name: "Yellow", color: "#FCE883"}
  ];
}

_.extend(ColorOptionRenderer.prototype, ListOptionRenderer.prototype, {
  colors: function() {
    var colors = this.baseColors.slice(0);
    if (this.option.includeClear) {
      colors.unshift({name: "Clear", color: null});
    }
    return colors;
  },

  render: function() {
    var self = this;
    var $widget = $('<div></div>').addClass('toolMenu');
    var vals = _.map(this.colors(), function(c) { return c.color; });

    $widget.toolMenu({
      values: vals,
      initialValue: this.option.value || this.colors()[0].color,
      contentCallback: function(value) {
        var $content = $("<div></div>").css('width', '100%').css('height', '100%');
        if (value == null) {
          $content.css("background-color", "white");
        } else {
          $content.css("background-color", value);
        }
        return $content;
      },
      selectedCallback: function(value) {
        self.option.value = value;
      }
    });

    $widget.appendTo(this.container);
  }
});
