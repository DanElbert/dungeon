function DrawingLayer(imageCache) {
  this.tileSize = 500;
  this.tileList = [];
  this.tileLookup = {};
  this.isOwner = false;
  this.fogCover = false;
  this.imageCache = imageCache;
}
_.extend(DrawingLayer.prototype, {

  // Sets fogCover.  When true, all tiles fully fogged by default
  resetFog: function(shouldCover) {
    shouldCover = !!shouldCover;
    this.fogCover = shouldCover;
    _.each(this.tileList, function(tile) {
      tile.resetFog(shouldCover);
    }, this);
  },

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

  clear: function() {
    _.each(this.tileList, function(tile) {
      tile.clear();
    }, this);
  },

  draw: function(viewPortX, viewPortY, viewPortWidth, viewPortHeight, drawing, isFarZoom, disableFogDisplay) {
    var tiles = this.getTilesForRectangle([viewPortX, viewPortY], [viewPortX + viewPortWidth, viewPortY + viewPortHeight]);
    var context = drawing.context;

    _.each(tiles, function(tile) {
      tile.draw(disableFogDisplay, isFarZoom);
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
          tile = new Tile(this.tileSize, x, y, this.isOwner, this.imageCache, this.fogCover);
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

function Tile(size, x, y, isOwner, imageCache, fogCover) {
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
  this.imageCache = imageCache;
  this.isFogDisabled = false;
  this.isDistantMode = false;
  this.fogCover = fogCover;

  this.fogCanvas = null;
  this.fogContext = null;
  this.fogDrawing = null;
}
_.extend(Tile.prototype, {
  is: function(x, y) {
    return x == this.x && y == this.y;
  },

  resetFog: function(fogCover) {
    fogCover = !!fogCover;
    this.clear();
    this.fogActions = [];
    this.fogCover = fogCover;
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

  draw: function(disableFogDisplay, useDistantMode) {
    disableFogDisplay = !!disableFogDisplay;
    useDistantMode = !!useDistantMode;

    if ((this.actions.length == 0 && this.fogActions.length == 0) || (this.isDrawn && this.isFogDisabled == disableFogDisplay && this.isDistantMode == useDistantMode))
      return;

    this.isFogDisabled = disableFogDisplay;
    this.isDistantMode = useDistantMode;

    this.ensureCanvas();

    this.context.clearRect(this.topLeft[0], this.topLeft[1], this.bottomRight[0] - this.topLeft[0], this.bottomRight[1] - this.topLeft[1]);

    if (this.fogCover) {
      this.fogContext.fillStyle = "rgba(1, 1, 1, 1)";
      this.fogContext.fillRect(this.topLeft[0], this.topLeft[1], this.bottomRight[0] - this.topLeft[0], this.bottomRight[1] - this.topLeft[1]);
    } else {
      this.fogContext.clearRect(this.topLeft[0], this.topLeft[1], this.bottomRight[0] - this.topLeft[0], this.bottomRight[1] - this.topLeft[1]);
    }

    var d = this.drawing;

    if (this.isDistantMode) {
      d.minWidth = 10;
    }

    var fd = this.fogDrawing;

    // Show squares around tiles for debugging
    d.drawSquare(this.topLeft, this.bottomRight, '#000000', null, 3);

    _.each(this.actions, function(a) {
      a.draw(d, new Rectangle(new Vector2(this.topLeft[0], this.topLeft[1]), new Vector2(this.bottomRight[0], this.bottomRight[1])));
    }, this);

    _.each(this.fogActions, function(a) {
      a.draw(fd)
    });

    this.context.save();

    if (this.isOwner) {
      this.context.globalAlpha = 0.25;
    } else {
      this.context.globalCompositeOperation = 'destination-out';
    }

    if (!this.isOwner || !this.isFogDisabled) {
      // Only draw the fog if the current user isn't the owner or is the owner and we are drawing fog
      this.context.drawImage(this.fogCanvas, this.topLeft[0], this.topLeft[1], this.bottomRight[0] - this.topLeft[0], this.bottomRight[1] - this.topLeft[1]);
    }

    this.context.restore();

    this.isDrawn = true;
  },

  clear: function() {
    this.isDrawn = false;
    if (this.actions.length == 0) {
      this.canvas = null;
      this.fogCanvas = null;
      this.context = null;
      this.fogContext = null;
      this.drawing = null;
      this.fogDrawing = null;
    }
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
      this.drawing = new Drawing(this.context, this.imageCache);
      this.fogDrawing = new Drawing(this.fogContext, this.imageCache);

      this.context.translate(-1 * this.topLeft[0], -1 * this.topLeft[1]);
      this.fogContext.translate(-1 * this.topLeft[0], -1 * this.topLeft[1]);
    }
  }
});

