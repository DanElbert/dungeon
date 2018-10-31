function TiledImageDrawing(uid, board, url, size, position, scale, angle) {
  DrawingCollection.call(this, uid, board, position, scale, angle, false);

  this.url = url;
  this.board = board;
  this.size = size;
  this.imageJson = null;
  this.imageJsonFetching = false;
  this.fallbackImage = null;

  this.imageDrawings = new Map();

  this.buildActions();
}

TiledImageDrawing.prototype = _.extend(TiledImageDrawing.prototype, DrawingCollection.prototype, {
  calculateBounds: function() {
    this.updateGeometry();
    var height = this.size.y * this.scale;
    var width = this.size.x * this.scale;

    var rec = new Rectangle(
      new Vector2(this.position.x - width / 2, this.position.y - height / 2),
      width,
      height
    );

    return this.getRotatedRecBounds(rec, this.angle);
  },

  buildActions() {

    if (this.imageJson === null && this.imageJsonFetching === false) {
      this.imageJsonFetching = true;
      var self = this;
      $.getJSON(this.url, function(data) {

        var calculateFallbackLevel = function(tileSize, width, height) {
          var dim = Math.max(width, height);
          var lvl = 1;
          while (dim > tileSize) {
            lvl += 1;
            dim = dim / 2;
          }
          return lvl;
        };

        var hasFallbackImage = function(img) {
          self.imageJsonFetching = false;
          self.imageJson = data;
          self.buildActions();
          self.invalidate();
        };

        var fallbackLevel = calculateFallbackLevel(data.tile_size, self.size.x, self.size.y);
        var fallbackUrl = "/images/" + data.id + "/" + fallbackLevel + "/0_0." + data.extension;
        var fallback = self.board.imageCache.getImage(fallbackUrl, hasFallbackImage);
        if (fallback !== null) {
          hasFallbackImage(fallback);
        }

        //console.log(data);
      });
    }

    if (this.imageJson === null) {
      return;
    }

    this.bounds();

    var tileSize = this.imageJson.tile_size;
    var overlap = this.imageJson.overlap;

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
            imgDrw.fallbackImage = this.fallbackImage;

            imgDrwEntry = { level: level, imageDrawing: imgDrw, innerPosition: tileCenter };
            this.imageDrawings.set(key, imgDrwEntry);

            this.children.push(imgDrw);
          }

        }
      }
    }

    this.updateGeometry();
  },

  updateGeometry: function() {
    var centerpointMatrix = TransformMatrix.Identity
      .translate(this.position.x, this.position.y)
      .rotate(this.angle)
      .scale(this.scale, this.scale);

    for (let imgDrwEntry of this.imageDrawings.values()) {
      var imgDrw = imgDrwEntry.imageDrawing;
      var level = imgDrwEntry.level;

      imgDrw.setPosition(imgDrwEntry.innerPosition.matrixMultiply(centerpointMatrix));
      imgDrw.setScale(this.scale / level.scale);
      imgDrw.setAngle(this.angle);
    }
  },
});