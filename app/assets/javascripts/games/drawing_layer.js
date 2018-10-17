function DrawingLayer(imageCache) {
  this.tileSize = 1024;
  this.tileList = [];
  this.tileLookup = {};
  this.isOwner = false;
  this.fogCover = false;
  this.imageCache = imageCache;
  this.drawingActions = new Map();
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
    this.drawingActions.set(a.uid, a);
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
    this.drawingActions.delete(id);
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

    for (let a of this.drawingActions.values()) {
      if (a.update) {
        a.update();
      }
    }

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

    var x, y, key, tile;
    var tiles = [];

    for (x = topLeftTile[0]; x <= bottomRightTile[0]; x++) {
      for (y = topLeftTile[1]; y <= bottomRightTile[1]; y++) {
        key = this.tileHashKey(x, y);
        tile = this.tileLookup[key];

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
  this.width = this.bottomRight[0] - this.topLeft[0];
  this.height = this.bottomRight[1] - this.topLeft[1];
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
    this.reDrawFog();
  },

  addAction: function(a) {
    this.actions.push(a);
    if (a.parentTiles) {
      a.parentTiles.push(this);
    }
    this.reDraw();
  },

  addFogAction: function(a) {
    this.fogActions.push(a);
    this.reDraw();
    this.reDrawFog();
  },

  removeAction: function(uid) {
    var index = null;
    var x = null;
    for (x = 0; x < this.actions.length; x++) {
      if (this.actions[x].uid == uid) index = x;
    }

    if (index != null) {
      var a = this.actions[index];
      this.actions.splice(index, 1);
      this.clear();
      if (a.parentTiles) {
        index = null;
        for (x = 0; x < a.parentTiles.length; x++) {
          if (a.parentTiles[x] === this) index = x;
        }
        if (index !== null) {
          a.parentTiles.split(index, 1);
        }
      }
      return;
    }

    for (x = 0; x < this.fogActions.length; x++) {
      if (this.fogActions[x].uid == uid) index = x;
    }

    if (index != null) {
      this.fogActions.splice(index, 1);
      this.reDrawFog();
      this.reDraw();
    }
  },

  reDraw: function() {
    this.clear();
  },

  reDrawFog: function() {
    this.staleFog = true;
  },

  draw: function(disableFogDisplay, useDistantMode) {
    disableFogDisplay = !!disableFogDisplay;
    useDistantMode = !!useDistantMode;

    if ((this.actions.length == 0 && this.fogActions.length == 0) || (this.isDrawn && this.isFogDisabled == disableFogDisplay && this.isDistantMode == useDistantMode))
      return;

    this.isFogDisabled = disableFogDisplay;
    this.isDistantMode = useDistantMode;

    this.ensureCanvas();

    this.context.clearRect(this.topLeft[0], this.topLeft[1], this.width, this.height);

    var d = this.drawing;

    if (this.isDistantMode) {
      d.minWidth = 10;
    }

    // Show squares around tiles for debugging
    //d.drawSquare(this.topLeft, this.bottomRight, '#000000', null, 3);

    var tileBounds = new Rectangle(new Vector2(this.topLeft[0], this.topLeft[1]), this.width, this.height);

    _.each(this.actions, function(a) {
      a.draw(d, tileBounds);
    }, this);


    if (this.staleFog) {
      if (this.fogCover) {
        this.fogContext.fillStyle = "rgba(1, 1, 1, 1)";
        this.fogContext.fillRect(this.topLeft[0], this.topLeft[1], this.width, this.height);
      } else {
        this.fogContext.clearRect(this.topLeft[0], this.topLeft[1], this.width, this.height);
      }

      var fd = this.fogDrawing;

      _.each(this.fogActions, function(a) {
        a.draw(fd)
      });
    }

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

