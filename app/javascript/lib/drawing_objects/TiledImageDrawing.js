import Api from "../Api";
import { DrawingCollection } from "./DrawingCollection";
import { Geometry, Rectangle, TransformMatrix, Vector2 } from "../geometry";
import { generateActionId } from "../Actions";
import { ImageDrawing } from "./ImageDrawing";

class TiledImageDrawing extends DrawingCollection {
  constructor(uid, board, url, size, position, scale, angle, level) {
    super(uid, board, position, scale, angle, false, level);

    this.url = url;
    this.board = board;
    this.size = size;
    this.imageJson = null;
    this.isFetching = false;
    this.fallbackImage = null;

    this.imageDrawings = new Map();

    this.buildActions();
  }

  updateUrl(newUrl) {
    this.invalidateHandler(() => {
      this.url = newUrl;
      this.forceBuildActions();
    });
  }

  calculateBounds() {
    this.updateGeometry();
    var height = this.size.y * this.scale;
    var width = this.size.x * this.scale;

    var rec = new Rectangle(
      new Vector2(this.position.x - width / 2, this.position.y - height / 2),
      width,
      height
    );

    return this.getRotatedRecBounds(rec, this.angle);
  }

  calculateFallbackLevel(tileSize, width, height) {
    let dim = Math.max(width, height);
    let lvl = 1;
    while (dim > tileSize) {
      lvl += 1;
      dim = dim / 2;
    }
    return lvl;
  }

  forceBuildActions() {
    this.imageJson = null;
    this.fallbackImage = null;
    this.imageDrawings = new Map();
    this.children = [];
    this.buildActions();
  }

  async buildActions() {
    if (this.isFetching === true) {
      return;
    }

    this.isFetching = true;
    try {
      const originalUrl = this.url;

      const data = await Api.getJson(this.url);

      const fallbackLevel = this.calculateFallbackLevel(data.tile_size, this.size.x, this.size.y);
      const fallbackUrl = "/images/" + data.id + "/" + fallbackLevel + "/0_0." + data.extension;

      const image = await this.board.imageCache.getImageAsync(fallbackUrl, 99);

      if (originalUrl === this.url) {
        this.imageJson = data;
        this.fallbackImage = image;
      } else {
        // url has changed while loading; start over
        setTimeout(() => this.buildActions(), 10);
        return null;
      }

    } finally {
      this.isFetching = false;
    }

    this.bounds();

    var tileSize = this.imageJson.tile_size;
    var overlap = this.imageJson.overlap;

    for (let level of this.imageJson.level_data) {

      var scaledTileSize = tileSize / level.scale;
      var x, y, key, imgDrwEntry, imgDrw;

      for (x = 0; x < level.x_tiles; x++) {
        for (y = 0; y < level.y_tiles; y++) {
          key = this.buildImageKey(level.number, x, y);

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
              0,
              this.level
            );

            imgDrw.detailLevel = level.number;
            imgDrw.fallbackImageWriter = (img, ctx) => this.generateFallbackImage(img, ctx);
            imgDrw.fallbackImage = this.fallbackImage;
            imgDrw.tiledImageDrawingInnerPosition = tileCenter;
            imgDrw.tiledImageDrawingScale = level.scale;

            imgDrwEntry = { level: level, imageDrawing: imgDrw, innerPosition: tileCenter };
            this.imageDrawings.set(key, imgDrwEntry);

            this.children.push(imgDrw);
          }

        }
      }
    }

    this.updateGeometry();
    this.invalidate();
  }

  updateGeometry() {
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
  }

  generateFallbackImage(imgDrawing, context) {
    var position = imgDrawing.tiledImageDrawingInnerPosition.translate(this.size.x / 2, this.size.y / 2);
    var scale = imgDrawing.tiledImageDrawingScale;
    var tileHeight = imgDrawing.size.y;
    var tileWidth = imgDrawing.size.x;
    var box = new Rectangle(position.translate(-tileWidth / scale / 2, -tileHeight / scale / 2), tileWidth / scale, tileHeight / scale);
    var sourceBox = box.scale(this.fallbackImage.width / this.size.x, this.fallbackImage.height / this.size.y);

    context.drawImage(
      this.fallbackImage,
      sourceBox.left(),
      sourceBox.top(),
      sourceBox.width(),
      sourceBox.height(),
      0,
      0,
      imgDrawing.size.x,
      imgDrawing.size.y);

    // context.fillStyle = "#FFFFFF";
    // context.fillRect(0, 0, imgDrawing.size.x, imgDrawing.size.y);
  }

  buildImageKey(level, x, y) {
    return [level, x, y].join("::");
  }
}

export {
  TiledImageDrawing
}