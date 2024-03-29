import { Vector2, TransformMatrix, Rectangle, Geometry } from "../geometry";
import { Action, actionTypes } from "../Actions";
import store from "../../store";
import {
  ImageDrawing,
  MoveIndicatorDrawing,
  OverlandMeasureTemplate,
  PathfinderConeTemplate,
  PathfinderLineTemplate,
  PathfinderMovementTemplate,
  PathfinderRadiusTemplate,
  PathfinderReachTemplate,
  PathfinderRectangleTemplate,
  SavageWorldsBurstTemplate,
  SavageWorldsConeTemplate,
  PenDrawing,
  TokenDrawing,
  SquareDrawing,
  CircleDrawing,
  LineDrawing,
  LevelHoleDrawing
} from "../drawing_objects";

class RemovalAction extends Action {
  isRemoval() { return true; }

  validateData() {
    this.ensureFields(["actionId", "uid"]);
  }
}

class PersistentAction extends Action {
  isPersistent() { return true; }
}

// An action that is managed by the drawing layer.  Requires bounds and draw methods.
class DrawingAction extends PersistentAction {
  get isPcLayer() {
    return this.properties.isPcLayer;
  }

  get level() {
    return this.properties.level || null;
  }

  apply(board) {
    board.drawingLayer.addAction(this);
  }

  // Returns the bounding box of the drawing action as an array of arrays as: [[LEFT, TOP], [RIGHT, BOTTOM]]
  bounds() {
    if (this.boundData == null) {
      const boundsArr = this.calculateBounds();
      this.boundData = new Rectangle(
        new Vector2(boundsArr[0][0], boundsArr[0][1]),
        boundsArr[1][0] - boundsArr[0][0],
        boundsArr[1][1] - boundsArr[0][1]
      )
    }
    return this.boundData;
  }

  calculateBounds() {
    return [[0,0], [1,1]];
  }

  // Given a drawing object, applies the drawing action to it
  draw(drawing) { }
}




class LabelAction extends DrawingAction {
  draw(drawing) {
    drawing.drawLabel(
      this.properties.point,
      this.properties.text,
      this.properties.color,
      "rgba(0, 0, 0, 0.5)",
      this.properties.backgroundColor || "rgba(255, 255, 255, 0.25",
      this.properties.fontSize);
  }
  calculateBounds() {
    return this.properties.bound;
  }
  validateData() {
    this.ensureVersionedFields({
      0: ["color", "text", "point", "bound", "uid"],
      1: ["color", "text", "point", "bound", "uid", "level"]
    });
  }
}

class PenAction extends PersistentAction {
  apply(board) {
    let points;
    if (this.version === 0) {
      points = this.properties.lines.map(l => new Vector2(l.start));
      points.push(new Vector2(this.properties.lines[this.properties.lines.length - 1].end));
    } else {
      points = this.properties.points.map(p => new Vector2(p));
    }
    board.drawingLayer.addAction(new PenDrawing(this.uid, board, points, this.properties.width, this.properties.color, this.properties.isPcLayer, this.properties.level));
  }

  validateData() {
    this.ensureVersionedFields({
      0: ["color", "width", "lines", "uid"],
      1: ["color", "width", "points", "uid"],
      2: ["color", "width", "points", "uid", "level"],
    });
  }
}

class AddFogPenAction extends PersistentAction {
  apply(board) {
    let points;
    if (this.version === 0) {
      points = this.properties.lines.map(l => new Vector2(l.start));
      points.push(new Vector2(this.properties.lines[this.properties.lines.length - 1].end));
    } else {
      points = this.properties.points.map(p => new Vector2(p));
    }
    board.drawingLayer.addFogAction(new PenDrawing(this.uid, board, points, this.properties.width, "black", false, this.properties.level));
  }
  validateData() {
    this.ensureVersionedFields({
      0: ["width", "lines", "uid"],
      1: ["width", "points", "uid"],
      2: ["width", "points", "uid", "level"]
    });
  }
}

  // A remove fog action consists of a width, and a collection of lines that are to be drawn on the fog layer
class RemoveFogPenAction extends PersistentAction {
  apply(board) {
    let points;
    if (this.version === 0) {
      points = this.properties.lines.map(l => new Vector2(l.start));
      points.push(new Vector2(this.properties.lines[this.properties.lines.length - 1].end));
    } else {
      points = this.properties.points.map(p => new Vector2(p));
    }
    board.drawingLayer.addFogAction(new PenDrawing(this.uid, board, points, this.properties.width, -1, false, this.properties.level));
  }
  validateData() {
    this.ensureVersionedFields({
      0: ["width", "lines", "uid"],
      1: ["width", "points", "uid"],
      2: ["width", "points", "uid", "level"]
    });
  }
}

