function DrawingLayer(imageCache) {
  this.tileSize = 1024;
  this.isOwner = false;
  this.fogCover = false;
  this.imageCache = imageCache;
  this.drawingActions = new Map();
  this.fogActions = new Map();

  this.levels = [];

  this.invalidRegions = {
    drawing: null,
    fog: false
  };

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
    this.fogActions.clear();

    for (let l of this.levels) {
      l.resetFog(shouldCover);
    }
  },

  addAction: function(a) {
    this.drawingActions.set(a.uid, a);
    this.invalidateRectangle(a.bounds());
  },

  addFogAction: function(a) {
    this.fogActions.set(a.uid, a);
    this.invalidateRectangle(a.bounds(), true);
  },

  removeAction: function(id) {
    let a = this.drawingActions.get(id);
    if (a) {
      this.drawingActions.delete(id);
      this.invalidateRectangle(a.bounds());
      return;
    }

    a = this.fogActions.get(id);
    if (a) {
      this.fogActions.delete(id);
      this.invalidateRectangle(a.bounds(), true);
    }
  },

  invalidateRectangle: function(rect, includeFog) {
    if (this.invalidRegions.drawing) {
      this.invalidRegions.drawing = rect.add(this.invalidRegions.drawing);
    } else {
      this.invalidRegions.drawing = rect;
    }
    this.invalidRegions.fog = this.invalidRegions.fog || includeFog;
  },

  // clear: function() {
  //   for (let l of this.levels) {
  //     l.clear();
  //   }
  // },

  setOwner: function(isOwner) {
    this.isOwner = isOwner;
    for (let l of this.levels) {
      l.setOwner(isOwner);
    }
  },

  draw: function(viewPortX, viewPortY, viewPortWidth, viewPortHeight, drawing, currentZoom, disableFog) {
    var levelIdx = Math.floor(Math.max(0, Math.log2(1 / currentZoom)));
    var level = this.levels[levelIdx];
    var actions = [],
      fogActions = [];

    for (let a of this.drawingActions.values()) {
      actions.push(a);
    }

    for (let a of this.fogActions.values()) {
      fogActions.push(a);
    }

    var viewPortRect = new Rectangle(new Vector2(viewPortX, viewPortY), viewPortWidth, viewPortHeight);
    var dirtyRect = this.invalidRegions.drawing;
    var includeFog = this.invalidRegions.fog;

    level.draw(viewPortRect, drawing, actions, fogActions, dirtyRect, includeFog, !!disableFog);

    this.invalidRegions.drawing = null;
    this.invalidRegions.fog = false;
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

  // clear: function() {
  //   for (let t of this.tiles.values()) {
  //     t.clear();
  //   }
  // },

  setOwner: function(isOwner) {
    this.isOwner = isOwner;
    for (let t of this.tiles.values()) {
      t.setOwner(isOwner);
    }
  },

  invalidateRectangle: function(rect, includeFog) {
    var tiles = this.getTilesForRectangle(rect);
    for (let t of tiles) {
      t.reDraw();
      if (includeFog) {
        t.reDrawFog();
      }
    }
  },

  draw: function(viewPortRect, drawing, actions, fogActions, dirtyRect, includeFog, disableFog) {
    var tiles = this.getTilesForRectangle(viewPortRect);
    var context = drawing.context;

    for (let tile of tiles) {
      var tileRect = tile.rectangle;

      var tileActions = _.filter(actions, function(a) { return tileRect.overlaps(a.bounds()) });
      var tileFogActions = _.filter(fogActions, function(a) { return tileRect.overlaps(a.bounds()) });

      tile.draw(this.number, this.scale, tileActions, tileFogActions, dirtyRect, includeFog, disableFog);
      var tileCanvas = tile.canvas;
      if (tileCanvas != null) {
        context.drawImage(tileCanvas, tile.rectangle.left(), tile.rectangle.top(), this.tileSize / this.scale, this.tileSize / this.scale);
      }
    }
  },

  getTilesForRectangle: function(rect) {
    var topLeftTile = Geometry.getCell(rect.topLeft().toArray(), this.trueTileSize);
    var bottomRightTile = Geometry.getCell(rect.bottomRight().toArray(), this.trueTileSize);

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
  this.rectangle = new Rectangle(new Vector2(x * size, y * size), size, size);
  this.size = size;
  this.isOwner = isOwner;
  this.x = x;
  this.y = y;
  this.scale = scale;
  this.width = size;
  this.height = size;
  this.isDrawn = false;
  this.canvas = null;
  this.context = null;
  this.drawing = null;
  this.imageCache = imageCache;
  this.isFogDisabled = false;
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
    this.fogCover = fogCover;
    this.reDrawFog();
  },

  setOwner: function(isOwner) {
    if (this.isOwner !== isOwner) {
      this.isOwner = isOwner;
      this.reDrawFog();
    }
  },

  reDraw: function() {
    this.clear();
  },

  reDrawFog: function() {
    this.reDraw();
    this.staleFog = true;
  },

  draw: function(level, scale, actions, fogActions, dirtyRect, includeFog, disableFog) {
    if (actions.size === 0 && fogActions.size === 0) {
      this.clear();
      return;
    }

    var drawBounds = null;
    var reDrawFog = true;

    if (!this.isDrawn) {
      drawBounds = this.rectangle;
      reDrawFog = true;
    } else if (dirtyRect && this.rectangle.overlaps(dirtyRect)) {
      drawBounds = dirtyRect.clipTo(this.rectangle);
      reDrawFog = includeFog;
    }

    if (drawBounds === null)
      return;

    this.ensureCanvas();

    this.context.clearRect(drawBounds.left(), drawBounds.top(), drawBounds.width(), drawBounds.height());

    var d = this.drawing;

    if (level > 3) {
      d.minWidth = 10;
    }

    this.context.save();
    this.context.beginPath();
    this.context.rect(drawBounds.left(), drawBounds.top(), drawBounds.width(), drawBounds.height());
    this.context.clip();
    for (let a of actions) {
      a.draw(d, drawBounds, level);
    }


    if (reDrawFog) {
      if (this.fogCover) {
        this.fogContext.fillStyle = "rgba(1, 1, 1, 1)";
        this.fogContext.fillRect(this.rectangle.left(), this.rectangle.top(), this.rectangle.width(), this.rectangle.height());
      } else {
        this.fogContext.clearRect(this.rectangle.left(), this.rectangle.top(), this.rectangle.width(), this.rectangle.height());
      }

      for (let a of fogActions) {
        a.draw(this.fogDrawing, this.rectangle);
      }
    }

    if (this.isOwner) {
      this.context.globalAlpha = 0.5;
    } else {
      this.context.globalCompositeOperation = 'destination-out';
    }

    if (this.isOwner && disableFog) {
      // skip fog (for copy/paste)
    } else {
      this.context.drawImage(this.fogCanvas, this.rectangle.left(), this.rectangle.top(), this.rectangle.width(), this.rectangle.height());
    }

    this.context.restore();

    // Show squares around tiles for debugging
    // d.drawSquare(this.topLeft, [this.topLeft[0] + this.width, this.topLeft[1] + this.height], 'white', null, 5);
    // d.drawText(this.x + ', ' + this.y, [this.topLeft[0] + this.width / 2, this.topLeft[1] + this.height / 2], 25 / scale, 'white');

    this.isDrawn = true;
  },

  clear: function() {
    this.isDrawn = false;
    // if (this.actions.length == 0) {
      this.canvas = null;
      this.fogCanvas = null;
      this.context = null;
      this.fogContext = null;
      this.drawing = null;
      this.fogDrawing = null;
    // }
  },

  ensureCanvas: function() {
    if (this.canvas == null) {
      //console.log(`${this.scale}: (${this.x}, ${this.y})`)
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
      this.context.translate(-1 * this.rectangle.left(), -1 * this.rectangle.top());
      this.fogContext.scale(this.scale, this.scale);
      this.fogContext.translate(-1 * this.rectangle.left(), -1 * this.rectangle.top());
    }
  }
});

