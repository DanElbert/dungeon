
function ToolRenderer(tools) {
  this.tools = tools;
  this.container = null;
}

_.extend(ToolRenderer.prototype, {

  render: function() {
    if (!this.container) {
      this.build();
    }
  },

  build: function() {
    this.container = $("<div id='tool_container'/>").appendTo($("#dialog_container"));
    this.container.dialog({
      autoOpen: true,
      closeOnEscape: false,
      position: {my: "left top", at: "left top", of: "#game_board_container"},
      dialogClass: "tool_dialog",
      title: "Tools"
    });

    this.renderInto(this.container, this.tools);
  },

  renderInto: function(container, tools) {
    _.each(tools, function(tool) {
      container.append(this.renderTool(tool));
    }, this);
  },

  renderTool: function(tool) {
    switch (tool.type) {
      case "container":
        var wrapper = $("<fieldset />")
            .append($("<legend />").text(tool.displayName()));

        _.each(tool.getChildren(), function(c) {
          wrapper.append(this.renderTool(c));
        }, this);

        return wrapper;
        break;

      case "button":
        return $("<button />")
            .text(tool.displayName())
            .addClass("tool_button")
            .on("click", function() { tool.handle(); });
        break;

      default:
        return $("<div />").text(tool.displayName());
    }
  }

});