class FogEverythingAction extends PersistentAction {
  apply(board) {
    board.resetFog(this.properties.level, true);
  }
  validateData() {
    this.ensureVersionedFields({
      0: ["uid"],
      1: ["uid", "level"]
    });
  }
}

class FogNothingAction extends PersistentAction {
  apply(board) {
    board.resetFog(this.properties.level, false);
  }
  validateData() {
    this.ensureVersionedFields({
      0: ["uid"],
      1: ["uid", "level"]
    });
  }
}

  // Draws a square.  Requires topLeft, bottomRight, color, and width
class SquarePenAction extends PersistentAction {
  apply(board) {
    let drawing = null;

    if (this.version === 0) {
      const tl = new Vector2(this.properties.topLeft);
      const br = new Vector2(this.properties.bottomRight);
      drawing = new SquareDrawing(this.uid, board, this.properties.isPcLayer, tl, this.properties.color, this.properties.backgroundColor, this.properties.width, br.subtract(tl), this.properties.level);
    } else {
      drawing = new SquareDrawing(this.uid, board, this.properties.isPcLayer, new Vector2(this.properties.position), this.properties.color, this.properties.backgroundColor, this.properties.width, new Vector2(this.properties.size), this.properties.level);
    }

    if (this.properties.isFog) {
      board.drawingLayer.addFogAction(drawing);
    } else {
      board.drawingLayer.addAction(drawing);
    }

  }

  validateData() {
    this.ensureVersionedFields({
      0: ["color", "width", "topLeft", "bottomRight", "uid"],
      1: ["color", "width", "position", "size", "uid"],
      2: ["color", "width", "position", "size", "uid", "level"]
    });
  }
}

  // Draws a circle.  Requires center, radius, color, and width
class CirclePenAction extends PersistentAction {
  apply(board) {
    let position = null;

    if (this.version === 0) {
      position = new Vector2(this.properties.center);
    } else {
      position = new Vector2(this.properties.position);
    }
    const drawing = new CircleDrawing(this.uid, board, this.properties.isPcLayer, position, this.properties.color, this.properties.backgroundColor, this.properties.width, this.properties.radius, this.properties.level);

    if (this.properties.isFog) {
      board.drawingLayer.addFogAction(drawing);
    } else {
      board.drawingLayer.addAction(drawing);
    }
  }

  validateData() {
    this.ensureVersionedFields({
      0: ["color", "width", "center", "radius", "uid"],
      1: ["color", "width", "position", "radius", "uid"],
      2: ["color", "width", "position", "radius", "uid", "level"]
    });
  }
}

  // Draws a straight line.  Requires start, end, color, and width
class LinePenAction extends PersistentAction {

  apply(board) {
    let drawing = null;
    if (this.version === 0) {
      drawing = new LineDrawing(this.uid, board, this.properties.isPcLayer, new Vector2(this.properties.start), this.properties.color, this.properties.backgroundColor, this.properties.width, new Vector2(this.properties.end), this.properties.level);
    } else {
      drawing = new LineDrawing(this.uid, board, this.properties.isPcLayer, new Vector2(this.properties.position), this.properties.color, this.properties.backgroundColor, this.properties.width, new Vector2(this.properties.end), this.properties.level);
    }

    if (this.properties.isFog) {
      board.drawingLayer.addFogAction(drawing);
    } else {
      board.drawingLayer.addAction(drawing);
    }
  }

  validateData() {
    this.ensureVersionedFields({
      0: ["color", "width", "start", "end", "uid"],
      1: ["color", "width", "position", "end", "uid"],
      2: ["color", "width", "position", "end", "uid", "level"]
    });
  }
}

class PasteAction extends PersistentAction {
  apply(board) {
    var center = new Vector2(
      this.properties.topLeft[0] + this.properties.width / 2,
      this.properties.topLeft[1] + this.properties.height / 2,
    );
    var drawing = ImageDrawing.getImageDrawing(
      this.uid,
      board,
      this.properties.url,
      new Vector2(this.properties.width, this.properties.height),
      center,
      1,
      0,
      this.properties.level
    );

    board.drawingLayer.addAction(drawing);
  }

  validateData() {
    this.ensureVersionedFields({
      0: ["uid", "url", "topLeft", "width", "height"],
      1: ["uid", "url", "topLeft", "width", "height", "level"]
    });
  }
}

