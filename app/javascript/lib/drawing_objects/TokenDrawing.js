import { BaseDrawing } from "./BaseDrawing";
import { hexToRgb } from "../ColorUtil";
import { Geometry, Rectangle, Vector2 } from "../geometry";
import TokenIcons from "../TokenIcons";

let stackOrderNumber = 0;
const iconCache = new Map();
const iconSize = 18;

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
    this.icons = icons || [];
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

  setCurrentHp(newHp) {
    this.invalidateHandler(() => {
      this.currentHp = newHp;
    });
    return this;
  }

  setIcons(newIcons) {
    this.invalidateHandler(() => {
      this.icons = newIcons;
    });
    return this;
  }

  draw(drawing, otherLocationTokens) {
    this.otherLocationTokens = otherLocationTokens;
    super.draw(drawing);
  }

  calculateHpStatus() {
    const ratio = Math.floor((this.currentHp * 100) / this.totalHp);
    let status = "unfazed";
    if (ratio < 50) {
      status = "bloodied";
    }
    if (ratio < 10) {
      status = "critical";
    }
    if (this.currentHp === 0) {
      status = "dead";
    }
    return status;
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

    if (this.totalHp !== 0) {
      const status = this.calculateHpStatus();

      this.drawStatusTransparency(drawing, topLeft.translate(size / 2, size / 2), size, status);

      if (this.board.isOwner) {
        drawing.drawLabel([topLeft.x + size / 2, topLeft.y + size - 6], `${this.currentHp}/${this.totalHp}`, null, null, null, 12)
        //drawing.drawText(`${this.currentHp}/${this.totalHp}`, [topLeft.x + size / 2, topLeft.y + size], 13, 'black', null, null, null, 'baseline');
      }
    }

    const maxIconCols = Math.floor(size / iconSize);
    const iconRows = Math.ceil(this.icons.length / maxIconCols);
    for (let idx = 0; idx < this.icons.length; idx++) {
      const iconName = this.icons[idx];

      const rowIdx = Math.floor(idx / maxIconCols);
      const iconCols = rowIdx + 1 === iconRows ? (this.icons.length - (rowIdx * maxIconCols)) : maxIconCols;
      const colIdx = idx >= maxIconCols ? idx - (rowIdx * maxIconCols) : idx;

      const centerOffset = (size - (iconCols * iconSize)) / 2;

      const tl = topLeft.translate((colIdx * iconSize) + centerOffset, rowIdx * iconSize);
      this.drawIcon(drawing, tl, iconName);
    }
  }

  drawIcon(drawing, topLeft, iconName) {
    if (!iconCache.has(iconName)) {
      iconCache.set(iconName, false);
      const icon = TokenIcons.getIcon(iconName);
      this.board.imageCache.getImageAsync(icon.faIcon)
        .then(img => {
          this.invalidate();

          const size = iconSize * this.imageCacheSizeFactor;
          const margin = new Vector2(4, 4);

          const iconImg = document.createElement("canvas");
          iconImg.width = size;
          iconImg.height = size;
          const ctx = iconImg.getContext("2d");

          const imgRatio = img.width / img.height;
          if (imgRatio > 1) {
            margin.y = margin.y + ((size - (size / imgRatio)) / 2);
          } else if (imgRatio < 1) {
            margin.x = margin.x + ((size - (size * imgRatio)) / 2);
          }

          ctx.drawImage(img, 0, 0, img.width, img.height, margin.x, margin.y, (size - (margin.x * 2)), size - (margin.y * 2));
          ctx.globalCompositeOperation = "source-in";
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(size, 0);
          ctx.lineTo(size, size);
          ctx.lineTo(0, size);
          ctx.closePath();
          ctx.fillStyle = icon.color;
          ctx.fill();

          ctx.globalCompositeOperation = "destination-over";
          ctx.beginPath();
          ctx.arc(size / 2, size / 2, size / 2, 0, 1.95 * Math.PI, false);
          ctx.closePath();
          ctx.fillStyle = "white";
          ctx.fill();


          iconCache.set(iconName, iconImg);
        })
        .catch(err => {
          throw err;
        });
    }

    const iconImage = iconCache.get(iconName);
    if (iconImage) {
      drawing.context.drawImage(iconImage, 0, 0, iconImage.width, iconImage.height, topLeft.x, topLeft.y, iconSize, iconSize);
    }
  }

  drawStatusTransparency(drawing, center, size, status) {
    let borderWidth, color, gradientStops;

    const bloodColorRgb = hexToRgb("#EE204D");
    const deadColorRgb = { r: 0, g: 10, b: 25 };

    if (status === "bloodied") {
      borderWidth = size / 5;
      color = bloodColorRgb;
      gradientStops = {
        0: 0,
        50: 0.5,
        65: 0.7,
        75: 0.9,
        100: 1
      }
    } else if (status === "critical") {
      borderWidth = size / 2;
      color = bloodColorRgb;
      gradientStops = {
        0: 0,
        50: 0.5,
        75: 0.99,
        100: 1
      }
    } else if (status === "dead") {
      borderWidth = size / 2;
      color = deadColorRgb;
      gradientStops = {
        0: 0,
        100: 1
      }
    } else {
      return;
    }

    const gradient = drawing.context.createRadialGradient(center.x, center.y, (size / 2) - borderWidth, center.x, center.y, size / 2);
    for (let stop in gradientStops) {
      gradient.addColorStop(stop / 100.0, `rgba(${color.r},${color.g},${color.b},${gradientStops[stop]}`);
    }
    drawing.drawCircle(center.x, center.y, (size / 2) - (borderWidth / 2), borderWidth, gradient);
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
  }
}


export {
  TokenDrawing
}