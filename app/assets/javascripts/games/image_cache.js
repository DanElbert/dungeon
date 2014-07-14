
function ImageCache() {
  this.images = {};
}

_.extend(ImageCache.prototype, {
  addImages: function(images) {
    images = Object.prototype.toString.apply( images ) === '[object Array]' ? images : [images];

    for ( var i = 0; i < images.length; i++ ) {

      var image = images[i];

      this.addImage(image.url);
    }
  },

  addImage: function(url) {
    var self = this;
    if (!this.images[url]) {

      var imageData = {image: new Image(), loaded: false};

      imageData.image.onload = function() {
        imageData.loaded = true;
        $(self).trigger("imageloaded");
      };

      imageData.image.src = url;
      this.images[url] = imageData;
    }
  },

  getImage: function(url) {
    var imageData = this.images[url];

    if (imageData && imageData.loaded) {
      return imageData.image;
    } else if (!imageData) {
      this.addImage(url);
      return null;
    } else {
      return null;
    }
  }
});