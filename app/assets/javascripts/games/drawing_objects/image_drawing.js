function ImageDrawing(uid, board, url, size, position, scale, angle) {
  BaseDrawing.call(this, uid);

  this.url = url;
  this.board = board;
  this.size = size;
  this.position = position;
  this.scale = scale;
  this.angle = angle;

  this.transformedImage = null;
}

ImageDrawing.prototype = _.extend(ImageDrawing.prototype, BaseDrawing.prototype, {
  calculateBounds: function() {
    this.transformedImage = null;
    console.log('.');
    var height = this.size.y * this.scale;
    var width = this.size.x * this.scale;

    var rec = new Rectangle(
      new Vector2(this.position.x - width / 2, this.position.y - height / 2),
      width,
      height
    );

    return this.getRotatedRecBounds(rec, this.angle);
  },

  executeDraw: function(drawing, drawBounds) {
    if (!this.boundsRect().overlaps(drawBounds)) {
      return;
    }

    var ctx;

    if (this.transformedImage === null) {
      var imgObj = drawing.imageCache.getImage(this.url);

      if (imgObj) {
        if (this.angle === 0 && this.scale === 1) {
          this.transformedImage = imgObj;
        } else {

          var targetSize = this.boundsRect().size();
          var sourceSize = this.size;
          this.transformedImage = document.createElement("canvas");
          this.transformedImage.width = targetSize.x;
          this.transformedImage.height = targetSize.y;
          ctx = this.transformedImage.getContext("2d");
          ctx.save();

          ctx.translate(targetSize.x / 2, targetSize.y / 2);
          ctx.rotate(this.angle);
          ctx.scale(this.scale, this.scale);
          ctx.translate(sourceSize.x / -2, sourceSize.y / -2);
          ctx.drawImage(imgObj, 0, 0);
        }
      }
    }

    if (this.transformedImage !== null) {
      ctx = drawing.context;

      var dWidth = this.transformedImage.width;
      var dHeight = this.transformedImage.height;

      var imgBox = new Rectangle(
        this.position.translate(-dWidth / 2, -dHeight / 2),
        dWidth,
        dHeight
      );

      var sx = drawBounds.left() - imgBox.left();
      var sy = drawBounds.top() - imgBox.top();
      var sWidth = drawBounds.width();
      var sHeight = drawBounds.height();

      ctx.save();

      ctx.translate(this.position.x - imgBox.width() / 2, this.position.y - imgBox.height() / 2);

      ctx.drawImage(this.transformedImage, sx, sy, sWidth, sHeight, sx, sy, sWidth, sHeight);

      ctx.restore();
    }

  },
});

ImageDrawing.getImageDrawing = function(uid, board, url, size, position, scale, angle) {
  if (/\.json($|\?|#)/.test(url)) {
    return new TiledImageDrawing(uid, board, url, size, position, scale, angle *  Math.PI / 180);
  } else {
    return new ImageDrawing(uid, board, url, size, position, scale, angle *  Math.PI / 180);
  }

};