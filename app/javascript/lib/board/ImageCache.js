import Eventer from "../Eventer";

class ImageCacheItem {
  constructor(url, priority) {
    this.url = url;
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

  load() {
    if (this.loaded === true) {
      return new Promise.resolve(this);
    } else {
      return new Promise((resolve, reject) => {
        this.image = new Image();
        this.image.onload = () => {
          this.loaded = true;
          for (let cb of this.callbacks) {
            cb(this.image);
          }
          this.callbacks = [];
          this.failbacks = [];
          resolve(this);
        };

        this.image.onerror = e => {
          for (let fb of this.failbacks) {
            fb(e);
          }
          this.callbacks = [];
          this.failbacks = [];
          reject(e);
        };

        this.image.src = this.url;
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

export class ImageCache extends Eventer {
  constructor() {
    super();
    this.images = {};
    this.loadingQueue = [];
    this.maxLoading = 10;
    this.loadingUrls = {};
  }

  addImages(images) {
    images = Object.prototype.toString.apply( images ) === '[object Array]' ? images : [images];

    for ( var i = 0; i < images.length; i++ ) {

      var image = images[i];

      this.addImage(image.url);
    }
  }

  addImage(url, priority) {
    if (priority === undefined || priority === null) {
      priority = 0;
    }

    var imageData = this.images[url];
    if (!imageData) {
      imageData = new ImageCacheItem(url, priority);
      this.images[url] = imageData;
      this.loadingQueue.push(imageData);
      this.runQueue();
    }
    return imageData;
  }

  runQueue() {
    if (this.loadingQueue.length === 0 || Object.keys(this.loadingUrls).length >= this.maxLoading) {
      return;
    }

    this.loadingQueue.sort((a, b) => a.compareTo(b));

    while (this.loadingQueue.length > 0 && Object.keys(this.loadingUrls).length < this.maxLoading) {
      let img = this.loadingQueue.pop();
      this.loadingUrls[img.url] = true;
      img.load()
        .then(img => {
          delete this.loadingUrls[img.url];
          this.trigger("imageloaded");
          this.runQueue();
        })
        .catch(e => {
          delete this.images[img.url];
          delete this.loadingUrls[img.url];
          this.runQueue();
        });
    }
  }

  getImageAsync(url, priority) {
    var imageData = this.images[url];
    if (!imageData) {
      imageData = this.addImage(url, priority);
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
  getImage(url, priority) {
    var imageData = this.images[url];
    if (!imageData) {
      imageData = this.addImage(url, priority);
    }
    imageData.touch();

    if (imageData.loaded) {
      return imageData.image;
    } else {
      return null;
    }
  }
}
