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
      console.log("zoom: " + this.board.getZoom() + ", level: " + level.number);
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

    var level = this.calculateCurrentLevel();
    this.currentLevel = level;

    var tileSize = this.imageJson.tile_size;
    var scaledTileSize = tileSize / level.scale;

    var centerpointMatrix = TransformMatrix.Identity
      .translate(this.position.x, this.position.y)
      .rotate(this.angle)
      .scale(this.scale, this.scale);

    for (var x = 0; x < level.x_tiles; x++) {
      for (var y = 0; y < level.y_tiles; y++) {
        var key = [level.number, x, y].join("::");
        var updateThisGeometry = this.updateGeometry;

        var imgDrw = this.imageDrawings.get(key);

        if (!imgDrw) {
          updateThisGeometry = true;
          var newUrl = "/images/" + this.imageJson.id + "/" + level.number + "/" + x + "_" + y + "." + this.imageJson.extension;

          imgDrw = new ImageDrawing(
            this.uid,
            this.board,
            newUrl,
            new Vector2(tileSize, tileSize),
            new Vector2(0,0),
            1 / level.scale,
            0
          );

          this.imageDrawings.set(key, imgDrw);
        }

        if (updateThisGeometry) {
          // 0,0 = center of image
          var topLeft = new Vector2(-this.size.x / 2, -this.size.y / 2);
          var tileTopLeft = topLeft.translate(scaledTileSize * x, scaledTileSize * y);
          var tileCenter = tileTopLeft.translate(scaledTileSize / 2, scaledTileSize / 2);

          var tilePosition = tileCenter.matrixMultiply(centerpointMatrix);

          imgDrw.position = tilePosition;
          imgDrw.scale = this.scale / level.scale;
          imgDrw.angle = this.angle;
          imgDrw.clearBounds();
        }

        imgDrw.draw(drawing, drawBounds);
      }
      this.updateGeometry = false;
    }
  }
});