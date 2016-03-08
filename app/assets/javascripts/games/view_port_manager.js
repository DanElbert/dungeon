function ViewPortManager(board) {
  this.board = board;
  this.coordinates = [0, 0];
  this.size = [board.canvas.width, board.canvas.height];
  this.canvasSize = [board.canvas.width, board.canvas.height];
  this.zoom = 1;
  this.zoomAnimation = null;
  this.targetZoomCenter = null;
  this.verticalAnimation = null;
  this.horizontalAnimation = null;

}

_.extend(ViewPortManager.prototype, {

  update: function() {
    if (this.zoomAnimation) {
      this.applyZoom(this.zoomAnimation.calculateEasing(), this.targetZoomCenter);
      if (this.zoomAnimation.finished) {
        this.zoomAnimation = null;
        this.targetZoomCenter = null;
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

  setZoom: function(newZoom, mapCenter, noAnimate) {

    var val = this.normalizeZoom(newZoom);

    if (noAnimate) {
      this.applyZoom(val, mapCenter);
      this.zoomAnimation = null;
    } else {
      this.targetZoom = val;
      this.targetZoomCenter = mapCenter;

      this.zoomAnimation = new Animation(0.5, EasingFactory.cubicOut(), this.zoom, this.targetZoom);
    }
  },

  getCoordinates: function() {
    return this.coordinates;
  },

  setCoordinates: function(newCoords, noAnimate) {
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
    var zoomMin = 0.3;
    var newZoom = Math.round(zoom * 100) / 100;
    newZoom = Math.min(zoomMax, newZoom);
    newZoom = Math.max(zoomMin, newZoom);
    return newZoom;
  },

  applyCoordinates: function(coordinates) {
    this.coordinates = coordinates;
    this.applyZoom(this.zoom);
  },

  applyZoom: function(val, mapCenter) {
    val = this.normalizeZoom(val);
    if (!mapCenter) mapCenter = [this.coordinates[0] + this.size[0] / 2, this.coordinates[1] + this.size[1] / 2];
    var canvasCenter = [(mapCenter[0] - this.coordinates[0]) * this.zoom, (mapCenter[1] - this.coordinates[1]) * this.zoom];

    this.zoom = val;
    this.size = [this.board.canvas.width / val, this.board.canvas.height / val];
    this.coordinates = [mapCenter[0] - (canvasCenter[0] / this.zoom), mapCenter[1] - (canvasCenter[1] / this.zoom)];

    this.board.context.restore();
    this.board.context.save();
    this.board.context.scale(this.zoom, this.zoom);
    this.board.context.translate(-1 * this.coordinates[0], -1 * this.coordinates[1]);
  }
});