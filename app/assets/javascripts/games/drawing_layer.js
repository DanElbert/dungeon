function DrawingLayer() {
  this.tileSize = 500;
  this.tileList = [];
  this.tileLookup = {};
}
_.extend(DrawingLayer.prototype, {
  addAction: function(a) {
    var actionBounds = a.bounds();
    var tiles = this.getTilesForRectangle(actionBounds[0], actionBounds[1]);
    _.each(tiles, function(tile) {
      tile.addAction(a);
    }, this);
  },

  removeAction: function(id) {
    _.each(this.tileList, function(tile) {
      tile.removeAction(id);
    }, this);
  },

  draw: function(viewPortX, viewPortY, viewPortWidth, viewPortHeight, drawing) {
    var tiles = this.getTilesForRectangle([viewPortX, viewPortY], [viewPortX + viewPortWidth, viewPortY + viewPortHeight]);
    var context = drawing.context;

    _.each(tiles, function(tile) {
      tile.draw();
      var tileCanvas = tile.canvas;
      if (tileCanvas != null) {
        context.drawImage(tileCanvas, tile.topLeft[0], tile.topLeft[1]);
      }
    }, this);
  },

  getTilesForRectangle: function(topLeft, bottomRight) {
    var topLeftTile = Geometry.getCell(topLeft, this.tileSize);
    var bottomRightTile = Geometry.getCell(bottomRight, this.tileSize);

    var tiles = [];

    for (var x = topLeftTile[0]; x <= bottomRightTile[0]; x++) {
      for (var y = topLeftTile[1]; y <= bottomRightTile[1]; y++) {
        var key = this.tileHashKey(x, y);
        var tile = this.tileLookup[key];

        if (tile == null) {
          tile = new Tile(this.tileSize, x, y);
          this.tileLookup[key] = tile;
          this.tileList.push(tile);
        }

        tiles.push(tile);
      }
    }

    return tiles;
  },

  tileHashKey: function(x, y) {
    return x + ":" + y;
  }
});

function Tile(size, x, y) {
  this.size = size;
  this.x = x;
  this.y = y;
  this.topLeft = [x * size, y * size];
  this.bottomRight = [(x + 1) * size, (y + 1) * size];
  this.actions = [];
  this.isDrawn = false;
  this.canvas = null;
  this.context = null;
  this.drawing = null;
}
_.extend(Tile.prototype, {
  is: function(x, y) {
    return x == this.x && y == this.y;
  },

  addAction: function(a) {
    this.actions.push(a);
    if (this.canvas != null) {
      a.draw(this.drawing);
    }
  },

  removeAction: function(uid) {
    var index = null;
    for (var x = 0; x < this.actions.length; x++) {
      if (this.actions[x].uid == uid) index = x;
    }

    if (index != null) {
      this.actions.splice(index, 1);
      this.clear();
    }
  },

  draw: function() {
    if (this.actions.length == 0 || this.isDrawn)
      return;

    this.ensureCanvas();
    var d = this.drawing;

    _.each(this.actions, function(a) {
      a.draw(d);
    });

    this.isDrawn = true;
  },

  clear: function() {
    if (this.canvas != null) {
      this.context.clearRect(this.topLeft[0], this.topLeft[1], this.bottomRight[0] - this.topLeft[0], this.bottomRight[1] - this.topLeft[1]);
    }
    this.isDrawn = false;
  },

  ensureCanvas: function() {
    if (this.canvas == null) {
      this.canvas = document.createElement("canvas");
      this.canvas.width = this.size;
      this.canvas.height = this.size;
      this.context = this.canvas.getContext('2d');
      this.drawing = new Drawing(this.context);

      this.context.translate(-1 * this.topLeft[0], -1 * this.topLeft[1]);
    }
  }
});

