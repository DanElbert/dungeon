
function ToolRenderer(tools) {
  this.tools = tools;
  this.options = null;
  this.container = null;
  this.optionContainer = null;
}

_.extend(ToolRenderer.prototype, {

  render: function() {

    var renderer = new ToolMenuRenderer($("#game_board_container"), this.tools);
    renderer.render();
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
    var $e = this.container.find("[data-tool_id='" + this.tool.uid + "']");
    if ($e.length) {
      return $e;
    } else {
      $e = this.createElement();
      $e.attr("data-tool_id", this.tool.uid);
      this.container.append($e);
      return $e;
    }
  },

  childContainer: function($e) {
    return $();
  },

  render: function() {
    var $e = this.ensureElement();
    this.updateElement($e);

    var childContainer = this.childContainer($e);
    var children = this.tool.getChildren();

    if (children && children.length) {
      childContainer.children().attr("__touched", "0");
      _.each(children, function(childTool) {
        var renderer = null;
        switch (childTool.type) {
          case "mainButton":
            renderer = new ToolMainButtonRenderer(childContainer, childTool);
            break;

          case "button":
            renderer = new ToolButtonRenderer(childContainer, childTool);
            break;

          case "zoom":
            renderer = new ZoomToolRenderer(childContainer, childTool);
            break;

          default:
            renderer = new ToolItemRenderer(childContainer, childTool);
        }

        var $child = renderer.render();
        $child.attr("__touched", "1");
      }, this);

      childContainer.find("[__touched='0']").remove();
      childContainer.children().removeAttr("__touched");

    } else {
      childContainer.empty();
    }

    this.container.append($e);

    return $e;
  }
});

function ToolMenuRenderer(container, tool) {
  ToolItemRenderer.call(this, container, tool);
}

_.extend(ToolMenuRenderer.prototype, ToolItemRenderer.prototype, {
  createElement: function() {
    return $("<div />")
      .attr("id", "tool_menu");
  },

  childContainer: function($e) { return $e; },

  updateElement: function($e) {}
});

function ToolMainButtonRenderer(container, tool) {
  ToolItemRenderer.call(this, container, tool);
}

_.extend(ToolMainButtonRenderer.prototype, ToolItemRenderer.prototype, {
  createElement: function() {
    return $("<button />");
  },
  updateElement: function($e) {
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
