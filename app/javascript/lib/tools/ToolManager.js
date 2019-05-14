import Eventer from "../Eventer";
import { ToolMenuGroup, ToolMenuItem, CheckMenuItem, ZoomMenuItem } from "../tool_menu/BoardTools";
import { ToolRenderer } from "./ToolRenderer";
import { CopyTool, PasteTool } from "./CopyPaste";
import { Eraser, Pen } from "./Drawing";
import { AddFogPen, RemoveFogPen} from "./Fog";
import { GlobalShortCuts } from "./GlobalShortcuts";
import { InsertImageTool } from "./InsertImage";
import { LabelTool } from "./Label";
import { OverlandMeasureTemplateTool } from "./OverlandTemplates";
import { PingTool } from "./Ping";
import { Pointer } from "./Pointer";
import { ReachTemplateTool } from "./ReachTemplates";
import { ShapeTool } from "./Shape";
import { ConeTemplate, LineTemplate, Measure, RadiusTemplate, RectangleTemplate } from "./Templates";
import { TokenTool } from "./Tokens";
import { generateActionId } from "../Actions";

export class ToolManager extends Eventer {
  
  constructor(board) {
    super();

    this.board = board;
    this.currentTool = null;

    var self = this;

    this.sharedToolOptions = {
      drawingColor: ({type: "color", label: "Color", name: "color", value: "#000000"}),
      drawingBackgroundColor: ({type: "color", label: "Background Color", name: "backgroundColor", includeClear: true, value: null}),
      drawingWidth: ({type: "size", name: "width", label: "Width", sizes: [5, 7, 10, 15, 20, 30], value: 7 }),
      fogWidth: ({type: "size", name: "width", label: "Width", sizes: [25, 75, 100, 200, 500], value: 75 }),
      templateColor: ({type: "color", name: "color", label: "Color", value: "#EE204D"}),
      copiedImage: ({type: "copiedImage", url: this.board.copiedArea, name: 'copiedImage'})
    };

    this.toolMap = {
      "pointer": new Pointer(this),
      "pen": new Pen(this),
      "shape": new ShapeTool(this),
      "eraser": new Eraser(this),
      "measure_template": new Measure(this),
      "line_template": new LineTemplate(this),
      "rectangle_template": new RectangleTemplate(this),
      "radius_template": new RadiusTemplate(this),
      "cone_template": new ConeTemplate(this),
      "reach_template": new ReachTemplateTool(this),
      "overland_measure_template": new OverlandMeasureTemplateTool(this),
      "ping": new PingTool(this),
      "add_fog": new AddFogPen(this),
      "remove_fog": new RemoveFogPen(this),
      "label": new LabelTool(this),
      "copy": new CopyTool(this),
      "paste": new PasteTool(this),
      "insert_image": new InsertImageTool(this),
      "tokens": new TokenTool(this)
    };

    this.templateGroups = {
      pathfinder: "pathfinder_template_group",
      overland: "overland_template_group"
    };

    this.toolSet = [
      new ToolMenuGroup("pointer_group", [
        new ToolMenuItem("pointer", {
          label: "Pointer",
          glyph: "fas fa-mouse-pointer",
          handler: function() { self.setTool("pointer"); }
        }),

        new ToolMenuItem("ping", {
          label: "Ping",
          glyph: "fas fa-bullseye",
          handler: function() { self.setTool("ping"); }
        })
      ]),

      new ToolMenuGroup("view_group", {noClickthrough: true}, [
        new ZoomMenuItem("zoom", {
          label: "Zoom",
          glyph: "fas fa-search-plus",
          handler: function(zoom) { self.changeZoom(zoom); }
        }),

        new ToolMenuItem("tokens", {
          label: "Tokens",
          glyph: "fas fa-user-circle",
          handler: function() { self.setTool("tokens"); }
        }),

        new ToolMenuItem("fullscreen", {
          label: "Fullscreen",
          glyph: "fas fa-tv",
          handler: function() {
            self.board.toggleFullscreen();
          }
        }),

        new ToolMenuItem("save_viewport", {
          label: "Save View",
          glyph: "fas fa-plus",
          handler: function() {
            self.board.saveViewPort();
          }
        }),

        new ToolMenuItem("restore_viewport", {
          label: "Restore View",
          glyph: "fas fa-minus",
          visible: false,
          handler: function() {
            self.board.restoreViewPort();
          }
        }),

        new CheckMenuItem("view_port_sync", {
          label: "Sync View",
          glyph: "fas fa-sync-alt",
          handler: function() {
            self.board.viewPortManager.toggleSynced();
          }
        })
      ]),

      new ToolMenuGroup("draw_group", [
        new ToolMenuItem("pen", {
          label: "Pen",
          glyph: 'fas fa-pen',
          handler: function() { self.setTool("pen"); }
        }),

        new ToolMenuItem("eraser", {
          label: "Eraser",
          glyph: "fas fa-eraser",
          handler: function() { self.setTool("eraser"); }
        }),

        new ToolMenuItem("shape", {
          label: "Shapes",
          tooltip: "Draw lines, circles, and rectangles",
          glyph: "fas fa-shapes",
          handler: function() { self.setTool("shape"); }
        }),

        new ToolMenuItem("label", {
          label: "Label",
          tooltip: "Create a text label",
          glyph: "fas fa-font",
          handler: function() { self.setTool("label"); }
        }),

        new ToolMenuItem("insert_image", {
          label: "Image",
          tooltip: "Insert an image",
          glyph: "far fa-image",
          handler: function() { self.setTool("insert_image"); }
        }),

        new ToolMenuItem("copy", {
          label: "Copy",
          tooltip: "Copy a section of the drawing layer",
          glyph: "fas fa-copy",
          handler: function() { self.setTool("copy"); }
        }),

        new ToolMenuItem("paste", {
          label: "Paste",
          tooltip: "Paste copied region",
          glyph: "fas fa-paste",
          visible: false,
          handler: function() { self.setTool("paste"); }
        })
      ]),

      new ToolMenuGroup("pathfinder_template_group", [
        new ToolMenuItem("measure_template", {
          label: "Measure",
          tooltip: "Measures movement distance in a straight line",
          glyph: "fas fa-ruler",
          handler: function() { self.setTool("measure_template"); }
        }),

        new ToolMenuItem("line_template", {
          label: "Line",
          tooltip: "Creates a line template (ie: Lightning Bolt)",
          glyph: "fas fa-bolt",
          handler: function() { self.setTool("line_template"); }
        }),

        new ToolMenuItem("rectangle_template", {
          label: "Rectangle",
          tooltip: "Creates a rectangle template",
          glyph: "far fa-square",
          handler: function() { self.setTool("rectangle_template"); }
        }),

        new ToolMenuItem("radius_template", {
          label: "Radius",
          tooltip: "Creates a circular radius template",
          glyph: "far fa-circle",
          handler: function() { self.setTool("radius_template"); }
        }),

        new ToolMenuItem("cone_template", {
          label: "Cone",
          tooltip: "Creates a cone template",
          glyph: "fas fa-play",
          handler: function() { self.setTool("cone_template"); }
        }),

        new ToolMenuItem("reach_template", {
          label: "Reach",
          tooltip: "Creates creature reach template",
          glyph: "fas fa-dharmachakra",
          handler: function() { self.setTool("reach_template"); }
        })
      ]),

      new ToolMenuGroup("overland_template_group", [
        new ToolMenuItem("overland_measure_template", {
          label: "Measure",
          tooltip: "Measure distances",
          glyph: "fas fa-ruler",
          handler: function() { self.setTool("overland_measure_template"); }
        })
      ]),

      new ToolMenuGroup("fog_group", [
        new ToolMenuItem("add_fog", {
          label: "Add Fog",
          tooltip: "Draw to add fog",
          glyph: "fas fa-cloud",
          handler: function() { self.setTool("add_fog"); }
        }),

        new ToolMenuItem("remove_fog", {
          label: "Remove Fog",
          tooltip: "Draw to remove fog",
          glyph: "fas fa-eye",
          handler: function() { self.setTool("remove_fog"); }
        }),

        new ToolMenuItem("fog_all", {
          label: "Fog Everything",
          tooltip: "Covers entire map in fog",
          glyph: "fas fa-square",
          handler: function() {
            if (confirm("Are you sure?  This cannot be undone")) {
              var action = {actionType: "fogEverythingAction", uid: generateActionId()};
              self.board.addAction(action, null, true);
            }
          }
        }),

        new ToolMenuItem("fog_none", {
          label: "Clear Fog",
          tooltip: "Removes fog from entire map",
          glyph: "far fa-lightbulb",
          handler: function() {
            if (confirm("Are you sure?  This cannot be undone")) {
              var action = {actionType: "fogNothingAction", uid: generateActionId()};
              self.board.addAction(action, null, true);
            }
          }
        })
      ]),

      new ToolMenuItem("toggle_pc_mode", {
        label: "Toggle Pc Mode",
        tooltip: "Toggles GM Mode",
        glyph: "fas fa-binoculars",
        handler: function() {
          self.board.setPcMode(!self.board.pcMode);
        }
      }),

      //new ToolMenuGroup("tokens_group", [
      //
      //]),

      new ToolMenuItem("undo", {
        label: "Undo",
        tooltip: "Undo",
        glyph: "fa fa-undo",
        handler: function() { self.board.undo(); }
      })
    ];

    this.globalShortcutTool = new GlobalShortCuts(this);
  }

