import { DragDeleteItem } from "./DragDeleteItem";
import { Tool } from "./Tool";
import { ViewPortDragging } from "./ViewPortDragging";
import { generateActionId } from "../Actions";

export class Pointer extends Tool {
  constructor(manager) {
    super(manager);

    this.viewPortDragging = new ViewPortDragging(this, this.board, 'drag');
    this.dragDeleteItem = new DragDeleteItem(this, this.board, "Pointer");
    this.dragDeleteItem.on("dragstart", () => this.viewPortDragging.disable());
    this.dragDeleteItem.on("dragstop", () => this.viewPortDragging.enable());
  }

  enable() {

    var self = this;
    var board = this.board;

    this.viewPortDragging.enable();
    this.dragDeleteItem.enable();
  }

  disable() {
    this.viewPortDragging.disable();
    this.dragDeleteItem.disable();
    this.board.event_manager.off(".Pointer");
  }

  draw() {
    this.dragDeleteItem.draw();
  }
}
