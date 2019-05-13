
export class ToolRenderer {
  constructor(tools, drawingSettings) {
    this.tools = tools;
    this.drawingSettings = drawingSettings;
    this.options = null;
    this.element = null;
    this.toolMenu = null;
  }

  render() {

    if (this.element === null) {
      const container = document.getElementById("game_board_container");
      this.element = document.createElement("div");
      container.appendChild(this.element);

      this.toolMenu = VUE_COMPONENTS.install(this.element, VUE_COMPONENTS.BoardToolMenu, {}, {toolsInput: this.tools, drawingSettings: this.drawingSettings});


    } else {
      //this.container.toolMenu("refresh");
    }
  }

  updateOptions(options) {
    this.options = options;
    this.renderOptions();
  }

  toggleDisplay() {
    this.toolMenu.toggleDisplay();
  }

  renderOptions() {
    this.toolMenu.updateOptions(this.options);
  }
}
