import { BaseDrawing } from "./BaseDrawing";
import { Geometry, Rectangle, Vector2 } from "../geometry";

class TokenDrawing extends BaseDrawing {
  constructor(uid, board, position, tokenCellSize, color, fontColor, fontSize, text, imageUrl, level) {
    super(uid, board, position, 1, 0, false, level);
    this.selectable = true;
    this.canInvalidateByBounds = false;
    this.color = color;
    this.tokenCellSize = tokenCellSize;
    this.fontColor = fontColor;
    this.fontSize = fontSize;
    this.text = text;
    this.imageUrl = imageUrl;
    this.loading = false;
    this.loadedImage = null;
    this.loadedImageUrl = null;
    this.loadedCellSize = null;

    this.imageCacheSizeFactor = 4;
  }

  containsPoint(point) {
    return this.bounds().containsPoint(new Vector2(point));
  }

  drawHighlight(drawing, offset) {
    const radius = (this.tokenCellSize * this.cellSize) / 2;
    const center = this.position.translate(radius, radius).add(offset);
    drawing.drawCircle(center.x, center.y, radius, 6 / drawing.drawingSettings.zoom, "white", null);
    drawing.drawCircle(center.x, center.y, radius, 1 / drawing.drawingSettings.zoom, "black", null);
  }

  clone(uid) {
    return new TokenDrawing(uid, this.board, this.position, this.tokenCellSize, this.color, this.fontColor, this.fontSize, this.text, this.imageUrl, this.level);
  }

  toAction(newUid) {
    return {
      version: 2,
      level: this.level,
      actionType: "addTokenAction",
      uid: newUid || this.uid,
      position: this.position.toArray(),
      tokenCellSize: this.tokenCellSize,
      color: this.color,
      fontColor: this.fontColor,
      fontSize: this.fontSize,
      text: this.text,
      imageUrl: this.imageUrl
    };
  }

  translate(x, y) {
    this.invalidateHandler(() => {
      this.position = this.position.translate(x, y);
    });
    return this;
  }

  calculateBounds() {
    const diameter = (this.tokenCellSize * this.cellSize);
    const offset = this.cellSize / 2;
    return new Rectangle(this.position, diameter, diameter);
  }

  clearDrawing() {
    super.clearDrawing();
  }

  executeDraw(drawing, drawBounds, level) {
    const cellPosition = Geometry.getCell(this.position.toArray(), this.cellSize);
    drawing.drawCircleTiles(cellPosition[0], cellPosition[1], this.tokenCellSize, this.tokenCellSize, this.color);
    //drawing.drawToken(cellPosition[0], cellPosition[1], this.tokenCellSize, this.tokenCellSize, this.color, this.text, this.fontColor, this.fontSize);

    if (this.imageUrl) {
      this.drawTokenImage(drawing);
    }

    const fontPoint = [cellPosition[0] * this.cellSize, cellPosition[1] * this.cellSize];
    fontPoint[0] += (this.tokenCellSize * this.cellSize) / 2;
    fontPoint[1] += (this.tokenCellSize * this.cellSize) / 2;
    drawing.drawText(this.text, fontPoint, this.fontSize, this.fontColor);
  }

  drawTokenImage(drawing) {
    if (this.loading === true) {
      return;
    }

    if ((this.loadedImageUrl !== null && this.loadedImageUrl !== this.imageUrl) || (this.loadedCellSize !== null && this.loadedCellSize !== this.tokenCellSize)) {
      this.loadedImage = null;
    }

    if (this.loadedImage === null) {
      this.loading = true;
      this.loadedImageUrl = this.imageUrl;
      this.loadedCellSize = this.tokenCellSize;
      drawing.imageCache.getImageAsync(this.imageUrl)
        .then(i => {
          this.loading = false;
          this.invalidate();

          const size = this.tokenCellSize * drawing.drawingSettings.cellSize * this.imageCacheSizeFactor;
          const sourceRectangle = new Rectangle(new Vector2(0, 0), i.width, i.height).centeredSquare();

          this.loadedImage = document.createElement("canvas");
          this.loadedImage.width = size;
          this.loadedImage.height = size;
          const ctx = this.loadedImage.getContext("2d");

          ctx.fillStyle = "#000000";
          ctx.beginPath();
          ctx.arc(size / 2, size / 2, (size / 2) - (2 * this.tokenCellSize), 0, 1.95 * Math.PI, false);
          ctx.closePath();
          ctx.fill();
          ctx.globalCompositeOperation = "source-in";

          ctx.drawImage(i, sourceRectangle.left(), sourceRectangle.top(), sourceRectangle.width(), sourceRectangle.height(), 0, 0, size, size);
        })
        .catch(e => {
          this.loading = false;
          this.invalidate();
          throw e;
        })
    }

    if (this.loadedImage !== null) {
      drawing.context.drawImage(this.loadedImage, this.position.x, this.position.y, this.loadedImage.width / this.imageCacheSizeFactor, this.loadedImage.height / this.imageCacheSizeFactor);
    }
  }
}


export {
  TokenDrawing
}