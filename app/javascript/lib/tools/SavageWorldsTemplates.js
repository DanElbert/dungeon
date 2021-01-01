import { PathfinderConeTemplate, SavageWorldsBurstTemplate, SavageWorldsConeTemplate } from "../drawing_objects";
import { Tool } from "./Tool";
import { TemplateTool } from "./Templates";
import { Geometry, Vector2 } from "../geometry";
import { generateActionId } from "../Actions";

export class SavageWorldsBurstTemplateTool extends Tool {
  constructor(manager) {
    super(manager);

    this.color = null;
    this.size = null;
    this.template = null;
    this.cursor = null;
  }

  buildOptions () {
    this.options.add(this.toolManager.sharedTool("templateColor"));
    this.options.add({type: 'burstSize', name: 'size', label: 'Burst Size', value: 'small'});
  }

  optionsChanged () {
    this.color = this.options.get("color").value;
    this.size = this.options.get("size").value;
  }

  eventNamespace () {
    return "SavageWorldsBurstTemplateTool";
  }

  enable () {

    var self = this;
    var board = this.board;

    this.template = new SavageWorldsBurstTemplate(generateActionId(), board, new Vector2(0, 0), this.color, this.size);
    board.templateLayer.addTemplate(this.template);

    board.event_manager.on('mousemove.' + this.eventNamespace(), function (mapEvt) {
      self.cursor = mapEvt.mapPoint;
    });

    board.event_manager.on('click.' + this.eventNamespace(), function (mapEvt) {
      self.saveAction();
    });
  }

  disable () {
    this.board.event_manager.off('.' + this.eventNamespace());
    this.board.templateLayer.removeTemplate(this.template.uid);
  }

  saveAction () {
    if (this.template) {
      var action = { actionType: "savageWorldsBurstTemplateAction", position: this.template.position.toArray(), size: this.size, color: this.color, uid: generateActionId() };
      var undoAction = { actionType: "removeTemplateAction", actionId: action.uid, uid: generateActionId() };
      this.board.addAction(action, undoAction, true);
    }
  }

  draw () {
    if (this.cursor == null) {
      return;
    }

    this.template.setPosition(new Vector2(this.cursor));
    this.template.setColor(this.color);
    this.template.setSize(this.size);
  }
}

export class SavageWorldsConeTemplateTool extends TemplateTool {
  constructor(manager) {
    super(manager);
  }

  eventNamespace() {
    return "SavageWorldsConeTemplateTool";
  }

  snapCursor(point, cell) {
    return point;
  }

  buildTemplate() {
    return new SavageWorldsConeTemplate(generateActionId(), this.board, this.cursorStart, this.color, this.getAngle());
  }

  updateTemplate(template) {
    template.updateProperties({
      color: this.color,
      position: this.cursorStart,
      angle: this.getAngle()
    });
  }

  getAngle() {
    let cursorAngle = Math.atan2(this.cursor.x - this.cursorStart.x, -1 * (this.cursor.y - this.cursorStart.y)) * (180 / Math.PI);
    return (cursorAngle + 360 + 180) % 360;
  }
}
