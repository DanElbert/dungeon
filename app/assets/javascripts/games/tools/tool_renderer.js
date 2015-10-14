
function ToolRenderer(tools) {
  this.tools = tools;
  this.options = null;
  this.container = null;
  this.optionContainer = null;
}

_.extend(ToolRenderer.prototype, {

  render: function() {

    if (this.container == null) {
      this.container = $("<div />")
        .attr("id", "tool_menu")
        .appendTo("#game_board_container");

      this.container.toolMenu({tools: this.tools});
    } else {
      this.container.toolMenu("refresh");
    }
  },

  updateOptions: function(options) {
    this.options = options;
    this.renderOptions();
  },

  toggleDisplay: function() {
    this.container.toggle();

    if (this.options && this.options.length) {
      this.optionContainer.toggle();
    }
  },

  renderOptions: function() {
    var rawOpts = [];

    this.options.each(function(o) { rawOpts.push(o); }, this);

    if (this.optionContainer == null) {
      this.optionContainer = $("<div />")
        .attr("id", "tool_option_menu")
        .appendTo("#game_board_container");

      this.optionContainer.toolOptionMenu({toolOptions: rawOpts});
    } else {
      this.optionContainer.toolOptionMenu("setOptions", rawOpts);
    }
  }

});


