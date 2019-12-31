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
    this.updateLevelNameOption = {type: "text", name: "updateLevelName", label: "Level Name", value: ""};
    this.addLevelOption = {type: "button", name: "addLevel", label: "Add Level", glyph: "fas fa-plus-circle", handler: () => {this.addLevel()}};
    this.removeLevelOption = {type: "button", name: "removeLevel", label: "Remove Level", glyph: "fas fa-minus-circle", handler: () => {this.removeLevel()}};
    this.moveLevelUpOption = {type: "button", name: "moveLevelUp", label: "Move Level Up", glyph: "fas fa-arrow-circle-up", handler: () => {this.moveLevelUp()}};
    this.moveLevelDownOption = {type: "button", name: "moveLevelDown", label: "Move Level Down", glyph: "fas fa-arrow-circle-down", handler: () => {this.moveLevelDown()}};

    this.options.add(this.addLevelOption);
    this.options.add(this.removeLevelOption);
    this.options.add(this.levelOption);
    this.options.add(this.updateLevelNameOption);
    this.options.add(this.moveLevelUpOption);
    this.options.add(this.moveLevelDownOption);
  }

  optionsChanged() {
    if (this.board.getLevel && this.board.getLevel() !== this.levelOption.value) {
      this.board.setLevel(this.levelOption.value);
    }
  }

  updateOptions() {
    const levels = this.board.getLevelData();
    const curLevel = this.board.getLevel();

    this.levelOption.levels = levels;
    this.levelOption.value = curLevel.id;
    this.updateLevelNameOption.value = curLevel.name;

    this.addLevelOption.visible = this.board.isOwner;
    this.removeLevelOption.visible = this.board.isOwner && levels.length > 1;
    this.updateLevelNameOption.visible = this.board.isOwner;
    this.moveLevelUpOption.visible = this.board.isOwner && curLevel.index < (levels.length - 1);
    this.moveLevelDownOption.visible = this.board.isOwner && curLevel.index > 0;
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
      id: generateActionId(),
      name: `Level ${levels.length + 1}`,
      uid: generateActionId()
    };


    this.board.addAction(action, null, true);
  }

  removeLevel() {
    const curLevel = this.board.getLevel();

    var action = {
      actionType: "removeLevelAction",
      id: curLevel.id,
      uid: generateActionId()
    };

    this.board.addAction(action, null, true);
  }

  moveLevelUp() {
    const curLevel = this.board.getLevel();

    const action = {
      actionType: "updateLevelAction",
      id: curLevel.id,
      newIndex: curLevel.index + 1,
      newName: curLevel.name,
      uid: generateActionId()
    };

    this.board.addAction(action, null, true);
  }

  moveLevelDown() {
    const levels = this.board.getLevelData();
    const curLevel = this.board.getLevel();

    const action = {
      actionType: "updateLevelAction",
      id: curLevel.id,
      newIndex: curLevel.index - 1,
      newName: curLevel.name,
      uid: generateActionId()
    };

    this.board.addAction(action, null, true);
  }

  updateLevelName() {
    const curLevel = this.board.getLevel();

    const action = {
      actionType: "updateLevelAction",
      id: curLevel.id,
      newIndex: curLevel.index,
      newName: this.updateLevelNameOption.value,
      uid: generateActionId()
    };

    this.board.addAction(action, null, true);
  }
}