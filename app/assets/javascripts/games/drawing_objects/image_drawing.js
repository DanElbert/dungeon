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
        if (this.angle === 0) {
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
          ctx.drawImage(imgObj, 0, 0);
          ctx.restore();
        }
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

      var destBox = sourceBox.scale(this.scale, this.scale).translate(this.position.x - (dWidth / 2), this.position.y - (dHeight / 2));


      ctx.drawImage(
        this.transformedImage,
        Math.floor(sourceBox.left()),
        Math.floor(sourceBox.top()),
        Math.floor(sourceBox.width()),
        Math.floor(sourceBox.height()),
        Math.floor(destBox.left()),
        Math.floor(destBox.top()),
        Math.floor(destBox.width()),
        Math.floor(destBox.height()));

      ctx.save();
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 10;
      ctx.strokeRect(destBox.left(), destBox.top(), destBox.width(), destBox.height());
      //
      // ctx.lineWidth = 5;
      // ctx.strokeStyle = 'green';
      // ctx.strokeRect(sourceBox.left(), sourceBox.top(), sourceBox.width(), sourceBox.height());
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