class InsertImageAction extends PersistentAction {
  apply(board) {
    var drawing = ImageDrawing.getImageDrawing(
      this.uid,
      board,
      this.properties.url,
      new Vector2(this.properties.width, this.properties.height),
      new Vector2(this.properties.center[0], this.properties.center[1]),
      this.properties.scale,
      this.properties.angle,
      this.properties.level
    );

    board.drawingLayer.addAction(drawing);
  }

  validateData() {
    this.ensureVersionedFields({
      0: ["uid", "url", "center", "width", "height", "scale", "angle"],
      1: ["uid", "url", "center", "width", "height", "scale", "angle", "level"]
    });
  }
}

  // An erase action consists of a width and a collection of lines
class EraseAction extends PersistentAction {
  apply(board) {
    let points;
    if (this.version === 0) {
      points = this.properties.lines.map(l => new Vector2(l.start));
      points.push(new Vector2(this.properties.lines[this.properties.lines.length - 1].end));
    } else {
      points = this.properties.points.map(p => new Vector2(p));
    }
    board.drawingLayer.addAction(new PenDrawing(this.uid, board, points, this.properties.width, -1, this.properties.isPcLayer, this.properties.level));
  }

  validateData() {
    this.ensureVersionedFields({
      0: ["width", "lines", "uid"],
      1: ["width", "points", "uid"],
      2: ["width", "points", "uid", "level"]
    });
  }
}

  // References a drawing action to remove
class RemoveDrawingAction extends RemovalAction {
  apply(board) {
    board.drawingLayer.removeAction(this.properties.actionId);
  }
}

  // References a drawing action to remove
class RemoveFogAction extends RemovalAction {
  apply(board) {
    board.drawingLayer.removeAction(this.properties.actionId);
  }
}

class RemoveTemplateAction extends RemovalAction {
  apply(board) {
    board.templateLayer.removeTemplate(this.properties.actionId);
  }
}

class UpdateTemplateAction extends Action {
  isPersistent() { return true; }
  apply(board) {
    const t = board.templateLayer.getTemplate(this.properties.actionId);
    if (t) {
      if ("position" in this.properties) {
        t.setPosition(new Vector2(this.properties.position))
      }
    }
  }
  validateData() {
    this.ensureVersionedFields({
      0: ["uid", "actionId"]
    });
  }
}

class MovementTemplateAction extends PersistentAction {
  apply(board) {
    var p, delta;
    if (this.version === 0) {
      p = Geometry.getCellMidpoint(this.properties.start, board.drawingSettings.cellSize);
      delta = [this.properties.end[0] - this.properties.start[0], this.properties.end[1] - this.properties.start[1]];
    } else {
      p = this.properties.position;
      delta = this.properties.cellDelta;
    }
    var t = new PathfinderMovementTemplate(
      this.properties.uid,
      board,
      new Vector2(p),
      this.properties.color,
      new Vector2(delta)
    );

    board.templateLayer.addTemplate(t);
  }

  validateData() {
    this.ensureVersionedFields({
      0: ["color", "uid", "start", "end"],
      1: ["color", "uid", "position", "cellDelta"]
    });
  }
}

class RadiusTemplateAction extends PersistentAction {
  apply(board) {
    var p;
    if (this.version === 0) {
      p = Geometry.getCellMidpoint(this.properties.intersection, board.drawingSettings.cellSize);
    } else {
      p = this.properties.position;
    }
    var t = new PathfinderRadiusTemplate(
      this.properties.uid,
      board,
      new Vector2(p),
      this.properties.color,
      this.properties.radius
    );

    board.templateLayer.addTemplate(t);
  }

  validateData() {
    this.ensureVersionedFields({
      0: ["intersection", "radius", "color", "uid"],
      1: ["position", "radius", "color", "uid"]
    });
  }
}

class LineTemplateAction extends PersistentAction {
  apply(board) {
    var p, delta;
    if (this.version === 0) {
      p = this.properties.start;
      delta = [this.properties.end[0] - this.properties.start[0], this.properties.end[1] - this.properties.start[1]];
    } else {
      p = this.properties.position;
      delta = this.properties.delta;
    }
    var t = new PathfinderLineTemplate(
      this.properties.uid,
      board,
      new Vector2(p),
      this.properties.color,
      new Vector2(delta)
    );

    board.templateLayer.addTemplate(t);
  }

