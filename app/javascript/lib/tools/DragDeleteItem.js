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
    this.instantDrag = false;

    this.selectedItemOriginalPosition = null;
    this.itemDragging = false;
    this.itemDragStartCell = null;
    this.itemDragCurrentCell = null;
    this.moveIndicatorId = null;
  }

  get itemDragging() {
    return this.board.isItemDragging || false;
  }

  set itemDragging(val) {
    this.board.isItemDragging = val;
  }

  get selectedItem() {
    return this.board.selectedItem;
  }

  set selectedItem(val) {
    if (val === this.board.selectedItem) {
      return;
    }

    if (this.moveIndicatorId) {
      const action = { uid: generateActionId(), actionType: "removeMoveIndicator", targetUid: this.moveIndicatorId };
      this.board.addAction(action, null, true);
      this.moveIndicatorId = null;
    }

    this.board.selectedItem = val;

    if (val) {
      const targetType = (val instanceof TokenDrawing) ? "Token" : "Template";
      const action = {
        uid: generateActionId(),
        actionType: "addMoveIndicator",
        targetType: targetType,
        targetUid: val.uid,
        startPosition: val.position.toArray(),
        endPosition: val.position.toArray(),
        label: this.board.user.display_name || this.board.user.username,
        color: this.board.user.ping_color
      };
      this.board.addAction(action, null, true);

      this.moveIndicatorId = action.uid;
      this.selectedItemOriginalPosition = val.position;
      this.trigger("selected");
    } else {
      this.selectedItemOriginalPosition = null;
      this.trigger("unselected")
    }
  }

  enableInstantDrag() {
    this.instantDrag = true;
  }

  eventName(evt) {
    return evt + '.DragDeleteItem' + this.eventNamespace;
  }

  enable() {
    var self = this;
    var board = this.board;
    this.enabled = true;

    board.event_manager.on(this.eventName("click"), function(mapEvt) {
      self.selectedItem = self.detectObject(mapEvt.mapPoint);
    });

    board.event_manager.on(this.eventName("dragstart"), function(mapEvt) {
      if (self.instantDrag === true) {
        self.selectedItem = self.detectObject(mapEvt.mapPoint);
      }

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

        if (self.moveIndicatorId) {
          const i = board.moveIndicatorLayer.get(self.moveIndicatorId);
          const newPosition = self.calcCurrentPosition();
          if (i && (i.endPosition.x !== newPosition.x || i.endPosition.y !== newPosition.y)) {
            const action = { uid: generateActionId(), actionType: "updateMoveIndicator", targetUid: self.moveIndicatorId, endPosition: newPosition.toArray() };
            self.board.addAction(action, null, true);
          }
        }
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
    this.selectedItem = null;
    this.enabled = false;
    this.board.event_manager.off('.DragDeleteItem' + this.eventNamespace);
  }

  detectObject(mapPoint) {
    let tokens = this.board.tokenLayer.tokenAt(mapPoint);
    if (tokens.length !== 0) {
      return tokens[tokens.length - 1];
    }

    let tmpl = this.board.templateLayer.templateAt(mapPoint);
    if (tmpl.length !== 0) {
      return tmpl[tmpl.length - 1];
    }
    return null;
  }

  calcCurrentPosition() {
    const dx = (this.itemDragCurrentCell[0] - this.itemDragStartCell[0]) * this.board.drawingSettings.cellSize;
    const dy = (this.itemDragCurrentCell[1] - this.itemDragStartCell[1]) * this.board.drawingSettings.cellSize;

    const originalPosition = this.selectedItemOriginalPosition;
    return originalPosition.translate(dx, dy);
  }

  draw() {
    // var offset = null;
    //
    // if (this.itemDragging) {
    //   var dx = this.itemDragCurrentCell[0] - this.itemDragStartCell[0];
    //   var dy = this.itemDragCurrentCell[1] - this.itemDragStartCell[1];
    //   offset = new Vector2(dx, dy);
    // } else if (this.selectedItem) {
    //   offset = new Vector2(0, 0);
    // }
    //
    // if (offset) {
    //   this.selectedItem.drawHighlight(this.board.drawing, offset.scale(this.board.drawingSettings.cellSize, this.board.drawingSettings.cellSize));
    //
    //   if (offset.x !== 0 || offset.y !== 0) {
    //     this.board.drawing.drawMovementLine(this.itemDragStartCell, this.itemDragCurrentCell, this.board.getZoom());
    //   }
    // }
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

      const originalPosition = this.selectedItemOriginalPosition;
      const newPosition = this.calcCurrentPosition();

      const moveAction = { uid: generateActionId(), actionType: actionType, actionId: this.selectedItem.uid, position: newPosition };
      const undoAction = { uid: generateActionId(), actionType: actionType, actionId: this.selectedItem.uid, position: originalPosition };

      this.board.addAction(moveAction, undoAction, true);

      this.selectedItem = null;
    }
  }
}