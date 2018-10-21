function TiledImageDrawing(uid, board, url, size, position, scale, angle) {
  BaseDrawing.call(this, uid);

  this.url = url;
  this.board = board;
  this.previousZoom = board.getZoom();
  this.size = size;
  this.position = position;
  this.scale = scale;
  this.angle = angle;
  this.imageJson = null;
  this.imageJsonFetching = false;

  this.currentLevel = null;
  this.updateGeometry = true;
  this.imageDrawings = new Map();
}

TiledImageDrawing.prototype = _.extend(TiledImageDrawing.prototype, BaseDrawing.prototype, {
  calculateBounds: function() {
    this.updateGeometry = true;
    var height = this.size.y * this.scale;
    var width = this.size.x * this.scale;

    var rec = new Rectangle(
      new Vector2(this.position.x - width / 2, this.position.y - height / 2),
      width,
      height
    );

    return this.getRotatedRecBounds(rec, this.angle);
  },

  update() {
    // if (this.currentLevel && this.previousZoom !== this.board.getZoom()) {
    //   var level = this.calculateCurrentLevel();
    //   if (level.number !== this.currentLevel.number) {
    //     this.invalidate();
    //   }
    //   this.previousZoom = this.board.getZoom();
    // }
  },

  calculateCurrentLevel() {
    var zoom = this.board.getZoom() * this.scale;
    var displayWidth = zoom * this.size.x;
    return _.min(this.imageJson.level_data, function(l) { return Math.abs(displayWidth - l.width) }, this);
  },

  removeParentTile: function(t) {
    BaseDrawing.prototype.removeParentTile.call(this, t);
    this.clearActions();
  },

  addParentTile: function(t) {
    BaseDrawing.prototype.addParentTile.call(this, t);

    this.ensureActions();
  },

  ensureActions: function() {
    if (this.imageDrawings.size === 0) {
      this.rebuildActions();
    }
  },

  rebuildActions() {
    this.clearActions();

    if (this.imageJson === null && this.imageJsonFetching === false) {
      this.imageJsonFetching = true;
      var self = this;
      $.getJSON(this.url, function(data) {
        self.imageJsonFetching = false;
        self.imageJson = data;
        self.rebuildActions();
        self.invalidate();
        //console.log(data);
      });
    }

    if (this.imageJson === null) {
      return;
    }

    this.boundsRect();

    var tileSize = this.imageJson.tile_size;
    var overlap = this.imageJson.overlap;

    var centerpointMatrix = TransformMatrix.Identity
      .translate(this.position.x, this.position.y)
      .rotate(this.angle)
      .scale(this.scale, this.scale);

    for (let level of this.imageJson.level_data) {

      var scaledTileSize = tileSize / level.scale;
      var x, y, key, imgDrwEntry, imgDrw;

      for (x = 0; x < level.x_tiles; x++) {
        for (y = 0; y < level.y_tiles; y++) {
          key = [level.number, x, y].join("::");

          imgDrwEntry = this.imageDrawings.get(key);

          if (!imgDrwEntry) {
            var newUrl = "/images/" + this.imageJson.id + "/" + level.number + "/" + x + "_" + y + "." + this.imageJson.extension;

            // 0,0 = center of image
            var marginLeft = x === 0 ? 0 : overlap;
            var marginTop = y === 0 ? 0 : overlap;
            var marginRight = x === (level.x_tiles - 1) ? 0 : overlap;
            var marginBottom = y === (level.y_tiles - 1) ? 0 : overlap;

            var topLeft = new Vector2(-this.size.x / 2, -this.size.y / 2);
            var tileTopLeft = topLeft.translate(scaledTileSize * x - marginLeft / level.scale, scaledTileSize * y - marginTop / level.scale);
            var tileWidth = Math.min(tileSize, level.width - (x * tileSize)) + marginLeft + marginRight;
            var tileHeight = Math.min(tileSize, level.height - (y * tileSize)) + marginTop + marginBottom;
            var tileCenter = tileTopLeft.translate(tileWidth / level.scale / 2, tileHeight / level.scale / 2);

            imgDrw = new ImageDrawing(
              generateActionId(),
              this.board,
              newUrl,
              new Vector2(tileWidth, tileHeight),
              tileCenter,
              1 / level.scale,
              0
            );

            imgDrw.level = level.number;

            imgDrwEntry = { imageDrawing: imgDrw, innerPosition: tileCenter };
            this.imageDrawings.set(key, imgDrwEntry);
          }

          imgDrw = imgDrwEntry.imageDrawing;

          imgDrw.position = imgDrwEntry.innerPosition.matrixMultiply(centerpointMatrix);
          imgDrw.scale = this.scale / level.scale;
          imgDrw.angle = this.angle;
          imgDrw.clearBounds();
          this.board.drawingLayer.addAction(imgDrw);

        }
      }

    }
  },

  clearActions() {
    for (let d of this.imageDrawings.values()) {
      this.board.drawingLayer.removeAction(d.uid);
    }
    this.imageDrawings = new Map();
  },

  executeDraw: function(drawing, drawBounds, levelIdx) {

    this.ensureActions();

    // 1. get image json
    // 2. determine level
    // 3. ensure ImageDrawing objects
    // 4. draw ImageDrawings


    //
    // this.boundsRect();
    //
    // var level = _.find(this.imageJson.level_data, function(l) { return l.number === levelIdx });
    // if (!level) {
    //   level = this.imageJson.level_data[this.imageJson.level_data.length - 1];
    // }
    //
    // //var level = level; this.calculateCurrentLevel();
    // this.currentLevel = level;


  }
});