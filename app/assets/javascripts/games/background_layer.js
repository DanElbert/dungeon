function BackgroundLayer(board) {
  this.board = board;
  this.canvas = document.createElement("canvas");
  this.canvas.className = 'background';
  $(board.canvas).before($(this.canvas));

  this.imageCache = board.imageCache;
  this.context = this.canvas.getContext('2d');
  this.drawing = new Drawing(this.context, this.imageCache);
  this.dimmedImage = null;

  this.viewPort = {};
}

_.extend(BackgroundLayer.prototype, {

  draw: function() {
    var coords = this.board.getViewPortCoordinates();
    var size = this.board.getViewPortSize();
    var zoom = this.board.getZoom();
    var image = this.board.board_data.background_image;
    var imageObj = this.imageCache.getImage(image);

    if (imageObj === null) {
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
      if (zoom <= 0.3) {
        if (this.dimmedImage === null) {
          this.dimmedImage = this.buildDimmedImage(imageObj, zoom);
        }
        this.drawing.tileBackground(this.viewPort.coords[0], this.viewPort.coords[1], this.viewPort.size[0], this.viewPort.size[1], this.dimmedImage);
      } else {
        this.drawing.tileBackground(this.viewPort.coords[0], this.viewPort.coords[1], this.viewPort.size[0], this.viewPort.size[1], this.viewPort.image);
      }
      this.context.restore();
    }
  },

  setCanvasSize: function(x, y) {
    this.canvas.width = x;
    this.canvas.height = y;
  },

  isDifferent: function(newVp) {
    return !_.isEqual(this.viewPort, newVp);
  },

  buildDimmedImage: function(imageObj, zoom) {
    var canvas = document.createElement("canvas");
    canvas.width = imageObj.width;
    canvas.height = imageObj.height;
    var context = canvas.getContext('2d');
    context.filter = "blur(" + Math.floor(1 / zoom) + "px)";
    context.drawImage(imageObj, 0, 0);
    console.log(canvas);
    return canvas;
  }

});