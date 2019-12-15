import { DrawingLayer } from "./DrawingLayer";
import Eventer from "../Eventer";

export class MultiLevelDrawingLayer extends Eventer {

  constructor(drawingSettings) {
    super();
    this.drawingSettings = drawingSettings;
    this.currentLevelIdx = 0;
    this.drawingLayers = [
      new DrawingLayer(this.drawingSettings)
    ];

    this.levels = [
      {
        idx: 0,
        name: "Level 1"
      }
    ];
  }

  getLevel() {
    return this.currentLevelIdx;
  }

  setLevel(newLevel) {
    this.currentLevelIdx = newLevel;
    this.trigger("change");
  }

  addLevel(index, name) {
    this.levels.splice(index, 0, {idx: 0, name: name});
    this.reindex();
    this.trigger("change");
  }

  removeLevel(index) {
    if (this.levels.length === 1)
      return;

    this.levels.splice(index, 1);
    this.reindex();
    this.trigger("change");
  }

  updateLevel(index, newIndex, newName) {
    const lvl = this.levels[index];
    if (lvl) {
      if (index !== newIndex) {
        this.levels.splice(index, 1).splice(newIndex, 0, lvl);
        this.reindex();
      }

      if (newName) {
        lvl.name = newName;
      }
    }
    this.trigger("change");
  }

  getLevelData() {
    return this.levels;
  }

  reindex() {
    for (let x = 0; x < this.levels.length; x++) {
      this.levels[x].idx = x;
    }
  }

  resetFog(shouldCover) {
    this.drawingLayers[this.currentLevelIdx].resetFog(shouldCover);
  }

  addAction(a) {
    let lvl = a.level;

    if (lvl === null || lvl === undefined) {
      lvl = 0;
    }

    const dl = this.drawingLayers[lvl];
    if (dl) {
      dl.addAction(a);
    }
  }

  addFogAction(a) {
    let lvl = a.level;

    if (lvl === null || lvl === undefined) {
      lvl = 0;
    }

    const dl = this.drawingLayers[lvl];
    if (dl) {
      dl.addFogAction(a);
    }
  }

  removeAction(id) {
    for (let dl of this.drawingLayers) {
      dl.removeAction(id);
    }
  }

  invalidateRectangle(rect, includeFog) {
    for (let dl of this.drawingLayers) {
      dl.invalidateRectangle(rect, includeFog);
    }
  }

  setOwner(isOwner) {
    for (let dl of this.drawingLayers) {
      dl.setOwner(isOwner);
    }
  }

  draw(viewPortX, viewPortY, viewPortWidth, viewPortHeight, drawing, currentZoom, disableFog) {
    this.drawingLayers[this.currentLevelIdx].draw(viewPortX, viewPortY, viewPortWidth, viewPortHeight, drawing, currentZoom, disableFog);
  }
}