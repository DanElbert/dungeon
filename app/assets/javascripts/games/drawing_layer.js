function DrawingLayer() {
  this.tileSize = 500;
  this.tileList = [];
  this.tileLookup = {};
  this.isOwner = false;
}
_.extend(DrawingLayer.prototype, {
  addAction: function(a) {
    var actionBounds = a.bounds();
    var tiles = this.getTilesForRectangle(actionBounds[0], actionBounds[1]);
    _.each(tiles, function(tile) {
      tile.addAction(a);
    }, this);
  },

  addFogAction: function(a) {
    var actionBounds = a.bounds();
    var tiles = this.getTilesForRectangle(actionBounds[0], actionBounds[1]);
    _.each(tiles, function(tile) {
      tile.addFogAction(a);
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
          tile = new Tile(this.tileSize, x, y, this.isOwner);
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

function Tile(size, x, y, isOwner) {
  this.size = size;
  this.isOwner = isOwner;
  this.x = x;
  this.y = y;
  this.topLeft = [x * size, y * size];
  this.bottomRight = [(x + 1) * size, (y + 1) * size];
  this.actions = [];
  this.fogActions = [];
  this.isDrawn = false;
  this.canvas = null;
  this.context = null;
  this.drawing = null;

  this.fogCanvas = null;
  this.fogContext = null;
  this.fogDrawing = null;
}
_.extend(Tile.prototype, {
  is: function(x, y) {
    return x == this.x && y == this.y;
  },

  addAction: function(a) {
    this.actions.push(a);
    this.reDraw();
  },

  addFogAction: function(a) {
    this.fogActions.push(a);
    this.reDraw();
  },

  removeAction: function(uid) {
    var index = null;
    var x = null;
    for (x = 0; x < this.actions.length; x++) {
      if (this.actions[x].uid == uid) index = x;
    }

    if (index != null) {
      this.actions.splice(index, 1);
      this.clear();
      return;
    }

    for (x = 0; x < this.fogActions.length; x++) {
      if (this.fogActions[x].uid == uid) index = x;
    }

    if (index != null) {
      this.fogActions.splice(index, 1);
      this.clear();
    }
  },

  reDraw: function() {
    this.clear();
  },

  draw: function() {
    if ((this.actions.length == 0 && this.fogActions.length == 0) || this.isDrawn)
      return;

    this.ensureCanvas();

    this.context.clearRect(this.topLeft[0], this.topLeft[1], this.bottomRight[0] - this.topLeft[0], this.bottomRight[1] - this.topLeft[1]);

    var d = this.drawing;
    var fd = this.fogDrawing;

    _.each(this.actions, function(a) {
      a.draw(d);
    });

    _.each(this.fogActions, function(a) {
      a.draw(fd)
    });

    this.context.save();

    if (this.isOwner) {
      this.context.globalAlpha = 0.25;
    } else {
      this.context.globalCompositeOperation = 'destination-out';
    }

    this.context.drawImage(this.fogCanvas, this.topLeft[0], this.topLeft[1], this.bottomRight[0] - this.topLeft[0], this.bottomRight[1] - this.topLeft[1]);
    this.context.restore();

    this.isDrawn = true;
  },

  clear: function() {
    this.isDrawn = false;
  },

  ensureCanvas: function() {
    if (this.canvas == null) {
      this.canvas = document.createElement("canvas");
      this.fogCanvas = document.createElement("canvas");
      this.canvas.width = this.size;
      this.canvas.height = this.size;
      this.fogCanvas.width = this.size;
      this.fogCanvas.height = this.size;
      this.context = this.canvas.getContext('2d');
      this.fogContext = this.fogCanvas.getContext('2d');
      this.drawing = new Drawing(this.context);
      this.fogDrawing = new Drawing(this.fogContext);

      this.context.translate(-1 * this.topLeft[0], -1 * this.topLeft[1]);
      this.fogContext.translate(-1 * this.topLeft[0], -1 * this.topLeft[1]);
    }
  }
});

