import Eventer from "../Eventer";
import { Geometry, Vector2 } from "../geometry";
import { generateActionId } from "../Actions";
import { TokenDrawing } from "../drawing_objects";

export class DragDeleteItem extends Eventer {
  constructor(parentTool, board, eventNamespace) {
    super();
    this.parentTool = parentTool;
    this.board = board;
    this.eventNamespace = eventNamespace;
    this.enabled = false;

    this._selectedItem = null;
    this.itemDragging = false;
    this.itemDragStartCell = null;
    this.itemDragCurrentCell = null;
  }

  get selectedItem() {
    return this._selectedItem;
  }

  set selectedItem(val) {
    this._selectedItem = val;
    if (val) {
      this.trigger("selected");
    } else {
      this.trigger("unselected")
    }
  }

  eventName(evt) {
    return evt + '.DragDeleteItem' + this.eventNamespace;
  }

  enable() {
    var self = this;
    var board = this.board;
    this.enabled = true;

    board.event_manager.on(this.eventName("click"), function(mapEvt) {
      self.selectedItem = null;

      var t = board.tokenLayer.tokenAt(mapEvt.mapPoint);
      if (t.length !== 0) {
        self.selectedItem = t[t.length - 1];
        return;
      }

      var tmpl = board.templateLayer.templateAt(mapEvt.mapPoint);
      if (tmpl.length !== 0) {
        self.selectedItem = tmpl[0];
      }
    });

    board.event_manager.on(this.eventName("dragstart"), function(mapEvt) {
      if (self.selectedItem && self.selectedItem.containsPoint(mapEvt.mapPoint)) {
        self.itemDragging = true;
        self.itemDragStartCell = mapEvt.mapPointCell;
        self.itemDragCurrentCell = mapEvt.mapPointCell;
        self.trigger("dragstart");
      }
    });

    board.event_manager.on(this.eventName("drag"), function(mapEvt) {
      if (self.itemDragging) {
        self.itemDragCurrentCell = mapEvt.mapPointCell;
      }
    });

    board.event_manager.on(this.eventName("dragstop"), function(mapEvt) {
      if (self.itemDragging) {
        self.moveCurrentItem();
        self.itemDragging = false;
        self.itemDragStartCell = null;
        self.itemDragCurrentCell = null;
        self.trigger("dragstop");
      }
    });

    board.event_manager.on(this.eventName("keydown"), function(mapEvt) {
      if (self.selectedItem && (mapEvt.key == "Backspace" || mapEvt.key == "Delete")) {
        self.deleteCurrentItem();
      }
    });

    board.event_manager.on(this.eventName("hold"), function(mapEvt) {
      if (self.selectedItem && self.selectedItem.containsPoint(mapEvt.mapPoint)) {
        self.deleteCurrentItem();
      }
    });
  }

  disable() {
    this.enabled = false;
    this.board.event_manager.off('.DragDeleteItem' + this.eventNamespace);
  }

  draw() {
    var offset = null;

    if (this.itemDragging) {
      var dx = this.itemDragCurrentCell[0] - this.itemDragStartCell[0];
      var dy = this.itemDragCurrentCell[1] - this.itemDragStartCell[1];
      offset = new Vector2(dx, dy);
    } else if (this.selectedItem) {
      offset = new Vector2(0, 0);
    }

    if (offset) {
      this.selectedItem.drawHighlight(this.board.drawing, offset.scale(this.board.drawingSettings.cellSize, this.board.drawingSettings.cellSize));

      if (offset.x !== 0 || offset.y !== 0) {
        this.board.drawing.drawMovementLine(this.itemDragStartCell, this.itemDragCurrentCell, this.board.getZoom());
      }
    }
  }

  deleteCurrentItem() {
    if (this.selectedItem) {
      let removeType = "removeTemplateAction";
      if (this.selectedItem instanceof TokenDrawing) {
        removeType = "removeTokenAction";
      }

      const removeAction = {actionType: removeType, actionId: this.selectedItem.uid, uid: generateActionId()};
      const restoreAction = this.selectedItem.clone(generateActionId()).toAction();
      this.board.addAction(removeAction, restoreAction, true);
      this.selectedItem = null;
    }
  }

  moveCurrentItem() {
    if (this.selectedItem) {
      let actionType = (this.selectedItem instanceof TokenDrawing) ? "updateTokenAction" : "updateTemplateAction";

      const dx = (this.itemDragCurrentCell[0] - this.itemDragStartCell[0]) * this.board.drawingSettings.cellSize;
      const dy = (this.itemDragCurrentCell[1] - this.itemDragStartCell[1]) * this.board.drawingSettings.cellSize;

      const originalPosition = this.selectedItem.position;
      const newPosition = originalPosition.translate(dx, dy);

      const moveAction = { uid: generateActionId(), actionType: actionType, actionId: this.selectedItem.uid, position: newPosition };
      const undoAction = { uid: generateActionId(), actionType: actionType, actionId: this.selectedItem.uid, position: originalPosition };

      this.board.addAction(moveAction, undoAction, true);

      // let removeType = "removeTemplateAction";
      // if (this.selectedItem instanceof TokenDrawing) {
      //   removeType = "removeTokenAction";
      // }
      //
      // const dx = (this.itemDragCurrentCell[0] - this.itemDragStartCell[0]) * this.board.drawingSettings.cellSize;
      // const dy = (this.itemDragCurrentCell[1] - this.itemDragStartCell[1]) * this.board.drawingSettings.cellSize;
      //
      // const removeAction = {actionType: removeType, actionId: this.selectedItem.uid, uid: generateActionId()};
      // const addAction = this.selectedItem.clone(generateActionId()).translate(dx, dy).toAction();
      //
      // const removeNew = {actionType: removeType, actionId: addAction.uid, uid: generateActionId()};
      // const restoreOld = this.selectedItem.clone(generateActionId()).toAction();
      //
      // this.board.addAction(
      //   {actionType: "compositeAction", actionList: [removeAction, addAction]},
      //   {actionType: "compositeAction", actionList: [removeNew, restoreOld]},
      //   true
      // );

      this.selectedItem = null;
    }
  }
}