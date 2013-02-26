function Drawing(context) {
    this.context = context;
    this.cellHeight = 50;
    this.cellWidth = 50;

    this.clear = function(columns, rows) {
        this.context.clearRect(0, 0, columns * this.cellWidth, rows * this.cellHeight);
    };

    this.clearCell = function(column, row) {
      this.context.clearRect(this.cellWidth * column, this.cellHeight * row, this.cellWidth, this.cellHeight);
    };

    this.drawCellsFromCanvas = function(x, y, width, height, otherCanvas) {
      this.context.drawImage(otherCanvas,
        x * this.cellWidth,
        y * this.cellHeight,
        width * this.cellWidth,
        height * this.cellHeight,
        x * this.cellWidth,
        y * this.cellHeight,
        width * this.cellWidth,
        height * this.cellHeight);
    };

    this.drawLines = function(startCoordList, endCoordList, width, color) {
      this.context.beginPath();
      this.context.lineWidth = width;
      this.context.strokeStyle = color;
      this.context.lineCap = 'round';

      for (var x = 0; x < startCoordList.length; x++) {
        this.context.moveTo(startCoordList[x][0], startCoordList[x][1]);
        this.context.lineTo(endCoordList[x][0], endCoordList[x][1]);
      }

      this.context.stroke();
    };

    this.drawTile = function(x, y, width, height, imageObj) {
        var imgWidth = imageObj.width;
        var imgHeight = imageObj.height;

        if (imgWidth == 0 || imgHeight == 0) {
            return;
        }

        var boxWidth = width * this.cellWidth;
        var boxHeight = height * this.cellHeight;

        var imgColumns = Math.ceil(boxWidth / imgWidth);
        var imgRows = Math.ceil(boxHeight / imgHeight);

        for (var column = 0; column < imgColumns; column++) {
            for (var row = 0; row < imgRows; row++) {
                var rightClip = Math.min(imgWidth, boxWidth - (column * imgWidth));
                var bottomClip = Math.min(imgHeight, boxHeight - (row * imgHeight));

                var xPos = (x * this.cellWidth) + (column * imgWidth);
                var yPos = (y * this.cellHeight) + (row * imgHeight);

                this.context.drawImage(imageObj, 0, 0, rightClip, bottomClip, xPos, yPos, rightClip, bottomClip);
            }
        }

    }

    this.drawGrid = function(rows, columns, color) {

        var width = this.gridWidth(columns);
        var height = this.gridHeight(rows);

        this.context.beginPath();
        this.context.lineWidth = 1;
        this.context.strokeStyle = color;

        // Draw horizontal grid lines
        for (var x = 0; x <= rows; x++) {

            var x1 = 0.5;
            var y1 = (this.cellHeight * x) + 0.5;
            var x2 = width + 0.5;
            var y2 = (this.cellHeight * x) + 0.5;

            this.context.moveTo(x1, y1);
            this.context.lineTo(x2, y2);
        }

        // Draw vertical grid lines
        for (var x = 0; x <= columns; x++) {

            var x1 = (this.cellWidth * x) + 0.5;
            var y1 = 0.5;
            var x2 = (this.cellWidth * x) + 0.5;
            var y2 = height + 0.5;

            this.context.moveTo(x1, y1);
            this.context.lineTo(x2, y2);
        }

        this.context.stroke();
    };

    this.colorCell = function(column, row, color) {

        var left = (column * this.cellWidth) + 1;
        var top = (row * this.cellHeight) + 1;
        var width = this.cellWidth - 1;
        var height = this.cellHeight - 1;

        this.context.beginPath();
        this.context.rect(left, top, width, height);
        this.context.fillStyle = color;
        this.context.fill();
    };

    this.colorBackground = function(columns, rows, color) {
        this.context.beginPath();
        this.context.rect(0, 0, columns * this.cellWidth, rows * this.cellHeight);
        this.context.fillStyle = color;
        this.context.fill();
    }

    this.gridWidth = function(columns) {
        return columns * this.cellWidth;
    }

    this.gridHeight = function(rows) {
        return rows * this.cellHeight;
    }
}