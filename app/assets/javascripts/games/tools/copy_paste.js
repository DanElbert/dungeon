function CopyTool(manager) {
  Tool.call(this, manager);
  this.super = Tool.prototype;
  this.cursor = null;
  this.shiftDown = false;
  this.ctrlDown = false;
  this.drag_start = null;
  this.drag_current = null;
  this.max_size = 1024;
}
CopyTool.prototype = _.extend(CopyTool.prototype, Tool.prototype, {
  buildOptions: function() {
    this.options.add(this.toolManager.sharedTool("copiedImage"));
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

  eventNamespace: function() {
    return "CopyTool";
  },

  enable: function() {

    var self = this;
    var board = this.board;

    board.event_manager.on('keydown.' + this.eventNamespace(), function(mapEvt) {
      self.shiftDown = mapEvt.isShift;
      self.ctrlDown = mapEvt.isCtrl;
      self.cursor = self.getPoint(self.cursor);
    });

    board.event_manager.on('keyup.' + this.eventNamespace(), function(mapEvt) {
      self.shiftDown = mapEvt.isShift;
      self.ctrlDown = mapEvt.isCtrl;
      self.cursor = self.getPoint(self.cursor);
    });

    board.event_manager.on('mousemove.' + this.eventNamespace(), function(mapEvt) {
      self.cursor = self.getPoint(mapEvt.mapPoint);
    });

    board.event_manager.on('dragstart.' + this.eventNamespace(), function(mapEvt) {
      self.drag_start = self.roundPoint(self.getPoint(mapEvt.mapPoint));
    });

    board.event_manager.on('drag.' + this.eventNamespace(), function(mapEvt) {
      self.drag_current = self.roundPoint(self.getPoint(mapEvt.mapPoint));
    });

    board.event_manager.on('dragstop.' + this.eventNamespace(), function(mapEvt) {
      self.saveAction();

      self.drag_start = null;
      self.drag_current = null;
    });
  },

  disable: function() {
    this.saveAction();
    this.board.event_manager.off('.' + this.eventNamespace());
  },

  saveAction: function() {

    var self = this;

    if (!this.drag_start || !this.drag_current) {
      return;
    }

    var restrainedDragCurrent = this.clampedDragCurrent();

    var topLeft = [Math.min(this.drag_start[0], restrainedDragCurrent[0]), Math.min(this.drag_start[1], restrainedDragCurrent[1])];
    var bottomRight = [Math.max(this.drag_start[0], restrainedDragCurrent[0]), Math.max(this.drag_start[1], restrainedDragCurrent[1])];

    var height = bottomRight[1] - topLeft[1];
    var width = bottomRight[0] - topLeft[0];

    var data = this.board.copyArea(topLeft[0], topLeft[1], height, width);

    var formData = new FormData();
    formData.append("image[filename]", "copied_data.png");
    formData.append("image[data]", data);

    Api.postFormData(ROOT_URL + 'copied_images.json', formData)
      .then(data => {
        self.board.setCopiedArea(data.url);
        self.getOptions().get("copiedImage").url = data.url;
      })
      .catch(err => {
        console.log(err);
        flashMessage('danger', "Error!  Could not store image data");
      });

    // $.ajax({
    //   url: ROOT_URL + 'copied_images.json',
    //   type: 'POST',
    //   data: formData,
    //   contentType: false,
    //   processData: false,
    //   success: function(data, status, xhr) {
    //     self.board.setCopiedArea(data.url);
    //     self.getOptions().get("copiedImage").url = data.url;
    //     self.toolManager.setOptions();
    //   }
    // });
  },
  
  clampedDragCurrent: function() {
    var deltaX = this.drag_start[0] - this.drag_current[0];
    var deltaY = this.drag_start[1] - this.drag_current[1];

    return [
      this.drag_start[0] - Math.min(Math.abs(deltaX), this.max_size) * (deltaX / Math.abs(deltaX)),
      this.drag_start[1] - Math.min(Math.abs(deltaY), this.max_size) * (deltaY / Math.abs(deltaY)),
    ];
  },

  drawCross: function(point) {
    var crossSize = 10;
    var lines = [
      {start: [point[0] - crossSize, point[1]], end: [point[0] + crossSize, point[1]]},
      {start: [point[0], point[1] - crossSize], end: [point[0], point[1] + crossSize]}
    ];
    this.board.drawing.drawLines("black", 3, lines);
  },

  drawShape: function() {
    if (this.drag_start && this.drag_current) {
      var restrainedDragCurrent = this.clampedDragCurrent();
      
      var topLeft = [Math.min(this.drag_start[0], restrainedDragCurrent[0]), Math.min(this.drag_start[1], restrainedDragCurrent[1])];
      var bottomRight = [Math.max(this.drag_start[0], restrainedDragCurrent[0]), Math.max(this.drag_start[1], restrainedDragCurrent[1])];

      this.board.drawing.drawSquare(topLeft, bottomRight, 'black', null, 5);

      var xDist = Math.round((Math.abs(topLeft[0] - bottomRight[0]) / this.board.drawing.cellSize) * 5);
      var yDist = Math.round((Math.abs(topLeft[1] - bottomRight[1]) / this.board.drawing.cellSize) * 5);

      this.board.drawing.drawMeasureLine([topLeft[0], topLeft[1] - 30], [bottomRight[0], topLeft[1] - 30], xDist, null, null, this.board.getZoom());
      this.board.drawing.drawMeasureLine([bottomRight[0] + 30, topLeft[1]], [bottomRight[0] + 30, bottomRight[1]], yDist, null, null, this.board.getZoom());
    }
  },

  draw: function() {
    if (this.cursor) {
      this.drawCross(this.cursor);
    }

    this.drawShape();
  }
});

function PasteTool(manager) {
  Tool.call(this, manager);
  this.super = Tool.prototype;
  this.cursor = null;
  this.shiftDown = false;
  this.ctrlDown = false;
}
PasteTool.prototype = _.extend(PasteTool.prototype, Tool.prototype, {
  buildOptions: function() {
    this.options.add(this.toolManager.sharedTool("copiedImage"));
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

  eventNamespace: function() {
    return "PasteTool";
  },

  drawCross: function(point) {
    var crossSize = 10;
    var lines = [
      {start: [point[0] - crossSize, point[1]], end: [point[0] + crossSize, point[1]]},
      {start: [point[0], point[1] - crossSize], end: [point[0], point[1] + crossSize]}
    ];
    this.board.drawing.drawLines("black", 3, lines);
  },

  enable: function() {

    var self = this;
    var board = this.board;

    board.event_manager.on('keydown.' + this.eventNamespace(), function(mapEvt) {
      self.shiftDown = mapEvt.isShift;
      self.ctrlDown = mapEvt.isCtrl;
      self.cursor = self.getPoint(self.cursor);
    });

    board.event_manager.on('keyup.' + this.eventNamespace(), function(mapEvt) {
      self.shiftDown = mapEvt.isShift;
      self.ctrlDown = mapEvt.isCtrl;
      self.cursor = self.getPoint(self.cursor);
    });

    board.event_manager.on('mousemove.' + this.eventNamespace(), function(mapEvt) {
      self.cursor = self.getPoint(mapEvt.mapPoint);
    });

    board.event_manager.on('click.' + this.eventNamespace(), function(mapEvt) {
      self.saveAction();
    });
  },

  disable: function() {
    this.board.event_manager.off('.' + this.eventNamespace());
  },

  draw: function() {
    if (this.cursor) {
      this.drawCross(this.cursor);
    }

    this.drawImage();
  },

  drawImage: function() {
    if (this.board.copiedArea && this.cursor) {
      this.board.drawing.drawImage(this.cursor[0], this.cursor[1], this.board.copiedArea);
    }
  },

  saveAction: function() {
    if (this.board.copiedArea && this.cursor) {
      var imgObj = this.board.imageCache.getImage(this.board.copiedArea);

      if (imgObj) {
        var width = imgObj.width;
        var height = imgObj.height;

        var action = {
          actionType: "pasteAction",
          isPcLayer: this.board.pcMode,
          url: this.board.copiedArea,
          topLeft: this.cursor,
          width: width,
          height: height,
          uid: generateActionId()};

        var undoAction = {actionType: "removeDrawingAction", actionId: action.uid, uid: generateActionId()};

        this.board.addAction(action, undoAction, true);
      }
    }
  }
});