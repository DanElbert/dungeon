import {  Animation, EasingFactory } from "./Animation";
import { attachActionMethods, generateActionId } from "../Actions";
import { Vector2 } from "../../lib/geometry";
import debounce from "lodash/debounce";
import TWEEN from "@tweenjs/tween.js/dist/tween.esm";

export class ViewPortManager {
  constructor(board) {
    window.vpm = this;
    this.board = board;
    this.coordinates = new Vector2(0, 0);
    this.size = new Vector2(board.canvas.width, board.canvas.height);
    this.canvasSize = new Vector2(board.canvas.width, board.canvas.height);
    this.zoom = 1;
    this.animation = null;
    this.animationTarget = null;
    this.savedViewPort = null;
    this.synced = false;

    this.syncViewPort = debounce(() => {
      if (this.synced) {
        var zoom = this.getTargetZoom();
        var coords = this.getTargetCoordinates();
        var action = attachActionMethods({actionType: "viewPortSyncAction", zoom: zoom, x: coords[0], y: coords[1], uid: generateActionId()});
        this.board.sendActionMessage(action.serialize());
      }
    }, 250);
  }

  update() {
    this.applyGeometry();
  }

  setViewPort(x, y, zoom, animate, shouldSync) {
    if (animate === undefined) {
      animate = true;
    }

    if (shouldSync === undefined) {
      shouldSync = true;
    }

    zoom = this.normalizeZoom(zoom);

    if (animate) {
      const targetZoomSize = this.calculateZoomedSize(zoom);
      const animateData = {
        x: this.coordinates.x,
        y: this.coordinates.y,
        centerX: this.coordinates.x + (this.size.x / 2),
        centerY: this.coordinates.y + (this.size.y / 2),
        zoom: this.zoom
      };
      this.animationTarget = {
        x: x,
        y: y,
        centerX: x + (targetZoomSize.x / 2),
        centerY: y + (targetZoomSize.y / 2),
        zoom: zoom
      };
      this.animation = new TWEEN.Tween(animateData)
        .to(this.animationTarget, 1000)
        .easing(TWEEN.Easing.Quartic.InOut)
        .onUpdate(() => {
          const targetZoomSize = this.calculateZoomedSize(animateData.zoom);
          this.applyViewport(animateData.centerX - (targetZoomSize.x / 2), animateData.centerY - (targetZoomSize.y / 2), animateData.zoom);
        })
        .onComplete(() => {
          this.animation = null;
          this.animationTarget = null;
        })
        .start();
    } else {
      if (this.animation) {
        this.animation.stop();
        this.animation = null;
        this.animationTarget = null;
      }
      this.applyViewport(x, y, zoom);
    }

    this.board.toolManager.updateZoom(zoom);

    if (shouldSync) {
      this.syncViewPort();
    }
  }

  saveViewPort() {
    this.savedViewPort = {zoom: this.zoom, x: this.coordinates.x, y: this.coordinates.y};
    this.board.drawBorder = true;
    this.board.toolManager.hideSaveViewPort();
    this.board.toolManager.showRestoreViewPort();
  }

  restoreViewPort() {
    if (this.savedViewPort) {
      this.setViewPort(this.savedViewPort.x, this.savedViewPort.y, this.savedViewPort.zoom);
    }
    this.board.drawBorder = false;
    this.savedViewPort = null;
    this.board.toolManager.showSaveViewPort();
    this.board.toolManager.hideRestoreViewPort();
  }

  handleViewPortAction(action) {
    if (this.synced) {
      this.setViewPort(action.properties.x, action.properties.y, action.properties.zoom, true, false);
    }
  }

  toggleSynced() {
    this.synced = !this.synced;
    this.board.toolManager.updateViewPortSync(this.synced);
  }

  getTargetZoom() {
    if (this.animationTarget) {
      return this.animationTarget.zoom;
    } else {
      return this.zoom;
    }
  }

  getZoom() {
    return this.zoom;
  }

  setZoom(newZoom, mapCenter, animate, shouldSync) {

    var val = this.normalizeZoom(newZoom);

    if (!mapCenter) mapCenter = [this.coordinates.x + this.size.x / 2, this.coordinates.y + this.size.y / 2];
    var canvasCenter = [(mapCenter[0] - this.coordinates.x) * this.zoom, (mapCenter[1] - this.coordinates.y) * this.zoom];
    var newCoordinates = [mapCenter[0] - (canvasCenter[0] / val), mapCenter[1] - (canvasCenter[1] / val)];

    this.setViewPort(newCoordinates[0], newCoordinates[1], val, animate, shouldSync);
  }

  getTargetCoordinates() {
    let x, y;

    if (this.animationTarget) {
      x = this.animationTarget.x;
      y = this.animationTarget.y;
    } else {
      x = this.coordinates.x;
      y = this.coordinates.y;
    }

    return [x, y];
  }

  getCoordinates() {
    return this.coordinates.toArray();
  }

  getCanvasSize() {
    return this.canvasSize;
  }

  setCanvasSize(newSize, pixelRatio) {
    this.canvasSize = new Vector2(newSize);
    this.pixelRatio = pixelRatio;
    this.applyViewport(this.coordinates.x, this.coordinates.y, this.zoom);
  }

  getSize() {
    return this.size.toArray();
  }

  // Rounds the zoom and ensures it's within the min and max zoom values
  normalizeZoom(zoom) {
    var zoomMax = 2.5;
    var zoomMin = 0.05;
    var newZoom = zoom;
    newZoom = Math.min(zoomMax, newZoom);
    newZoom = Math.max(zoomMin, newZoom);
    return newZoom;
  }

  // Given a zoom, and knowing the canvas size, what would the map size be?
  calculateZoomedSize(zoom) {
    return new Vector2(this.board.canvas.width / zoom / this.pixelRatio, this.board.canvas.height / zoom / this.pixelRatio);
  }

  applyViewport(x, y, zoom) {
    this.board.invalidate();
    zoom = this.normalizeZoom(zoom);

    this.zoom = zoom;
    this.size = this.calculateZoomedSize(zoom);
    this.coordinates = new Vector2(x, y);
  }

  applyGeometry() {
    this.board.identityTransform();
    this.board.context.scale(this.zoom, this.zoom);
    this.board.context.translate(-1 * this.coordinates.x, -1 * this.coordinates.y);
  }
}
