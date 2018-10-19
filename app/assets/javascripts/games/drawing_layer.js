function DrawingLayer(imageCache) {
  this.tileSize = 1024;
  this.tileList = [];
  this.tileLookup = {};
  this.isOwner = false;
  this.fogCover = false;
  this.imageCache = imageCache;
  this.drawingActions = new Map();

  this.levels = [];

  for (let x = 0; x < 5; x++) {
    this.levels.push(
      new DrawingLevel(this.tileSize, x + 1, 1 / 2 ** x, this.isOwner, this.imageCache, this.fogCover)
    );
  }
}
_.extend(DrawingLayer.prototype, {

  // Sets fogCover.  When true, all tiles fully fogged by default
  resetFog: function(shouldCover) {
    shouldCover = !!shouldCover;
    this.fogCover = shouldCover;

    for (let l of this.levels) {
      l.resetFog(shouldCover);
    }
  },

  addAction: function(a) {
    this.drawingActions.set(a.uid, a);

    for (let l of this.levels) {
      l.addAction(a);
    }
  },

  addFogAction: function(a) {
    for (let l of this.levels) {
      l.addFogAction(a);
    }
  },

  removeAction: function(id) {
    this.drawingActions.delete(id);

    for (let l of this.levels) {
      l.removeAction(id);
    }
  },

  clear: function() {
    for (let l of this.levels) {
      l.clear();
    }
  },

  setOwner: function(isOwner) {
    this.isOwner = isOwner;
    for (let l of this.levels) {
      l.setOwner(isOwner);
    }
  },

  draw: function(viewPortX, viewPortY, viewPortWidth, viewPortHeight, drawing, currentZoom, disableFog) {
    for (let a of this.drawingActions.values()) {
      if (a.update) {
        a.update();
      }
    }

    var levelIdx = Math.floor(Math.max(0, Math.log2(1 / currentZoom)));
    var level = this.levels[levelIdx];
    level.draw(viewPortX, viewPortY, viewPortWidth, viewPortHeight, drawing, !!disableFog);
  },


});

function DrawingLevel(tileSize, number, scale, isOwner, imageCache, fogCover) {
  this.tileSize = tileSize;
  this.number = number;
  this.scale = scale;
  this.isOwner = isOwner;
  this.imageCache = imageCache;
  this.fogCover = fogCover;

  this.trueTileSize = this.tileSize / this.scale;
  this.tiles = new Map();
}

