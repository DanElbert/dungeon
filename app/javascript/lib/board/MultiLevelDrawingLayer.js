import { DrawingLayer } from "./DrawingLayer";
import Eventer from "../Eventer";

class Level {
  constructor(levelManager, id, name) {
    this.levelManager = levelManager;
    this.name = name;
    this.id = id;
  }

  get index() {
    return this.levelManager.indexForId(this.id);
  }

  get isActive() {
    return this.levelManager.currentLevel === this;
  }
}

class LevelManager {
  constructor() {
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

    this._currentIndex = Math.min(this._currentIndex, this.levels.length - 1);
  }

  moveLevel(levelId, newIndex) {
    const index = this.indexForId(levelId);
    const lvl = this.levels[index];
    this.levels.splice(index, 1);
    this.levels.splice(newIndex, 0, lvl);

    if (index === this._currentIndex) {
      this._currentIndex = lvl.index;
    }
  }
}

export class MultiLevelDrawingLayer extends Eventer {

  constructor(drawingSettings) {
    super();

    this.drawingSettings = drawingSettings;
    this.levelManager = new LevelManager();
    this.drawingLayers = {};
    this.isOwner = false;
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

      this.trigger("change");
    }
  }

  getLevelData() {
    return this.levelManager.levels;
  }

  forEachLevel(func) {
    for (let x = 0; x < this.levelManager.levels.length; x++) {
      let level = this.levelManager.levels[x];
      func.call(this, level, x);
    }
  }

  getDrawingLayer(action) {
    let id = null;

    if (action === undefined) {
      id = this.levelManager.currentLevel.id;
    } else {
      id = action.level;

      if (id === null || id === undefined) {
        id = this.levelManager.defaultLevel.id;
      }
    }

    if (!this.drawingLayers[id]) {
      const lvl = this.levelManager.levelForId(id);

      if (lvl) {
        this.drawingLayers[id] = new DrawingLayer(this.drawingSettings);
        this.drawingLayers[id].setOwner(this.isOwner);
      }
    }

    return this.drawingLayers[id] || null;
  }

  resetFog(level, shouldCover) {
    const dl = this.getDrawingLayer({level: level});
    if (dl) {
      dl.resetFog(shouldCover);
    }
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
      const dl = this.drawingLayers[level.id];
      if (dl) {
        dl.removeAction(id);
      }
    });
  }

  invalidateRectangle(rect, includeFog) {
    this.forEachLevel(level => {
      const dl = this.drawingLayers[level.id];
      if (dl) {
        dl.invalidateRectangle(rect, includeFog);
      }
    });
  }

  setOwner(isOwner) {
    this.isOwner = isOwner;
    this.forEachLevel(level => {
      const dl = this.drawingLayers[level.id];
      if (dl) {
        dl.setOwner(isOwner);
      }
    });
  }

  draw(viewPortX, viewPortY, viewPortWidth, viewPortHeight, drawing, currentZoom, disableFog) {
    this.getDrawingLayer().draw(viewPortX, viewPortY, viewPortWidth, viewPortHeight, drawing, currentZoom, disableFog);
  }
}