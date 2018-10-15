function ImageDrawing(uid, url, size, position, scale, angle) {
  BaseDrawing.call(this, uid);

  this.url = url;
  this.size = size;
  this.position = position;
  this.scale = scale;
  this.angle = angle;

  this.transformedImage = null;

  console.log(this);
}

ImageDrawing.prototype = _.extend(ImageDrawing.prototype, BaseDrawing.prototype, {
  calculateBounds: function() {
    var height = this.size.y * this.scale;
    var width = this.size.x * this.scale;
    var radius = Math.sqrt((width * width) + (height * height)) / 2;
    var topLeft = new Vector2(this.position.x - radius, this.position.y - radius);
    return new Rectangle(
      topLeft,
      new Vector2(topLeft.x + (radius * 2), topLeft.y + (radius * 2)));
  },

  executeDraw: function(drawing, drawBounds) {
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
          ctx.rotate(this.angle * Math.PI / 180);
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
        this.position.translate(dWidth / 2, dHeight / 2)
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