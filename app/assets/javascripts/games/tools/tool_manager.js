
function ToolManager(board) {
  this.board = board;
  this.currentTool = null;

  this.sharedToolOptions = {
    drawingColor: {type: "color", label: "Color", name: "color", value: "#000000"},
    drawingBackgroundColor: {type: "color", label: "Background Color", name: "backgroundColor", includeClear: true, value: null},
    drawingWidth: {type: "size", name: "width", label: "Width", sizes: [3, 5, 7, 10, 15, 20], value: 7 },
    fogWidth: {type: "size", name: "width", label: "Width", sizes: [25, 75, 100, 200, 500], value: 75 },
    templateColor: {type: "color", name: "color", label: "Color", value: "#EE204D"}
  };

  this.toolMap = {
    "Pointer": new Pointer(this),
    "Pen": new Pen(this),
    "Square": new SquarePen(this),
    "Circle": new CirclePen(this),
    "Line Pen": new LinePen(this),
    "Eraser": new Eraser(this),
    "Measure": new Measure(this),
    "Radius": new RadiusTemplate(this),
    "Cone": new ConeTemplate(this),
    "Line": new LineTemplate(this),
    "Ping": new PingTool(this),
    "Add Fog": new AddFogPen(this),
    "Remove Fog": new RemoveFogPen(this),
    "Label": new LabelTool(this),
    "Copy": new CopyTool(this),
    "Paste": new PasteTool(this)
  };

  this.globalShortcutTool = new GlobalShortCuts(this);
}

_.extend(ToolManager.prototype, {

  initialize: function() {
    // Ensure a current tool:
    if (!this.currentTool) {
      this.setTool("Pointer");
    }

    this.globalShortcutTool.disable();
    this.globalShortcutTool.enable();
  },

  setTool: function(name) {
    var tool = this.toolMap[name];

    if (tool) {
      if (this.currentTool) {
        this.currentTool.disable();
      }
      this.currentTool = tool;
      this.currentTool.enable();
      this.currentTool.optionsChanged();
    } else {
      throw "No such tool";
    }
  },

  updateZoom: function(zoom) {

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

  hideCameraButton: function() {

  },

  showCameraButton: function() {

  },

  sharedTool: function(name) {
    return this.sharedToolOptions[name];
  }
});