  validateData() {
    this.ensureVersionedFields({
      0: ["start", "end", "color", "uid"],
      1: ["position", "delta", "color", "uid"]
    });
  }
}

class ConeTemplateAction extends PersistentAction {
  apply(board) {
    var p, r;
    if (this.version === 0) {
      p = Geometry.getCellMidpoint(this.properties.intersection, board.drawingSettings.cellSize);
      r = this.properties.radius;
    } else {
      p = this.properties.position;
      r = this.properties.cellRadius;
    }

    var t = new PathfinderConeTemplate(
      this.properties.uid,
      board,
      new Vector2(p),
      this.properties.color,
      r,
      this.properties.angle
    );

    board.templateLayer.addTemplate(t);
  }

  validateData() {
    this.ensureVersionedFields({
      0: ["intersection", "radius", "angle", "color", "uid"],
      1: ["position", "cellRadius", "angle", "color", "uid"]
    });
  }
}

class RectangleTemplateAction extends PersistentAction {
  apply(board) {
    var p, delta;
    if (this.version === 0) {
      p = Geometry.getCellMidpoint(this.properties.topLeft, board.drawingSettings.cellSize);
      delta = [this.properties.bottomRight[0] - this.properties.topLeft[0], this.properties.bottomRight[1] - this.properties.topLeft[1]]
    } else {
      p = this.properties.position;
      delta = this.properties.cellDelta;
    }

    var t = new PathfinderRectangleTemplate(
      this.properties.uid,
      board,
      new Vector2(p),
      this.properties.color,
      new Vector2(delta)
    );

    board.templateLayer.addTemplate(t);
  }

  validateData() {
    this.ensureVersionedFields({
      0: ["topLeft", "bottomRight", "color", "uid"],
      1: ["position", "cellDelta", "color", "uid"]
    });
  }
}

class ReachTemplateAction extends PersistentAction {
  apply(board) {
    var p;
    if (this.version === 0) {
      p = this.properties.anchor;
    } else {
      p = this.properties.position;
    }
    var t = new PathfinderReachTemplate(
      this.properties.uid,
      board,
      new Vector2(p),
      this.properties.color,
      this.properties.size,
      this.properties.reach
    );

    board.templateLayer.addTemplate(t);
  }

  validateData() {
    this.ensureVersionedFields({
      0: ["anchor", "size", "reach", "color", "uid"],
      1: ["position", "size", "reach", "color", "uid"]
    });
  }
}

class OverlandMeasureTemplateAction extends PersistentAction {
  apply(board) {
    var t = new OverlandMeasureTemplate(
      this.properties.uid,
      board,
      new Vector2(this.properties.position),
      this.properties.color,
      new Vector2(this.properties.delta)
    );

    board.templateLayer.addTemplate(t);
  }

  validateData() {
    this.ensureFields(["position", "delta", "color", "uid"]);
  }
}

class SavageWorldsBurstTemplateAction extends PersistentAction {
  apply(board) {
    const t = new SavageWorldsBurstTemplate(
      this.properties.uid,
      board,
      new Vector2(this.properties.position),
      this.properties.color,
      this.properties.size
    );

    board.templateLayer.addTemplate(t);
  }

  validateData() {
    this.ensureVersionedFields({
      0: ["position", "color", "size", "uid"]
    });
  }
}

class SavageWorldsConeTemplateAction extends PersistentAction {
  apply(board) {
    const t = new SavageWorldsConeTemplate(
      this.properties.uid,
      board,
      new Vector2(this.properties.position),
      this.properties.color,
      this.properties.angle
    );

    board.templateLayer.addTemplate(t);
  }

  validateData() {
    this.ensureVersionedFields({
      0: ["position", "angle", "color", "uid"]
    });
  }
}

class PingAction extends Action {
  apply(board) {
    board.pingLayer.add(this.properties.point, this.properties.color);
  }
  validateData() {
    this.ensureFields(["uid", "point", "color"])
  }
}

