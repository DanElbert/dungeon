function DrawingLayer() {
  this.tileSize = 1000;
}
_.extend(DrawingLayer.prototype, {
  addAction: function(a) {

  },

  removeAction: function(id) {

  },

  draw: function(viewPortX, viewPortY, viewPortHeight, viewPortWidth, drawing) {
    
  }
});

function Tile(size, x, y) {
  this.size = size;
  this.x = x;
  this.y = y;
  this.actions = [];
  this.canvas = null;
  this.context = null;
  this.drawing = null;
}
_.extend(Tile.prototype, {
  is: function(x, y) {
    return x == this.x && y == this.y;
  },

  draw: function() {
    this.ensureCanvas();

  },

  ensureCanvas: function() {
    if (this.canvas == null) {
      this.canvas = document.createElement("canvas");
      this.context = this.canvas.getContext('2d');
      this.drawing = new Drawing(this.context);
    }
  }
});

var l = new DrawingLayer();
l.test();