
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

  addImage: function(url, callback) {
    var self = this;
    if (!this.images[url]) {

      var imageData = {image: new Image(), loaded: false, callbacks: []};
      
      if (callback) {
        imageData.callbacks.push(callback);
      }

      imageData.image.onload = function() {
        imageData.loaded = true;
        for (let c of imageData.callbacks) {
          c(imageData.image);
        }
        $(self).trigger("imageloaded");
      };

      imageData.image.src = url;
      this.images[url] = imageData;
    }
  },

  // callback will only be called if image not immidiately available
  getImage: function(url, callback) {
    var imageData = this.images[url];

    if (imageData && imageData.loaded) {
      return imageData.image;
    } else if (!imageData) {
      this.addImage(url, callback);
      return null;
    } else {
      if (callback) {
       imageData.callbacks.push(callback); 
      }
      return null;
    }
  }
});