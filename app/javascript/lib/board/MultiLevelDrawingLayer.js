import { DrawingLayer } from "./DrawingLayer";
import Eventer from "../Eventer";

class Level {
  constructor(levelManager, id, name) {
    this.levelManager = levelManager;
    this.name = name;
    this.id = id;
    this._drawingLayer = null;
  }

  get drawingLayer() {
    if (this._drawingLayer === null) {
      this._drawingLayer = new DrawingLayer(this.levelManager.drawingSettings);
    }
    return this._drawingLayer;
  }

  get index() {
    return this.levelManager.indexForId(this.id);
  }

  get isActive() {
    return this.levelManager.currentLevel === this;
  }
}

class LevelManager {
  constructor(drawingSettings) {
    this.drawingSettings = drawingSettings;
    this.levels = [];
    this._currentIndex = 0;
    this.defaultLevel = new Level(this, "0001", "Level 1");
    this.levels.push(this.defaultLevel);
  }

  get currentLevel() {
    return this.levels[this._currentIndex];
  }

  levelForId(levelId) {
    for (let x = 0; x < this.levels.length; x++) {
      if (this.levels[x].id === levelId) {
        return this.levels[x];
      }
    }
    return null;
  }

  indexForId(levelId) {
    for (let x = 0; x < this.levels.length; x++) {
      if (this.levels[x].id === levelId) {
        return x;
      }
    }
    return -1;
  }

  activateId(levelId) {
    let idx = this.indexForId(levelId);

    if (idx !== -1) {
      this._currentIndex = idx;
    }
  }

  addLevel(id, name) {
    this.levels.push(new Level(this, id, name));
  }

  removeLevel(levelId) {
    let idx = this.indexForId(levelId);

    if (this.levels.length > 1 && idx !== -1) {
      this.levels.splice(idx, 1);
    }

    if (this._currentIndex >= this.levels.length) {
      this._currentIndex = 0;
    }
  }

  moveLevel(levelId, newIndex) {
    const index = this.indexForId(levelId);
    const lvl = this.levels[index];
    this.levels.splice(index, 1);
    this.levels.splice(newIndex, 0, lvl);
  }
}

export class MultiLevelDrawingLayer extends Eventer {

  constructor(drawingSettings) {
    super();

    this.levelManager = new LevelManager(drawingSettings);
  }

  getLevel() {
    return this.levelManager.currentLevel;
  }

  setLevel(levelId) {
    this.levelManager.activateId(levelId);
    this.trigger("change");
  }

  addLevel(id, name) {
    this.levelManager.addLevel(id, name);
    this.trigger("change");
  }

  removeLevel(levelId) {
    this.levelManager.removeLevel(levelId);
    this.trigger("change");
  }

  updateLevel(levelId, newIndex, newName) {
    const lvl = this.levelManager.levelForId(levelId);
    if (lvl) {
      if (lvl.index !== newIndex) {
        this.levelManager.moveLevel(levelId, newIndex);
      }

      if (newName) {
        lvl.name = newName;
      }
    }
    this.trigger("change");
  }

  getLevelData() {
    return this.levelManager.levels;
  }

  forEachLevel(func) {
    for (let x = 0; x < this.levelManager.levels; x++) {
      let level = this.levelManager.levels[x];
      func.call(this, level, x);
    }
  }

  getDrawingLayer(action) {
    if (action === undefined) {
      return this.levelManager.currentLevel.drawingLayer;
    } else {
      let id = action.level;

      if (id === null || id === undefined) {
        id = this.levelManager.defaultLevel.id;
      }

      let lvl = this.levelManager.levelForId(id);
      if (lvl) {
        return lvl.drawingLayer;
      } else {
        return null;
      }
    }
  }

  resetFog(shouldCover) {
    this.getDrawingLayer().resetFog(shouldCover);
  }

  addAction(a) {
    const dl = this.getDrawingLayer(a);
    if (dl) {
      dl.addAction(a);
    }
  }

  addFogAction(a) {
    const dl = this.getDrawingLayer(a);
    if (dl) {
      dl.addFogAction(a);
    }
  }

  removeAction(id) {
    this.forEachLevel(level => {
      level.drawingLayer.removeAction(id);
    });
  }

  invalidateRectangle(rect, includeFog) {
    this.forEachLevel(level => {
      level.drawingLayer.invalidateRectangle(rect, includeFog);
    });
  }

  setOwner(isOwner) {
    this.forEachLevel(level => {
      level.drawingLayer.setOwner(isOwner);
    });
  }

  draw(viewPortX, viewPortY, viewPortWidth, viewPortHeight, drawing, currentZoom, disableFog) {
    this.getDrawingLayer().draw(viewPortX, viewPortY, viewPortWidth, viewPortHeight, drawing, currentZoom, disableFog);
  }
}