_.extend(DrawingLevel.prototype, {
  resetFog: function(shouldCover) {
    this.fogCover = shouldCover;

    for (let t of this.tiles.values()) {
      t.resetFog(shouldCover);
    }
  },

  addAction(a) {
    var actionBounds = a.bounds();
    var tiles = this.getTilesForRectangle(actionBounds[0], actionBounds[1]);

    for (let t of tiles) {
      t.addAction(a);
    }
  },

  addFogAction(a) {
    var actionBounds = a.bounds();
    var tiles = this.getTilesForRectangle(actionBounds[0], actionBounds[1]);

    for (let t of tiles) {
      t.addFogAction(a);
    }
  },

  removeAction: function(id) {
    for (let t of this.tiles.values()) {
      t.removeAction(id);
    }
  },

  clear: function() {
    for (let t of this.tiles.values()) {
      t.clear();
    }
  },

  setOwner: function(isOwner) {
    this.isOwner = isOwner;
    for (let t of this.tiles.values()) {
      t.setOwner(isOwner);
    }
  },

  draw: function(viewPortX, viewPortY, viewPortWidth, viewPortHeight, drawing, disableFog) {
    var tiles = this.getTilesForRectangle([viewPortX, viewPortY], [viewPortX + viewPortWidth, viewPortY + viewPortHeight]);
    var context = drawing.context;

    for (let tile of tiles) {
      tile.draw(this.number, this.scale, disableFog);
      var tileCanvas = tile.canvas;
      if (tileCanvas != null) {
        context.drawImage(tileCanvas, tile.topLeft[0], tile.topLeft[1], this.tileSize / this.scale, this.tileSize / this.scale);
      }
    }
  },

  getTilesForRectangle: function(topLeft, bottomRight) {
    var topLeftTile = Geometry.getCell(topLeft, this.trueTileSize);
    var bottomRightTile = Geometry.getCell(bottomRight, this.trueTileSize);

    var x, y, key, tile;
    var tiles = [];

    for (x = topLeftTile[0]; x <= bottomRightTile[0]; x++) {
      for (y = topLeftTile[1]; y <= bottomRightTile[1]; y++) {
        key = this.tileHashKey(x, y);
        tile = this.tiles.get(key);

        if (tile == null) {
          tile = new Tile(this.trueTileSize, x, y, this.scale, this.isOwner, this.imageCache, this.fogCover);
          this.tiles.set(key, tile);
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

function Tile(size, x, y, scale, isOwner, imageCache, fogCover) {
  this.size = size;
  this.isOwner = isOwner;
  this.x = x;
  this.y = y;
  this.scale = scale;
  this.topLeft = [x * size, y * size];
  this.bottomRight = [(x + 1) * size, (y + 1) * size];
  this.width = this.bottomRight[0] - this.topLeft[0];
  this.height = this.bottomRight[1] - this.topLeft[1];
  this.actions = new Map();
  this.fogActions = new Map();
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
    this.fogActions.clear();
    this.fogCover = fogCover;
    this.reDrawFog();
  },

  addAction: function(a) {
    this.actions.set(a.uid, a);
    if (a.addParentTile) {
      a.addParentTile(this);
    }
    this.reDraw();
  },

  addFogAction: function(a) {
    this.fogActions.set(a.uid, a);
    this.reDraw();
    this.reDrawFog();
  },

  removeAction: function(uid) {
    var index;
    var a = this.actions.get(uid);
    if (a) {
      this.actions.delete(uid);
      this.clear();

      if (a.removeParentTile) {
        a.removeParentTile(this);
      }
      return;
    }

    a = this.fogActions.get(uid);
    if (a) {
      this.fogActions.delete(uid);
      this.reDraw();
      this.reDrawFog();
    }
  },

  setOwner: function(isOwner) {
    if (this.isOwner !== isOwner) {
      this.isOwner = isOwner;
      this.reDraw();
      this.reDrawFog();
    }
  },

  reDraw: function() {
    this.clear();
  },

  reDrawFog: function() {
    this.staleFog = true;
  },

  draw: function(level, scale, disableFog) {

    if ((this.actions.size == 0 && this.fogActions.size == 0) || (this.isDrawn))
      return;

    this.ensureCanvas();

    this.context.clearRect(this.topLeft[0], this.topLeft[1], this.width, this.height);

    var d = this.drawing;

    // if (this.isDistantMode) {
    //   d.minWidth = 10;
    // }

    var tileBounds = new Rectangle(new Vector2(this.topLeft[0], this.topLeft[1]), this.width, this.height);

    for (let a of this.actions.values()) {
      a.draw(d, tileBounds, level);
    }


    if (this.staleFog) {
      if (this.fogCover) {
        this.fogContext.fillStyle = "rgba(1, 1, 1, 1)";
        this.fogContext.fillRect(this.topLeft[0], this.topLeft[1], this.width, this.height);
      } else {
        this.fogContext.clearRect(this.topLeft[0], this.topLeft[1], this.width, this.height);
      }

      var fd = this.fogDrawing;

      for (let a of this.fogActions.values()) {
        a.draw(fd);
      }
    }

    this.context.save();

    if (this.isOwner) {
      this.context.globalAlpha = 0.25;
    } else {
      this.context.globalCompositeOperation = 'destination-out';
    }

    if (this.isOwner && disableFog) {
      // skip fog (for copy/paste)
    } else {
      this.context.drawImage(this.fogCanvas, this.topLeft[0], this.topLeft[1], this.bottomRight[0] - this.topLeft[0], this.bottomRight[1] - this.topLeft[1]);
    }

    this.context.restore();

    // Show squares around tiles for debugging
    //d.drawSquare(this.topLeft, this.bottomRight, 'green', null, 3);

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
      this.canvas.width = this.size * this.scale;
      this.canvas.height = this.size * this.scale;
      this.fogCanvas.width = this.size * this.scale;
      this.fogCanvas.height = this.size * this.scale;
      this.context = this.canvas.getContext('2d');
      this.fogContext = this.fogCanvas.getContext('2d');
      this.drawing = new Drawing(this.context, this.imageCache);
      this.fogDrawing = new Drawing(this.fogContext, this.imageCache);

      this.context.scale(this.scale, this.scale);
      this.context.translate(-1 * this.topLeft[0], -1 * this.topLeft[1]);
      this.fogContext.scale(this.scale, this.scale);
      this.fogContext.translate(-1 * this.topLeft[0], -1 * this.topLeft[1]);
    }
  }
});

