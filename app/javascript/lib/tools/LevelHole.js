import { ShapeTool } from "./Shape";
import {Vector2} from "../geometry";
import {generateActionId} from "../Actions";
import { LevelHoleDrawing } from "../drawing_objects";

export class LevelHole extends ShapeTool {
  constructor(manager) {
    super(manager);
  }

  buildOptions() {
  }

  optionsChanged() {

  }

  createDrawingObject(point) {
    const position = new Vector2(this.roundPoint(this.getPoint(point)));
    return new LevelHoleDrawing(generateActionId(), this.board, position, new Vector2(0, 0), this.board.getLevel().id);
  }

  eventNamespace() {
    return "LevelHole";
  }

  get backgroundColor() {
    return -1;
  }

  set backgroundColor(v) {}

  get color() {
    return -1;
  }

  set color(v) {}
}