  // Draws the current tool onto the board
  draw() {
    if (this.currentTool) {
      this.currentTool.draw();
    }
  }

  // Builds and/or updates the HTML tool menu
  render() {
    if (!this.renderer) {
      this.renderer = new ToolRenderer(this.toolSet, this.board.drawingSettings);
    }
    this.renderer.render();
  }

  initialize() {
    // Ensure a current tool:
    if (!this.currentTool) {
      this.setTool("pointer");
    }

    this.globalShortcutTool.disable();
    this.globalShortcutTool.enable();

    this.render();
  }

  setTool(name) {
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
        this.toolSet.forEach(t => t.unselect());
        menuItem.select();
      }

      this.render();

      return tool;

    } else {
      throw "No such tool";
    }
  }

  setOptions() {
    if (this.currentTool) {
      this.renderer.updateOptions(this.currentTool.getOptions());
    }
  }

  // Updates the menu UI
  updateZoom(zoom) {
    this.getMenuItem("zoom").value = zoom;
    this.render();
  }

  updateViewPortSync(vpSync) {
    this.getMenuItem("view_port_sync").value = vpSync;
    this.render();
  }

  toggleDisplay() {
    this.renderer.toggleDisplay();
  }

  undo() {
    this.board.undo();
  }

  clearTokens() {
    this.board.clearTokens();
  }

  // Changes the board's zoom, which will call updateZoom and update the UI
  changeZoom(zoom) {
    this.board.setZoom(zoom);
  }

  showPasteTool() {
    this.getMenuItem("paste").visible = true;
    this.render();
  }

  hideFogTools() {
    this.getMenuItem("fog_group").visible = false;
    this.render();
  }

  hideImageTool() {
    this.getMenuItem("insert_image").visible = false;
    this.render();
  }

  hidePcModeTool() {
    this.getMenuItem("toggle_pc_mode").visible = false;
    this.render();
  }

  setPcModeActiveState(state) {
    this.getMenuItem("toggle_pc_mode").active = state;
    this.render();
  }

  setTemplateSet(type) {
    for (let t in this.templateGroups) {
      let groupItem = this.getMenuItem(this.templateGroups[t]);
      groupItem.visible = t === type;
    }
  }

  hideCameraButton() {

  }

  showCameraButton() {

  }

  showSaveViewPort() {
    this.getMenuItem("save_viewport").visible = true;
    this.render();
  }

  hideSaveViewPort() {
    this.getMenuItem("save_viewport").visible = false;
    this.render();
  }

  showRestoreViewPort() {
    this.getMenuItem("restore_viewport").visible = true;
    this.render();
  }

  hideRestoreViewPort() {
    this.getMenuItem("restore_viewport").visible = false;
    this.render();
  }

  getMenuItem(name) {
    var recur = function(items, name) {
      var found = null;
      items.find(i => {
        if (i.name == name) {
          found = i;
          return true;
        }
        if (i.children) {
          found = recur(i.children, name);
        }
        return found != null;
      });

      return found;
    };

    return recur(this.toolSet, name);
  }

  sharedTool(name) {
    return this.sharedToolOptions[name];
  }
}



