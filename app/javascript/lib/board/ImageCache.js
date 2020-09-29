import { getImgElement as getFaImage } from "../FontAwesome";
import Eventer from "../Eventer";

class ImageCacheItem {
  constructor(key, priority) {
    this.key = key;
    this.priority = priority;
    this.image = null;
    this.loaded = false;
    this.callbacks = [];
    this.failbacks = [];
    this.lastTouch = Date.now();
  }

  addCallback(cb) {
    this.callbacks.push(cb);
  }

  addFailback(fb) {
    this.failbacks.push(fb);
  }

  touch() {
    this.lastTouch = Date.now();
  }

  beginLoading() {
    throw "Not Implemented";
  }

  load() {
    if (this.loaded === true) {
      return new Promise.resolve(this);
    } else {
      return this.beginLoading()
        .then(img => {
          this.image = img;
          this.loaded = true;
          for (let cb of this.callbacks) {
            cb(this.image);
          }
          this.callbacks = [];
          this.failbacks = [];
          return this;
        })
        .catch(err => {
          for (let fb of this.failbacks) {
            fb(err);
          }
          this.callbacks = [];
          this.failbacks = [];
          throw err;
        });
    }
  }

  compareTo(other) {
    if (this.priority !== other.priority) {
      if (this.priority > other.priority) {
        return -1;
      } else {
        return 1;
      }
    }

    if (this.lastTouch !== other.lastTouch) {
      if (this.lastTouch > other.lastTouch) {
        return -1;
      } else {
        return 1;
      }
    }

    return 0;
  }
}

class UrlImageCacheItem extends ImageCacheItem {
  beginLoading() {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        resolve(img);
      };

      img.onerror = e => {
        reject(e);
      };

      img.src = this.key;
    });
  }
}

class FontAwesomeSvgImageCacheItem extends ImageCacheItem {
  beginLoading() {
    const parts = this.key.split(":");
    const iconData = {
      prefix: parts[0],
      iconName: parts[1]
    }
    return getFaImage(iconData);
  }
}

export class ImageCache extends Eventer {
  constructor() {
    super();
    this.images = {};
    this.loadingQueue = [];
    this.maxLoading = 3;
    this.loadingKeys = {};
  }

  addImages(images) {
    images = Object.prototype.toString.apply( images ) === '[object Array]' ? images : [images];

    for ( var i = 0; i < images.length; i++ ) {
      const image = images[i];
      this.addImage(image.url);
    }
  }

  addImage(key, priority) {
    if (priority === undefined || priority === null) {
      priority = 0;
    }

    let imageData = this.images[key];

    if (!imageData) {

      if (/^fa[brs]?:\w+/.test(key)) {
        imageData = new FontAwesomeSvgImageCacheItem(key, priority);
      } else {
        imageData = new UrlImageCacheItem(key, priority);
      }

      this.images[key] = imageData;
      this.loadingQueue.push(imageData);
      this.runQueue();
    }
    return imageData;
  }

  runQueue() {
    if (this.loadingQueue.length === 0 || Object.keys(this.loadingKeys).length >= this.maxLoading) {
      return;
    }

    this.loadingQueue.sort((a, b) => a.compareTo(b));

    while (this.loadingQueue.length > 0 && Object.keys(this.loadingKeys).length < this.maxLoading) {
      let img = this.loadingQueue.pop();
      this.loadingKeys[img.key] = true;
      img.load()
        .then(img => {
          delete this.loadingKeys[img.key];
          this.trigger("imageloaded");
          this.runQueue();
        })
        .catch(e => {
          delete this.images[img.key];
          // delete this.loadingKeys[img.key];
          this.runQueue();
          console.log(e);
        });
    }
  }

  getImageAsync(key, priority) {
    var imageData = this.images[key];
    if (!imageData) {
      imageData = this.addImage(key, priority);
    }
    imageData.touch();

    if (imageData.loaded) {
      return Promise.resolve(imageData.image);
    } else {
      return new Promise((resolve, reject) => {
        imageData.addCallback(i => resolve(i));
        imageData.addFailback(e => reject(e));
      });
    }
  }

  // callback will only be called if image not immidiately available
  getImage(key, priority) {
    var imageData = this.images[key];
    if (!imageData) {
      imageData = this.addImage(key, priority);
    }
    imageData.touch();

    if (imageData.loaded) {
      return imageData.image;
    } else {
      return null;
    }
  }
}
