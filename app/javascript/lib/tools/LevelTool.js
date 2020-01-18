import { Tool } from "./Tool";
import { generateActionId } from "../Actions";
import {ViewPortDragging} from "./ViewPortDragging";
import {DragDeleteItem} from "./DragDeleteItem";

export class LevelTool extends Tool {
  constructor(manager) {
    super(manager);

    this.viewPortDragging = new ViewPortDragging(this, this.board, 'drag');
    this.dragDeleteItem = new DragDeleteItem(this, this.board, "Level");
    this.dragDeleteItem.on("dragstart", () => this.viewPortDragging.disable());
    this.dragDeleteItem.on("dragstop", () => this.viewPortDragging.enable());
  }

  buildOptions() {
    this.levelOption = {type: "level", name: "level", label: "Level", levels: [], value: 0};
    this.updateLevelNameOption = {type: "text", name: "updateLevelName", label: "Level Name", confirmMode: true, value: ""};
    this.addLevelOption = {type: "button", name: "addLevel", label: "Add Level", glyph: "fas fa-plus-circle", handler: () => {this.addLevel()}};
    this.removeLevelOption = {type: "button", name: "removeLevel", label: "Remove Level", glyph: "fas fa-minus-circle", handler: () => {this.removeLevel()}};
    this.moveLevelUpOption = {type: "button", name: "moveLevelUp", label: "Move Level Up", glyph: "fas fa-arrow-circle-up", handler: () => {this.moveLevelUp()}};
    this.moveLevelDownOption = {type: "button", name: "moveLevelDown", label: "Move Level Down", glyph: "fas fa-arrow-circle-down", handler: () => {this.moveLevelDown()}};
    this.isLevelVisibleOption = {type: "boolean", name: "isVisible", label: "Visible?", value: true};

    this.options.add(this.addLevelOption);
    this.options.add(this.removeLevelOption);
    this.options.add(this.levelOption);
    this.options.add(this.updateLevelNameOption);
    this.options.add(this.moveLevelUpOption);
    this.options.add(this.moveLevelDownOption);
    this.options.add(this.isLevelVisibleOption);
  }

  optionsChanged() {
    if (this.board.getLevel) {

      const level = this.board.getLevel();

      if (level.id !== this.levelOption.value) {
        this.board.setLevel(this.levelOption.value);
      } else if (level.name !== this.updateLevelNameOption.value && this.updateLevelNameOption.value !== null && this.updateLevelNameOption.value !== "") {
        this.updateLevelName();
      } else if (level.isVisible !== this.isLevelVisibleOption.value) {
        this.updateLevelIsVisible();
      }
    }
  }

  updateOptions() {
    const levels = this.board.getLevelData();
    const curLevel = this.board.getLevel();

    if (this.board.isOwner) {
      this.levelOption.levels = levels;
    } else {
      this.levelOption.levels = levels.filter(l => l.isVisible);
    }
    this.levelOption.value = curLevel.id;
    this.updateLevelNameOption.value = curLevel.name;
    this.isLevelVisibleOption.value = curLevel.isVisible;

    this.addLevelOption.visible = this.board.isOwner;
    this.removeLevelOption.visible = this.board.isOwner && levels.length > 1;
    this.updateLevelNameOption.visible = this.board.isOwner;
    this.moveLevelUpOption.visible = this.board.isOwner && curLevel.index > 0;
    this.moveLevelDownOption.visible = this.board.isOwner && curLevel.index < (levels.length - 1);
    this.isLevelVisibleOption.visible = this.board.isOwner;
  }

  enable() {
    var self = this;
    var board = this.board;

    this.updateOptions();

    this.viewPortDragging.enable();
    this.dragDeleteItem.enable();

    this.board.drawingLayer.on("change.Level", function() {
      self.updateOptions();
    })
  }
  disable() {
    this.viewPortDragging.disable();
    this.dragDeleteItem.disable();
    this.board.event_manager.off(".Level");
    this.board.drawingLayer.off(".Level");
  }
  draw() {
    this.dragDeleteItem.draw();
  }

  addLevel() {
    const levels = this.board.getLevelData();

    var action = {
      actionType: "addLevelAction",
      levelId: generateActionId(),
      name: `Level ${levels.length + 1}`,
      uid: generateActionId()
    };


    this.board.addAction(action, null, true);
  }

  removeLevel() {
    const curLevel = this.board.getLevel();

    var action = {
      actionType: "removeLevelAction",
      levelId: curLevel.id,
      uid: generateActionId()
    };

    this.board.addAction(action, null, true);
  }

  moveLevelUp() {
    const curLevel = this.board.getLevel();

    const action = {
      actionType: "updateLevelAction",
      version: 1,
      levelId: curLevel.id,
      newIndex: curLevel.index - 1,
      newName: curLevel.name,
      newIsVisible: curLevel.isVisible,
      uid: generateActionId()
    };

    this.board.addAction(action, null, true);
  }

  moveLevelDown() {
    const curLevel = this.board.getLevel();

    const action = {
      actionType: "updateLevelAction",
      version: 1,
      levelId: curLevel.id,
      newIndex: curLevel.index + 1,
      newName: curLevel.name,
      newIsVisible: curLevel.isVisible,
      uid: generateActionId()
    };

    this.board.addAction(action, null, true);
  }

  updateLevelName() {
    const curLevel = this.board.getLevel();

    const action = {
      actionType: "updateLevelAction",
      version: 1,
      levelId: curLevel.id,
      newIndex: curLevel.index,
      newName: this.updateLevelNameOption.value,
      newIsVisible: curLevel.isVisible,
      uid: generateActionId()
    };

    this.board.addAction(action, null, true);
  }

  updateLevelIsVisible() {
    const curLevel = this.board.getLevel();

    const action = {
      actionType: "updateLevelAction",
      version: 1,
      levelId: curLevel.id,
      newIndex: curLevel.index,
      newName: curLevel.name,
      newIsVisible: this.isLevelVisibleOption.value,
      uid: generateActionId()
    };

    this.board.addAction(action, null, true);
  }
}
