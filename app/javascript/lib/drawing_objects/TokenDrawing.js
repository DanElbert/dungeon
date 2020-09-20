import { BaseDrawing } from "./BaseDrawing";
import { Geometry, Rectangle, Vector2 } from "../geometry";

let stackOrderNumber = 0;

function getNextStackOrder() {
  return stackOrderNumber++;
}

class TokenDrawing extends BaseDrawing {
  constructor(uid, board, position, tokenCellSize, color, fontColor, fontSize, text, imageUrl, totalHp, currentHp, icons, level) {
    super(uid, board, position, 1, 0, false, level);
    this.selectable = true;
    this.canInvalidateByBounds = false;
    this.color = color;
    this.tokenCellSize = tokenCellSize;
    this.fontColor = fontColor;
    this.fontSize = fontSize;
    this.text = text;
    this.imageUrl = imageUrl;
    this.totalHp = totalHp;
    this.currentHp = currentHp;
    this.icons = icons;
    this.loading = false;
    this.loadedImage = null;
    this.loadedImageUrl = null;
    this.loadedCellSize = null;
    this.imageCacheSizeFactor = 2;
    this.touch()
  }

  touch() {
    this.sort = getNextStackOrder();
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
    return new TokenDrawing(uid, this.board, this.position, this.tokenCellSize, this.color, this.fontColor, this.fontSize, this.text, this.imageUrl, this.totalHp, this.currentHp, this.icons, this.level);
  }

  toAction(newUid) {
    return {
      version: 3,
      actionType: "addTokenAction",
      uid: newUid || this.uid,
      position: this.position.toArray(),
      tokenCellSize: this.tokenCellSize,
      color: this.color,
      fontColor: this.fontColor,
      fontSize: this.fontSize,
      text: this.text,
      imageUrl: this.imageUrl,
      totalHp: this.totalHp,
      currentHp: this.currentHp,
      icons: this.icons,
      level: this.level
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

  draw(drawing, otherLocationTokens) {
    this.otherLocationTokens = otherLocationTokens;
    super.draw(drawing);
  }

  executeDraw(drawing, drawBounds, detailLevel) {

    let topLeft = this.position;
    let size = this.tokenCellSize * this.cellSize;

    const tokensInStack = this.otherLocationTokens.filter(t => t.tokenCellSize === this.tokenCellSize);
    if (tokensInStack.length > 0) {
      let stackIndex = tokensInStack.findIndex(t => t.sort > this.sort);
      if (stackIndex === -1) { stackIndex = tokensInStack.length; }

      const stackSize = tokensInStack.length + 1;
      const stackOffset = stackIndex * (15 / (stackSize - 1));
      size = size - 15;
      topLeft = topLeft.translate(stackOffset, stackOffset);
    }

    drawing.drawFilledEllipse(topLeft.x, topLeft.y, size, size, this.color);

    if (this.imageUrl) {
      this.drawTokenImage(drawing, topLeft, size);
    }

    const fontPoint = [topLeft.x, topLeft.y];
    fontPoint[0] += size / 2;
    fontPoint[1] += size / 2;
    drawing.drawText(this.text, fontPoint, this.fontSize, this.fontColor);

  }

  drawTokenImage(drawing, topLeft, tokenSize) {
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
          ctx.arc(size / 2, size / 2, (size / 2) - (3 * this.tokenCellSize), 0, 1.95 * Math.PI, false);
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
      drawing.context.drawImage(this.loadedImage, topLeft.x, topLeft.y, tokenSize, tokenSize);
    }

    if (this.currentHp !== 0) {
      if (this.board.isOwner) {
        // draw sweet hp counter
      } else {
        // draw sweet HP indicator
      }
    }

    for (let idx = 0; idx < this.icons.length; x++) {
      const icon = this.icons[idx];
      const iconOffset = idx * 10;
      // draw sweet icon
    }
  }
}


export {
  TokenDrawing
}