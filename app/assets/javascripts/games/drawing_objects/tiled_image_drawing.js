function TiledImageDrawing(uid, board, url, size, position, scale, angle) {
  BaseDrawing.call(this, uid, board, position, scale, angle);

  this.url = url;
  this.board = board;
  this.size = size;
  this.imageJson = null;
  this.imageJsonFetching = false;

  this.imageDrawings = new Map();
}

TiledImageDrawing.prototype = _.extend(TiledImageDrawing.prototype, BaseDrawing.prototype, {
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

  setDrawingLayer: function(dl) {
    if (this.drawingLayer !== null) {
      for (let entry of this.imageDrawings.values()) {
        this.drawingLayer.removeAction(entry.imageDrawing.uid);
      }
    }

    if (dl !== null) {
      for (let entry of this.imageDrawings.values()) {
        dl.addAction(entry.imageDrawing);
      }
    }

    BaseDrawing.prototype.setDrawingLayer.call(this, dl);
  },

  ensureActions: function() {
    if (this.imageDrawings.size === 0) {
      this.buildActions();
    }
  },

  buildActions() {

    if (this.imageJson === null && this.imageJsonFetching === false) {
      this.imageJsonFetching = true;
      var self = this;
      $.getJSON(this.url, function(data) {
        self.imageJsonFetching = false;
        self.imageJson = data;
        self.buildActions();
        self.invalidate();
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

            imgDrwEntry = { level: level, imageDrawing: imgDrw, innerPosition: tileCenter };
            this.imageDrawings.set(key, imgDrwEntry);

            if (this.drawingLayer) {
              this.drawingLayer.addAction(imgDrw);
            }
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

  executeDraw: function(drawing, drawBounds, levelIdx) {

    this.ensureActions();


  }
});