class AddTokenAction extends Action {
  isPersistent() { return true; }
  apply(board) {
    let p, s, th = 0, ch = 0, i = [], l = null, hidden = false;
    if (this.version === 0) {
      var cell = this.properties.cell;
      p = [cell[0] * board.drawingSettings.cellSize, cell[1] * board.drawingSettings.cellSize];
      s = this.properties.width;
    } else {
      p = this.properties.position;
      s = this.properties.tokenCellSize;
    }

    if (this.version >= 2) {
      l = this.properties.level;
    }

    if (this.version >= 3) {
      th = this.properties.totalHp;
      ch = this.properties.currentHp;
      i = this.properties.icons;
    }

    if (this.version >= 4) {
      hidden = this.properties.hidden;
    }

    var t = new TokenDrawing(
      this.uid,
      board,
      new Vector2(p),
      s,
      this.properties.color,
      this.properties.fontColor,
      this.properties.fontSize,
      this.properties.text,
      this.properties.imageUrl,
      th,
      ch,
      i,
      l,
      hidden
    );
    board.tokenLayer.addToken(t);
  }
  validateData() {
    this.ensureVersionedFields({
      0: ["uid", "cell", "height", "width", "color", "text", "fontSize", "fontColor"],
      1: ["uid", "position", "tokenCellSize", "color", "fontColor", "fontSize", "text"],
      2: ["uid", "position", "tokenCellSize", "color", "fontColor", "fontSize", "text", "level"],
      3: ["uid", "position", "tokenCellSize", "color", "fontColor", "fontSize", "text", "totalHp", "currentHp", "icons", "level"],
      4: ["uid", "position", "tokenCellSize", "color", "fontColor", "fontSize", "text", "totalHp", "currentHp", "icons", "level", "hidden"]
    });
  }
}

  // References a drawing action to remove
class RemoveTokenAction extends RemovalAction {
  apply(board) {
    board.tokenLayer.removeToken(this.properties.actionId);
  }
}

class UpdateTokenAction extends Action {
  isPersistent() { return true; }
  apply(board) {
    const t = board.tokenLayer.getToken(this.properties.actionId);
    if (t) {
      if ("position" in this.properties) {
        t.touch();
        t.setPosition(new Vector2(this.properties.position))
      }
      if ("currentHp" in this.properties) {
        t.setCurrentHp(this.properties.currentHp);
      }
      if ("icons" in this.properties) {
        t.setIcons(this.properties.icons);
      }
      if ("hidden" in this.properties) {
        t.setHidden(this.properties.hidden);
      }
    }
  }
  validateData() {
    this.ensureVersionedFields({
      0: ["uid", "actionId"]
    });
  }
}

class SetTokensAction extends Action {
}

class AddLevelAction extends Action {
  isPersistent() { return true; }
  apply(board) {
    board.drawingLayer.addLevel(this.properties.levelId, this.properties.name);
  }

  validateData() {
    this.ensureVersionedFields({
      0: ["uid", "levelId", "name"]
    });
  }
}

class RemoveLevelAction extends Action {
  isPersistent() { return true; }
  apply(board) {
    board.drawingLayer.removeLevel(this.properties.levelId);
  }

  validateData() {
    this.ensureVersionedFields({
      0: ["uid", "levelId"]
    });
  }
}

class UpdateLevelAction extends Action {
  isPersistent() { return true; }
  apply(board) {
    board.drawingLayer.updateLevel(this.properties.levelId, this.properties.newIndex, this.properties.newName, this.properties.newIsVisible);
  }

  validateData() {
    this.ensureVersionedFields({
      0: ["uid", "levelId", "newName", "newIndex"],
      1: ["uid", "levelId", "newName", "newIndex", "newIsVisible"]
    });
  }
}

class LevelHoleAction extends PersistentAction {
  apply(board) {
    const p = new Vector2(this.properties.position);
    const s = new Vector2(this.properties.size);
    const a = new LevelHoleDrawing(this.properties.uid, board, p, s, this.properties.level);
    board.drawingLayer.addAction(a);
  }

  validateData() {
    this.ensureVersionedFields({
      0: ["uid", "position", "size", "level"]
    });
  }
}

class ViewPortSyncAction extends Action {
  apply(board) {
    board.viewPortManager.handleViewPortAction(this);
  }
  validateData() {
    this.ensureFields(["uid", "zoom", "x", "y"]);
  }
}

class AddCampaignImageAction extends Action {
  apply(board) {
    if (this.properties.imageType === "DrawingImage") {
      board.campaign_images.push(this.properties.image);
    } else if (this.properties.imageType === "TokenImage") {
      board.token_images.push(this.properties.image);
    }
  }
  validateData() {
    this.ensureVersionedFields({
      0: ["uid", "imageType", "image"]
    })
  }
}

class AddMoveIndicator extends Action {
  apply(board) {
    let target = null;

    if (this.properties.targetType === "Token") {
      target = board.tokenLayer.getToken(this.properties.targetUid);
    } else if (this.properties.targetType === "Template") {
      target = board.templateLayer.getTemplate(this.properties.targetUid);
    }

    if (target) {
      const i = new MoveIndicatorDrawing(
        this.uid,
        board,
        new Vector2(this.properties.startPosition),
        new Vector2(this.properties.endPosition),
        target,
        this.properties.label,
        this.properties.color,
        null);

      board.moveIndicatorLayer.add(i);
    }
  }

