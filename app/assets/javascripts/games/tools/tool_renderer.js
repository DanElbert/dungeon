
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
    this.renderInto(this.container, this.tools);

    this.container.dialog({
      autoOpen: true,
      closeOnEscape: false,
      resizable: false,
      minWidth: 10,
      width: 125,
      height: 450,
      position: {my: "left top", at: "left+10px top+10px", of: "#game_board_container"},
      dialogClass: "tool_dialog",
      title: "Tools"
    });
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

        this.renderInto(wrapper, tool.getChildren());

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