
function ViewPortLabels(board) {
  this.board = board;
  this.drawing = board.drawing;
  this.context = board.context;

  this.labelCache = new ViewPortLabelCache(500, 100);

}
_.extend(ViewPortLabels.prototype, {
  draw: function() {
    var pixelWidth = this.board.canvas.width;
    var pixelHeight = this.board.canvas.height;

    var tilePixelSize = this.drawing.cellSize * this.board.getZoom();
    var labelStep = 1;

    var originX = this.board.getViewPortCoordinates()[0];
    var originY = this.board.getViewPortCoordinates()[1];

    var mapTileOrigin = Geometry.getCell(this.board.getViewPortCoordinates(), this.drawing.cellSize);
    var mapTileOriginCenter = Geometry.getCellMidpoint(mapTileOrigin, this.drawing.cellSize);

    var firstHorizontalTile = mapTileOrigin[0] + ((originX > mapTileOriginCenter[0]) ? 2 : 1);
    var firstVerticalTile = mapTileOrigin[1] + ((originY > mapTileOriginCenter[1]) ? 2 : 1);

    // If zoomed out, reduce the number of labels
    if (tilePixelSize < 25) {
      labelStep = 2;
      if (firstHorizontalTile % 2 != 0) {
        firstHorizontalTile += 1;
      }

      if (firstVerticalTile % 2 != 0) {
        firstVerticalTile += 1;
      }
    }

    var horizontalPixelOrigin = (((firstHorizontalTile * this.drawing.cellSize) - originX) * this.board.getZoom()) + (tilePixelSize / 2);
    var verticalPixelOrigin = (((firstVerticalTile * this.drawing.cellSize) - originY) * this.board.getZoom()) + (tilePixelSize / 2);

    var cursor = this.board.hovered_cell;

    this.context.save();
    this.context.setTransform(1, 0, 0, 1, 0, 0);
    this.context.translate(0.5, 0.5);

    this.context.beginPath();
    this.context.fillStyle = "rgba(100, 100, 100, 0.5)";
    this.context.rect(0, 0, pixelWidth, 30);
    this.context.fill();

    this.context.beginPath();
    this.context.rect(0, 30, 30, pixelHeight);
    this.context.fill();

    var labeled = horizontalPixelOrigin;
    var cur = firstHorizontalTile;

    while (labeled < pixelWidth) {
      this.drawLabel([labeled, 15], this.numberToLetters(cur), (cursor && cur == cursor[0]));
      labeled += (tilePixelSize * labelStep);
      cur += labelStep;
    }

    labeled = verticalPixelOrigin;
    cur = firstVerticalTile;

    while (labeled < pixelHeight) {
      this.drawLabel([14, labeled], cur, (cursor && cur == cursor[1]));
      labeled += (tilePixelSize * labelStep);
      cur += labelStep;
    }

    this.board.context.restore();
  },

  drawLabel: function(point, text, highlight) {
    var image = this.labelCache.get(text);
    if (image == null) {
      image = new ViewPortLabel(text, this.board.imageCache);
      this.labelCache.set(text, image);
    }
    var width = image.width;
    var height = image.height;
    this.context.drawImage(image.getImage(), point[0] - (width / 2), point[1] - (height / 2), width, height);
  },

  numberToLetters: function(value) {
    var result = "";
    var negative = value < 0;
    value = Math.floor(Math.abs(value));

    do {
      var rem = (value) % 26;
      value = Math.floor((value) / 26);
      result = String.fromCharCode(65 + rem) + result;
    } while (value > 0);

    if (negative) {
      result = "-" + result;
    }

    return result;
  }
});

function ViewPortLabel(label, imageCache) {
  this.label = label;
  this.canvas = null;
  this.context = null;
  this.drawing = null;
  this.imageCache = imageCache;
  this.width = 40;
  this.height = 24;
}

_.extend(ViewPortLabel.prototype, {
  getImage: function() {
    if (this.canvas == null) {
      this.canvas = document.createElement("canvas");
      this.canvas.width = this.width;
      this.canvas.height = this.height;
      this.context = this.canvas.getContext("2d");
      this.drawing = new Drawing(this.context, this.imageCache);
      this.drawing.drawText(this.label, [this.width / 2, this.height / 2], 20, "white", "black", 1);
    }

    return this.canvas;
  }
});

function ViewPortLabelCache(cutoff, prune) {
  this.cache = {};
  this.cutoff = cutoff || 550;
  this.pruneCount = prune || 100;
}

_.extend(ViewPortLabelCache.prototype, {
  get: function(id) {
    var item = this.cache[id];
    if (item) {
      item.access = new Date();
      return item.value;
    } else {
      return null;
    }
  },

  set: function(id, value) {
    this.cache[id] = {access: new Date(), id: id, value: value};
    this.prune();
  },

  prune: function() {
    if (_.keys(this.cache).length > this.cutoff) {
      var values = _.values(this.cache);
      values = _.sortBy(values, "access");
      values = _.last(values, (this.cutoff - this.pruneCount));
      this.cache = _.reduce(values, function(h, v) { h[v.id] = v; return h; }, {}, this);
    }
  }
});