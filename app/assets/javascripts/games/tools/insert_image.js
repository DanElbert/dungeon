function InsertImageTool(manager) {
  Tool.call(this, manager);
  this.super = Tool.prototype;

  this.cursor = null;
  this.shiftDown = false;
  this.ctrlDown = false;

  this.scale = 1.0;
  this.angle = 0.0;
  this.editing = false;
  this.editPoint = null;
  this.image = null;
}
InsertImageTool.prototype = _.extend(InsertImageTool.prototype, Tool.prototype, {
  buildOptions: function() {
    this.options.add({type: "boolean", label: "Edit Mode?", name: "editing", value: false});
    this.options.add({type: "images", label: "Image", name: "image", value: null});
  },

  optionsChanged: function() {
    this.editing = this.options.get("editing").value;
    this.image = this.options.get("image").value;
  },

  eventNamespace: function() {
    return "InsertImageTool";
  },

  getPoint: function(mapPoint) {
    if (this.shiftDown && this.ctrlDown) {
      return Geometry.getNearestHalfCellSnap(mapPoint, this.board.drawing.cellSize);
    } else if (this.shiftDown) {
      return Geometry.getNearestCellIntersection(mapPoint, this.board.drawing.cellSize);
    } else if (this.ctrlDown) {
      return Geometry.getNearestCellCenter(mapPoint, this.board.drawing.cellSize);
    } else {
      return mapPoint;
    }
  },

  enable: function() {
    var self = this;
    var board = this.board;

    this.options.get("image").images = this.board.campaign_images;

    $(board.event_manager).on('keydown.' + this.eventNamespace(), function(evt, mapEvt) {
      self.shiftDown = mapEvt.isShift;
      self.ctrlDown = mapEvt.isCtrl;
      self.cursor = self.getPoint(self.cursor);
    });

    $(board.event_manager).on('keyup.' + this.eventNamespace(), function(evt, mapEvt) {
      self.shiftDown = mapEvt.isShift;
      self.ctrlDown = mapEvt.isCtrl;
      self.cursor = self.getPoint(self.cursor);
    });

    $(board.event_manager).on('mousemove.' + this.eventNamespace(), function(evt, mapEvt) {
      self.cursor = self.getPoint(mapEvt.mapPoint);

      if (self.editPoint) {
        self.applyCursorDelta(self.editPoint, self.cursor);
      }
    });

    $(board.event_manager).on('click.' + this.eventNamespace(), function(evt, mapEvt) {
      if (self.editing && self.cursor && !self.editPoint) {
        self.editPoint = self.cursor;
      } else if (self.editPoint) {
        self.editPoint = null;
      } else if (!self.editing && self.image && self.cursor) {
        self.saveAction();
      }
    });
  },

  disable: function() {
    $(this.board.event_manager).off('.' + this.eventNamespace());
  },

  applyCursorDelta: function(startPoint, currentPoint) {
    // to allow full control of rotation and scale, the following rules are used:
    // when the X delta is positive (cursor has moved right), the distance between points is used to scale the image up
    // when the X delta is negative, the distance between points is used to scale it down
    // Angles are mapped as such: (assuming right is 0, top is 90, etc [which was wrong; 0 is right, -90 is up...])
    // 0-90: 0-180
    // 270-359: 180-359
    // 91-180: 180-0
    // 181-269: 359-180

    var deltaX = currentPoint[0] - startPoint[0];
    var deltaY = currentPoint[1] - startPoint[1];
    var delta = Math.sqrt((deltaX * deltaX) + (deltaY * deltaY));
    var angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;

    angle = Geometry.snapNear(angle, 5.0, 45.0);

    if (angle >= 0 && angle < 90) {
      this.angle = (angle / 90) * 180;
    } else if (angle >= 90) {
      this.angle = ((90 - (angle - 90)) / -90) * 180;
    } else if (angle < 0 && angle >= -90) {
      this.angle = 360 - ((angle / -90) * 180);
    } else if (angle < -90) {
      this.angle = 180 - ((Math.abs(angle + 90) / 90) * 180);
    }

    if (delta > 100) {
      if (deltaX >= 0) {
        this.scale = Math.max(1, (Math.min(750.0, delta) / 750.0) * 4);
      } else {
        this.scale = Math.min(1, 1 / ((delta - 99) / 15));
      }
    } else {
      this.scale = 1.0;
    }

  },

  saveAction: function() {
    var img = this.board.imageCache.getImage(this.image);
    if (img) {
      var action = {
        actionType: "insertImageAction",
        url: this.image,
        center: this.cursor,
        scale: this.scale,
        angle: this.angle,
        width: img.width,
        height: img.height,
        uid: generateActionId()};

      var undoAction = {actionType: "removeDrawingAction", actionId: action.uid, uid: generateActionId()};

      this.board.addAction(action, undoAction, true);
    }
  },

  draw: function() {
    if (this.image) {
      this.drawImage();
    }

    if (this.cursor) {
      this.drawCross(this.cursor);
    }

    if (this.editing && this.editPoint) {
      this.drawCross(this.editPoint);
    }
  },

  drawImage: function() {
    var place = this.editPoint || this.cursor;
    var imageObj = this.board.imageCache.getImage(this.image);
    if (place && imageObj) {

      this.board.drawing.drawImageFromCenter(place[0], place[1], this.image, this.scale, this.angle);
    }
  },

  drawCross: function(point) {
    var crossSize = 10;
    var lines = [
      {start: [point[0] - crossSize, point[1]], end: [point[0] + crossSize, point[1]]},
      {start: [point[0], point[1] - crossSize], end: [point[0], point[1] + crossSize]}
    ];
    this.board.drawing.drawLines("black", 3, lines);
  }
});