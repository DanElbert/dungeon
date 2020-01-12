import { Geometry, Vector2, Rectangle } from "../geometry";
import { BaseDrawing } from "./BaseDrawing";

class ImageDrawing extends BaseDrawing {
  constructor(uid, board, url, size, position, scale, angle, level) {
    super(uid, board, position, scale, angle, false, level);

    this.url = url;
    this.size = size;
    this.loading = false;
    this.level = null;
    this.fallbackImage = null;

    this.transformedImage = null;
    this.fallbackImageWriter = null;
  }

  calculateBounds() {
    this.transformedImage = null;
    var height = this.size.y * this.scale;
    var width = this.size.x * this.scale;

    var rec = new Rectangle(
      new Vector2(this.position.x - width / 2, this.position.y - height / 2),
      width,
      height
    );

    return this.getRotatedRecBounds(rec, this.angle);
  }

  executeDraw(drawing, drawBounds, level) {
    if (!this.bounds().overlaps(drawBounds) || (this.level !== null && this.level !== level)) {
      return;
    }

    var ctx;

    if (this.transformedImage === null) {
      var self = this;
      var imgObj = drawing.imageCache.getImage(this.url, function() {
        self.loading = false;
        self.transformedImage = null;
        self.invalidate();
      });

      this.loading = imgObj === null;

      if (imgObj && this.angle === 0) {
        this.transformedImage = imgObj;
      } else {
        var sizeRec = new Rectangle(new Vector2(0, 0), this.size.x, this.size.y);
        var targetSize = this.getRotatedRecBounds(sizeRec, this.angle).size();

        this.transformedImage = document.createElement("canvas");
        this.transformedImage.width = targetSize.x;
        this.transformedImage.height = targetSize.y;
        ctx = this.transformedImage.getContext("2d");

        ctx.save();
        ctx.translate(targetSize.x / 2, targetSize.y / 2);
        ctx.rotate(this.angle);
        ctx.translate(-this.size.x / 2, -this.size.y / 2);
        if (this.loading) {
          if (this.fallbackImageWriter !== null) {
            this.fallbackImageWriter(this, ctx);
          } else {
            ctx.fillStyle = "#AAAAAA";
            ctx.fillRect(0, 0, this.size.x, this.size.y);
          }
        } else {
          ctx.drawImage(imgObj, 0, 0);
        }
        ctx.restore();
      }

    }

    if (this.transformedImage !== null) {
      ctx = drawing.context;

      var sWidth = this.transformedImage.width;
      var sHeight = this.transformedImage.height;
      var dWidth = sWidth * this.scale;
      var dHeight = sHeight * this.scale;

      // determine portion of image to draw
      // clip image to drawBounds
      var sourceBox = new Rectangle(
        new Vector2(0, 0),
        sWidth,
        sHeight
      ).clipTo(drawBounds.translate(-this.position.x + (dWidth / 2), -this.position.y + (dHeight / 2)).scale(1 / this.scale, 1 / this.scale));

      var destBox = sourceBox.scale(this.scale, this.scale).translate(this.position.x - (dWidth / 2), this.position.y - (dHeight / 2)).roundValues();
      sourceBox = sourceBox.roundValues();

      if (sourceBox.width() === 0 || sourceBox.height() === 0 || destBox.height() === 0 || destBox.width() === 0) {
        return;
      }

      ctx.drawImage(
        this.transformedImage,
        sourceBox.left(),
        sourceBox.top(),
        sourceBox.width(),
        sourceBox.height(),
        destBox.left(),
        destBox.top(),
        destBox.width(),
        destBox.height());

      //  ctx.save();
      //  ctx.strokeStyle = 'red';
      //  ctx.lineWidth = 1;
      //  ctx.strokeRect(destBox.left(), destBox.top(), destBox.width(), destBox.height());
      //
      // ctx.lineWidth = 5;
      // ctx.strokeStyle = 'green';
      // ctx.strokeRect(sourceBox.left(), sourceBox.top(), sourceBox.width(), sourceBox.height());
      //  ctx.restore();
    }

  }

  static getImageDrawing(uid, board, url, size, position, scale, angle, level) {
    if (/\.json($|\?|#)/.test(url)) {
      return new TiledImageDrawing(uid, board, url, size, position, scale, angle *  Math.PI / 180, level);
    } else {
      return new ImageDrawing(uid, board, url, size, position, scale, angle *  Math.PI / 180, level);
    }
  }
}



export {
  ImageDrawing
}