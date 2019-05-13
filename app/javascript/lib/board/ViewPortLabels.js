export class ViewPortLabels {
  constructor(board, useXLetters) {
    this.board = board;
    this.drawing = board.drawing;
    this.context = board.context;
    this.useXLetters = !!useXLetters;

    this.labelCache = new ViewPortLabelCache();
    this.labelWidth = 40;
    this.labelHeight = 24;

  }

  draw() {
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
    labelStep = tilePixelSize >= this.labelWidth ? 1 : Math.ceil(this.labelWidth / tilePixelSize);

    var horizontalPixelOrigin = (((firstHorizontalTile * this.drawing.cellSize) - originX) * this.board.getZoom()) + (tilePixelSize / 2);
    var verticalPixelOrigin = (((firstVerticalTile * this.drawing.cellSize) - originY) * this.board.getZoom()) + (tilePixelSize / 2);

    var cursor = this.board.hovered_cell;

    this.context.save();
    this.board.identityTransform();
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
      if (this.shouldLabel(cur, cursor ? cursor[0] : null, labelStep)) {
        var txt = this.useXLetters ? this.numberToLetters(cur) : cur;
        this.drawLabel([labeled, 15], txt, (cursor && cur === cursor[0]));
      }
      labeled += tilePixelSize;
      cur += 1;
    }

    labeled = verticalPixelOrigin;
    cur = firstVerticalTile;

    while (labeled < pixelHeight) {
      if (this.shouldLabel(cur, cursor ? cursor[1] : null, labelStep)) {
        this.drawLabel([14, labeled], cur, (cursor && cur === cursor[1]));
      }
      labeled += tilePixelSize;
      cur += 1;
    }

    this.board.context.restore();
  }

  shouldLabel(index, highlightIndex, labelStep) {
    if (highlightIndex && Math.abs(highlightIndex - index) < labelStep) {
      return index === highlightIndex;
    }
    return ((index % labelStep) === 0);
  }

  drawLabel(point, text, highlight) {
    var image = this.labelCache.get(text);
    if (image == null) {
      image = new ViewPortLabel(text, this.labelWidth, this.labelHeight, this.board.drawingSettings);
      this.labelCache.set(text, image);
    }
    var width = image.width;
    var height = image.height;
    this.context.drawImage(image.getImage(highlight), point[0] - (width / 2), point[1] - (height / 2), width, height);
  }

  numberToLetters(value) {
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
}

class ViewPortLabel {
  constructor(label, width, height, drawingSettings) {
    this.label = label;
    this.canvas = null;
    this.highlightCanvas = null;
    this.context = null;
    this.drawing = null;
    this.drawingSettings = drawingSettings;
    this.width = width;
    this.height = height;
  }

  getImage(highlight) {
    var found = true;
    if (this.canvas === null) {
      this.canvas = document.createElement("canvas");
      this.canvas.width = this.width * 2;
      this.canvas.height = this.height * 2;
      this.context = this.canvas.getContext("2d");
      this.drawing = new Drawing(this.context, this.drawingSettings);
      this.drawing.drawText(this.label, [this.width, this.height], 40, "white", "black", 2);
      var raw = this.context.getImageData(0, 0, this.width, this.height);
      found = (raw.data.find(i => i !== 0) !== undefined);
    }

    if (highlight) {
      if (this.highlightCanvas === null ) {
        this.highlightCanvas = document.createElement("canvas");
        this.highlightCanvas.width = this.width * 2;
        this.highlightCanvas.height = this.height * 2;
        var hCtx = this.highlightCanvas.getContext("2d");

        hCtx.save();

        hCtx.fillStyle = 'white';
        hCtx.fillRect(0, 0, this.width * 2, this.height * 2);

        hCtx.drawImage(this.canvas, 0, 0);
        hCtx.globalCompositeOperation = 'destination-in';
        hCtx.drawImage(this.canvas, 0, 0);
        hCtx.globalCompositeOperation = 'difference';
        hCtx.drawImage(this.canvas, 0, 0);
        hCtx.restore();
      }

      return this.highlightCanvas;
    }

    if (!found) {
      var r = this.canvas;
      this.canvas = null;
      this.highlightCanvas = null;
      return r;
    }

    return this.canvas;
  }
}

class ViewPortLabelCache {
  constructor(cutoff, prune) {
    this.cache = new Map();
    this.cutoff = cutoff || 1024;
    this.pruneCount = prune || 512;
  }

  get(id) {
    var item = this.cache.get(id);
    if (item) {
      item.access = new Date();
      return item.value;
    } else {
      return null;
    }
  }

  set(id, value) {
    this.cache.set(id, {access: new Date(), id: id, value: value});
    this.prune();
  }

  prune() {
    if (this.cache.size > this.cutoff) {
      let values = [...this.cache.values()].sort((a, b) => b.access - a.access);
      values = values.slice(values.length - this.pruneCount, values.length);
      this.cache = new Map(values.map(v => [v.id, v]));
    }
  }
}

