import { Tool } from "./Tool";
import { ViewPortDragging } from "./ViewPortDragging";
import { generateActionId } from "../Actions";

export class GlobalShortCuts extends Tool {
  constructor(manager) {
    super(manager);
    this.viewPortDragging = new ViewPortDragging(this, this.board, 'rightdrag');
    this.stickyViewPort = null;
    this.stickyStart = null;
    this.stickyKeyReleased = null;
  }

  enable() {
    var self = this;

    var scrollZoomFactor = -0.001;
    var scaleZoomFactor = 0.5;

    this.viewPortDragging.enable();

    this.board.event_manager.on('pinchstart.GlobalShortCuts', function(mapEvt) {
      self.originalZoom = self.board.getZoom(true);
    });

    this.board.event_manager.on('pinch.GlobalShortCuts', function(mapEvt) {
      var scale = ((mapEvt.scale - 1) * scaleZoomFactor) + 1;
      var newZoom = self.originalZoom * scale;
      self.board.setZoom(newZoom, mapEvt.center, true);
    });

    this.board.event_manager.on('scroll.GlobalShortCuts', function(mapEvt) {
      var currentZoom = self.board.getZoom(true);
      var newZoom = currentZoom + (mapEvt.deltaY * scrollZoomFactor * currentZoom);
      self.board.setZoom(newZoom, mapEvt.mapPoint, true);
    });

    this.board.event_manager.on('keydown.GlobalShortCuts', function(mapEvt) {
      if (mapEvt.key == "z" && mapEvt.isCtrl) {
        // ctrl-z
        self.board.undo();
      }

      if (mapEvt.key == "s") {
        // s key
        if (self.stickyViewPort && self.stickyKeyReleased === true) {
          self.revertViewport();
        } else if (!self.stickyViewPort) {
          self.stickyViewPort = true;
          self.board.saveViewPort();
          self.stickyStart = new Date();
          self.stickyKeyReleased = false;
        }
      }

      if (mapEvt.key == "f") {
        self.board.toggleFullscreen();
      }
    });

    this.board.event_manager.on('keyup.GlobalShortCuts', function(mapEvt) {
      // s key
      if (mapEvt.key == "s" && self.stickyViewPort) {
        if ((new Date() - self.stickyStart) > 1000) {
          self.revertViewport();
        } else {
          self.stickyKeyReleased = true;
        }
      }
    });

    this.board.event_manager.on('dblclick.GlobalShortcuts', function(mapEvt) {
      var action = {actionType: "pingAction", point: mapEvt.mapPoint, color: "#EE204D", uid: generateActionId()};
      self.board.addAction(action, null, true);
    });
  }
  disable() {
    this.viewPortDragging.disable();
    this.board.event_manager.off(".GlobalShortCuts");
  }

  revertViewport() {
    if (this.stickyViewPort) {
      this.board.restoreViewPort();
      this.stickyViewPort = null;
      this.stickyStart = null;
      this.stickyKeyReleased = null;
    }
  }
}
