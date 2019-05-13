import { OverlandMeasureTemplate } from "../drawing_objects";
import { Tool } from "./Tool";
import { Vector2 } from "../geometry";
import { generateActionId } from "../Actions";

export class OverlandMeasureTemplateTool extends Tool {
  constructor(manager) {
    super(manager);

    this.color = null;
    this.template = null;
    this.cursor = null;  
  }

  buildOptions () {
    this.options.add(this.toolManager.sharedTool("templateColor"));
  }

  optionsChanged () {
    this.color = this.options.get("color").value;
  }

  eventNamespace () {
    return "OverlandMeasureTemplateTool";
  }

  enable () {

    var self = this;
    var board = this.board;

    board.event_manager.on('mousemove.' + this.eventNamespace(), function (mapEvt) {
      self.cursor = mapEvt.mapPoint;
    });

    board.event_manager.on('dragstart.' + this.eventNamespace(), function (mapEvt) {
      self.template = new OverlandMeasureTemplate(generateActionId(), board, new Vector2(mapEvt.mapPoint[0], mapEvt.mapPoint[1]), self.color, new Vector2(0,0));
      board.templateLayer.addTemplate(self.template);
    });

    board.event_manager.on('drag.' + this.eventNamespace(), function (mapEvt) {
      //console.log(self.template);
      var point = new Vector2(mapEvt.mapPoint[0], mapEvt.mapPoint[1]);
      var delta = point.subtract(self.template.position);
      self.template.setDelta(delta);
    });

    board.event_manager.on('dragstop.' + this.eventNamespace(), function (mapEvt) {
      self.saveAction();
    });
  }

  disable () {
    this.board.event_manager.off('.' + this.eventNamespace());
  }

  saveAction () {
    if (this.template) {
      var action = { actionType: "overlandMeasureTemplateAction", position: this.template.position.toArray(), delta: this.template.delta.toArray(), color: this.color, uid: generateActionId() };
      var undoAction = { actionType: "removeTemplateAction", actionId: action.uid, uid: generateActionId() };

      this.board.templateLayer.removeTemplate(this.template.uid);
      this.template = null;
      this.board.addAction(action, undoAction, true);
    }
  }

  draw () {
    if (this.cursor == null) {
      return;
    }

    // var template = Geometry.getReachCells(this.cursor, this.size, this.reach, this.board.drawing.cellSize);
    // var creature_border = Geometry.getBorder(template.threat, this.board.drawing.cellSize);
    //
    // this.board.drawing.drawTemplate(template.threat, creature_border, this.color);
  }
}
