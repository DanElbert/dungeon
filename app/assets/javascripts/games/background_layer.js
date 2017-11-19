function BackgroundLayer(board) {
  this.board = board;
  this.canvas = document.createElement("canvas");
  this.canvas.className = 'background';
  $(board.canvas).before($(this.canvas));

  this.imageCache = board.imageCache;
  this.context = this.canvas.getContext('2d');
  this.drawing = new Drawing(this.context, this.imageCache);

  this.viewPort = {};
}

_.extend(BackgroundLayer.prototype, {

  draw: function() {
    var coords = this.board.getViewPortCoordinates();
    var size = this.board.getViewPortSize();
    var zoom = this.board.getZoom();
    var image = this.board.board_data.background_image;

    if (this.imageCache.getImage(image) == null) {
      this.viewPort = {};
      return;
    }

    var newVp = {
      coords: coords,
      size: size,
      zoom: zoom,
      image: image
    };

    if (this.isDifferent(newVp)) {
      this.viewPort = newVp;
      this.context.save();
      this.context.setTransform(1, 0, 0, 1, 0, 0);
      this.context.scale(zoom, zoom);
      this.context.translate(-1 * this.viewPort.coords[0], -1 * this.viewPort.coords[1]);
      if (zoom <= 0.4) {
        this.context.filter = "blur(" + Math.floor(1 / zoom) + "px)";
      }
      this.drawing.tileBackground(this.viewPort.coords[0], this.viewPort.coords[1], this.viewPort.size[0], this.viewPort.size[1], this.viewPort.image);
      this.context.restore();
    }
  },

  setCanvasSize: function(x, y) {
    this.canvas.width = x;
    this.canvas.height = y;
  },

  isDifferent: function(newVp) {
    return !_.isEqual(this.viewPort, newVp);
  }

});