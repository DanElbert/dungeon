
function ToolRenderer(tools) {
  this.tools = tools;
  this.options = null;
  this.element = null;
  this.toolMenu = null;
  //this.optionContainer = null;
}

_.extend(ToolRenderer.prototype, {

  render: function() {

    if (this.element === null) {
      const container = document.getElementById("game_board_container");
      this.element = document.createElement("div");
      container.appendChild(this.element);

      this.toolMenu = VUE_COMPONENTS.install(this.element, VUE_COMPONENTS.BoardToolMenu, {}, {toolsInput: this.tools});


    } else {
      //this.container.toolMenu("refresh");
    }
  },

  updateOptions: function(options) {
    this.options = options;
    this.renderOptions();
  },

  toggleDisplay: function() {
    this.toolMenu.$refs.component.toggleDisplay();
  },

  renderOptions: function() {
    this.toolMenu.$refs.component.updateOptions(this.options);
  }

});


