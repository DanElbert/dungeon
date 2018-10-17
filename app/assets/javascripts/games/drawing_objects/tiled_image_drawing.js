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
    if (this.currentLevel && this.previousZoom !== this.board.getZoom()) {
      var level = this.calculateCurrentLevel();
      if (level.number !== this.currentLevel.number) {
        this.invalidate();
      }
      this.previousZoom = this.board.getZoom();
    }
  },

  calculateCurrentLevel() {
    var zoom = this.board.getZoom() * this.scale;
    var displayWidth = zoom * this.size.x;
    return _.min(this.imageJson.level_data, function(l) { return Math.abs(displayWidth - l.width) }, this);
  },

  executeDraw: function(drawing, drawBounds) {
    // 1. get image json
    // 2. determine level
    // 3. ensure ImageDrawing objects
    // 4. draw ImageDrawings

    if (this.imageJson === null && this.imageJsonFetching === false) {
      this.imageJsonFetching = true;
      var self = this;
      $.getJSON(this.url, function(data) {
        self.imageJsonFetching = false;
        self.imageJson = data;
        console.log(data);
      });
    }

    if (this.imageJson === null) {
      return;
    }

    this.boundsRect();
    var level = this.calculateCurrentLevel();
    this.currentLevel = level;

    var tileSize = this.imageJson.tile_size;
    var scaledTileSize = tileSize / level.scale;

    var centerpointMatrix = TransformMatrix.Identity
      .translate(this.position.x, this.position.y)
      .rotate(this.angle)
      .scale(this.scale, this.scale);

    var x, y, key, updateThisGeometry, imgDrwEntry, imgDrw;

    for (x = 0; x < level.x_tiles; x++) {
      for (y = 0; y < level.y_tiles; y++) {
        key = [level.number, x, y].join("::");
        updateThisGeometry = this.updateGeometry;

        imgDrwEntry = this.imageDrawings.get(key);

        if (!imgDrwEntry) {
          updateThisGeometry = true;
          var newUrl = "/images/" + this.imageJson.id + "/" + level.number + "/" + x + "_" + y + "." + this.imageJson.extension;

          // 0,0 = center of image
          var topLeft = new Vector2(-this.size.x / 2, -this.size.y / 2);
          var tileTopLeft = topLeft.translate(scaledTileSize * x, scaledTileSize * y);
          var tileCenter = tileTopLeft.translate(scaledTileSize / 2, scaledTileSize / 2);
          var tileWidth = tileSize;
          var tileHeight = tileSize;

          if (x == level.x_tiles - 1 || y == level.y_tiles - 1) {
            tileWidth = Math.min(tileSize, level.width - (x * tileSize));
            tileHeight = Math.min(tileSize, level.height - (y * tileSize));
            tileCenter = tileTopLeft.translate(tileWidth / level.scale / 2, tileHeight / level.scale / 2);
          }

          imgDrw = new ImageDrawing(
            this.uid,
            this.board,
            newUrl,
            new Vector2(tileWidth, tileHeight),
            tileCenter,
            1 / level.scale,
            0
          );

          imgDrwEntry = { imageDrawing: imgDrw, innerPosition: tileCenter };
          this.imageDrawings.set(key, imgDrwEntry);
        }

        imgDrw = imgDrwEntry.imageDrawing;

        if (updateThisGeometry) {

          imgDrw.position = imgDrwEntry.innerPosition.matrixMultiply(centerpointMatrix);
          imgDrw.scale = this.scale / level.scale;
          imgDrw.angle = this.angle;
          imgDrw.clearBounds();
        }

        imgDrw.draw(drawing, drawBounds);
      }
    }
    this.updateGeometry = false;
  }
});