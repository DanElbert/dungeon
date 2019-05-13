
import isEqual from "lodash/isEqual";

export class BackgroundLayer {
  constructor(board) {
    this.board = board;

    this.canvas = document.createElement("canvas");
    this.canvas.className = 'background';
    board.canvas.parentElement.insertBefore(this.canvas, board.canvas);

    this.imageCache = board.imageCache;
    this.context = this.canvas.getContext('2d');
    this.drawing = new Drawing(this.context, board.drawingSettings);
    this.dimmedImage = null;

    this.viewPort = {};
  }

  draw() {

    var coords = this.board.getViewPortCoordinates();
    var size = this.board.getViewPortSize();
    var zoom = this.board.getZoom();
    var image = this.board.board_data.background_image;
    var self = this;
    var imageObj = this.imageCache.getImage(image.raw_url, function() {
      self.board.invalidate();
    });

    if (imageObj === null) {
      this.viewPort = {};
      return;
    }

    var newVp = {
      coords: coords,
      size: size,
      zoom: zoom,
      image: image.raw_url
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
  }

  setCanvasSize(x, y) {
    this.canvas.width = x;
    this.canvas.height = y;
  }

  isDifferent(newVp) {

    return !isEqual(this.viewPort, newVp);
  }

  buildDimmedImage(imageObj) {
    var canvas = document.createElement("canvas");
    canvas.width = imageObj.width;
    canvas.height = imageObj.height;
    var context = canvas.getContext('2d');
    context.filter = "blur(3px)";
    context.drawImage(imageObj, 0, 0);
    return canvas;
  }
}