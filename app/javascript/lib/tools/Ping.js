import { Tool } from "./Tool";
import { generateActionId } from "../Actions";

export class PingTool extends Tool {
  constructor(manager) {
    super(manager);

    this.color = null;
  }

  buildOptions() {
    this.options.add(this.toolManager.sharedTool("pingColor"));
  }

  optionsChanged() {
    this.color = this.options.get("color").value;
  }
  enable() {
    var self = this;
    var board = this.board;

    board.event_manager.on('click.PingTool', function(mapEvt) {
      var action = {actionType: "pingAction", point: [parseInt(mapEvt.mapPoint[0]), parseInt(mapEvt.mapPoint[1])], color: self.color, uid: generateActionId()};
      self.board.addAction(action, null, true);
    });
  }
  disable() {
    this.board.event_manager.off(".PingTool");
  }
  draw() {}
}