  validateData() {
    this.ensureVersionedFields({
      0: ["uid", "targetType", "targetUid", "startPosition", "endPosition", "label", "color"]
    })
  }
}

class UpdateMoveIndicator extends Action {
  apply(board) {
    const i = board.moveIndicatorLayer.get(this.properties.targetUid);
    if (i) {
      const props = {};
      if ("endPosition" in this.properties) {
        props.endPosition = new Vector2(this.properties.endPosition);
      }

      if ("startPosition" in this.properties) {
        props.position = new Vector2(this.properties.startPosition);
      }

      i.touch();
      i.updateProperties(props);
    }
  }

  validateData() {
    this.ensureVersionedFields({
      0: ["uid", "targetUid"]
    })
  }
}

class RemoveMoveIndicator extends Action {
  apply(board) {
    board.moveIndicatorLayer.remove(this.properties.targetUid);
  }

  validateData() {
    this.ensureVersionedFields({
      0: ["uid", "targetUid"]
    })
  }
}

class UpdateImageUrl extends PersistentAction {
  apply(board) {
    const image = board.drawingLayer.findAction(this.properties.targetUid);
    if (image) {
      setTimeout(() => {
        image.updateUrl(this.properties.newUrl);
      }, );
    }
  }

  validateData() {
    this.ensureVersionedFields({
      0: ["uid", "targetUid", "newUrl"]
    })
  }
}

actionTypes["labelAction"] = LabelAction;
actionTypes["penAction"] = PenAction;
actionTypes["addFogPenAction"] = AddFogPenAction;
actionTypes["removeFogPenAction"] = RemoveFogPenAction;
actionTypes["fogEverythingAction"] = FogEverythingAction;
actionTypes["fogNothingAction"] = FogNothingAction;
actionTypes["squarePenAction"] = SquarePenAction;
actionTypes["circlePenAction"] = CirclePenAction;
actionTypes["linePenAction"] = LinePenAction;
actionTypes["pasteAction"] = PasteAction;
actionTypes["insertImageAction"] = InsertImageAction;
actionTypes["eraseAction"] = EraseAction;
actionTypes["removeDrawingAction"] = RemoveDrawingAction;
actionTypes["removeFogAction"] = RemoveFogAction;
actionTypes["removeTemplateAction"] = RemoveTemplateAction;
actionTypes["updateTemplateAction"] = UpdateTemplateAction;
actionTypes["movementTemplateAction"] = MovementTemplateAction;
actionTypes["radiusTemplateAction"] = RadiusTemplateAction;
actionTypes["lineTemplateAction"] = LineTemplateAction;
actionTypes["coneTemplateAction"] = ConeTemplateAction;
actionTypes["rectangleTemplateAction"] = RectangleTemplateAction;
actionTypes["reachTemplateAction"] = ReachTemplateAction;
actionTypes["overlandMeasureTemplateAction"] = OverlandMeasureTemplateAction;
actionTypes["savageWorldsBurstTemplateAction"] = SavageWorldsBurstTemplateAction;
actionTypes["savageWorldsConeTemplateAction"] = SavageWorldsConeTemplateAction;
actionTypes["pingAction"] = PingAction;
actionTypes["addTokenAction"] = AddTokenAction;
actionTypes["removeTokenAction"] = RemoveTokenAction;
actionTypes["updateTokenAction"] = UpdateTokenAction;
actionTypes["setTokensAction"] = SetTokensAction;
actionTypes["viewPortSyncAction"] = ViewPortSyncAction;
actionTypes["addLevelAction"] = AddLevelAction;
actionTypes["removeLevelAction"] = RemoveLevelAction;
actionTypes["updateLevelAction"] = UpdateLevelAction;
actionTypes["levelHoleAction"] = LevelHoleAction;
actionTypes["addCampaignImageAction"] = AddCampaignImageAction
actionTypes["addMoveIndicator"] = AddMoveIndicator;
actionTypes["updateMoveIndicator"] = UpdateMoveIndicator;
actionTypes["removeMoveIndicator"] = RemoveMoveIndicator;
actionTypes["updateImageUrl"] = UpdateImageUrl;

// defunct actions
actionTypes["clearTokensAction"] = Action;
