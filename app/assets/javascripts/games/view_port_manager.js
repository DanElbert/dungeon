function ViewPortManager(board) {
  this.board = board;
  this.coordinates = [0, 0];
  this.size = [board.canvas.width, board.canvas.height];
  this.canvasSize = [board.canvas.width, board.canvas.height];
  this.zoom = 1;
  this.zoomAnimation = null;
  this.verticalAnimation = null;
  this.horizontalAnimation = null;
  this.savedViewPort = null;
  this.synced = false;
}

_.extend(ViewPortManager.prototype, {

  update: function() {

    if (this.zoomAnimation) {
      this.applyZoom(this.zoomAnimation.calculateEasing(), null);
      if (this.zoomAnimation.finished) {
        this.zoomAnimation = null;
      }
    }

    if (this.verticalAnimation) {
      this.applyCoordinates([this.getCoordinates()[0], this.verticalAnimation.calculateEasing()]);
      if (this.verticalAnimation.finished) {
        this.verticalAnimation = null;
      }
    }

    if (this.horizontalAnimation) {
      this.applyCoordinates([this.horizontalAnimation.calculateEasing(), this.getCoordinates()[1]]);
      if (this.horizontalAnimation.finished) {
        this.horizontalAnimation = null;
      }
    }

    this.applyGeometry();
  },

  saveViewPort: function() {
    this.savedViewPort = {zoom: this.getZoom(), coordinates: this.getCoordinates()};
    this.board.drawBorder = true;
    this.board.toolManager.hideSaveViewPort();
    this.board.toolManager.showRestoreViewPort();
  },

  restoreViewPort: function() {
    if (this.savedViewPort) {
      this.setZoom(this.savedViewPort.zoom);
      this.setCoordinates(this.savedViewPort.coordinates);
    }
    this.board.drawBorder = false;
    this.savedViewPort = null;
    this.board.toolManager.showSaveViewPort();
    this.board.toolManager.hideRestoreViewPort();
  },

  handleViewPortAction: function(action) {
    if (this.synced) {
      this.setZoom(action.properties.zoom, null, false, true);
      this.setCoordinates([action.properties.x, action.properties.y], false, true);
    }
  },

  syncViewPort: _.debounce(function() {
    if (this.synced) {
      var zoom = this.getTargetZoom();
      var coords = this.getTargetCoordinates();
      var action = attachActionMethods({actionType: "viewPortSyncAction", zoom: zoom, x: coords[0], y: coords[1], uid: generateActionId()});
      this.board.sendActionMessage(action.serialize());
    }
  }, 250),

  toggleSynced: function() {
    this.synced = !this.synced;
    this.board.toolManager.updateViewPortSync(this.synced);
  },

  getTargetZoom: function() {
    if (this.zoomAnimation) {
      return this.zoomAnimation.max;
    } else {
      return this.zoom;
    }
  },

  getZoom: function() {
    return this.zoom;
  },

  setZoom: function(newZoom, mapCenter, noAnimate, noSync) {

    var val = this.normalizeZoom(newZoom);
    this.board.toolManager.updateZoom(val);

    if (!mapCenter) mapCenter = [this.coordinates[0] + this.size[0] / 2, this.coordinates[1] + this.size[1] / 2];
    var canvasCenter = [(mapCenter[0] - this.coordinates[0]) * this.zoom, (mapCenter[1] - this.coordinates[1]) * this.zoom];
    var newCoordinates = [mapCenter[0] - (canvasCenter[0] / val), mapCenter[1] - (canvasCenter[1] / val)];

    if (noAnimate) {
      this.applyZoom(val);
      this.setCoordinates(newCoordinates, true, noSync);
      this.zoomAnimation = null;
    } else {

      this.setCoordinates(newCoordinates, false, noSync);

      var deltaConst = 1.5;
      var maxTime = 1.0;
      var ratio = this.getDeltaRatio(this.zoom, val, deltaConst);

      this.zoomAnimation = new Animation(maxTime * ratio, EasingFactory.linear(), this.zoom, val);
    }

    if (noSync !== true) {
      this.syncViewPort();
    }
  },

  getTargetCoordinates: function() {
    var x, y;

    if (this.horizontalAnimation) {
      x = this.horizontalAnimation.max;
    } else {
      x = this.coordinates[0];
    }

    if (this.verticalAnimation) {
      y = this.verticalAnimation.max;
    } else {
      y = this.coordinates[1];
    }

    return [x, y];
  },

  getCoordinates: function() {
    return this.coordinates;
  },

  setCoordinates: function(newCoords, noAnimate, noSync) {
    if (noAnimate) {
      this.applyCoordinates(newCoords);
      this.verticalAnimation = null;
      this.horizontalAnimation = null;
    } else {
      var current = this.getCoordinates();
      var deltaConst = 1500;
      var maxTime = 1.0;
      var ratioX = this.getDeltaRatio(current[0], newCoords[0], deltaConst);
      var ratioY = this.getDeltaRatio(current[1], newCoords[1], deltaConst);
      this.verticalAnimation = new Animation(maxTime * ratioY, EasingFactory.linear(), current[1], newCoords[1]);
      this.horizontalAnimation = new Animation(maxTime * ratioX, EasingFactory.linear(), current[0], newCoords[0]);
    }

    if (noSync !== true) {
      this.syncViewPort();
    }
  },

  getDeltaRatio: function(v1, v2, maxV) {
    var delta = Math.abs(v1 - v2);
    if (delta > maxV) {
      return 1;
    } else {
      return delta / maxV;
    }
  },

  getCanvasSize: function() {
    return this.canvasSize;
  },

  setCanvasSize: function(newSize) {
    this.canvasSize = newSize;
    this.applyZoom(this.zoom);
  },

  getSize: function() {
    return this.size;
  },

  // Rounds the zoom and ensures it's within the min and max zoom values
  normalizeZoom: function(zoom) {
    var zoomMax = 2.5;
    var zoomMin = 0.05;
    var newZoom = zoom;
    newZoom = Math.min(zoomMax, newZoom);
    newZoom = Math.max(zoomMin, newZoom);
    return newZoom;
  },

  applyCoordinates: function(coordinates) {
    this.board.invalidate();
    this.coordinates = coordinates;
  },

  applyZoom: function(val, mapCenter) {
    this.board.invalidate();
    val = this.normalizeZoom(val);

    this.zoom = val;
    this.size = [this.board.canvas.width / val, this.board.canvas.height / val];
  },

  applyGeometry: function() {
    this.board.identityTransform();
    this.board.context.scale(this.zoom, this.zoom);
    this.board.context.translate(-1 * this.coordinates[0], -1 * this.coordinates[1]);
  }
});