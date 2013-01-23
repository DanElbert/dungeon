function Drawing(context) {
    this.context = context;
    this.cellHeight = 50;
    this.cellWidth = 50;

    this.

    this.drawGridLine = function(x1, y1, x2, y2) {

        this.context.beginPath();
        this.context.moveTo(x1, y1);
        this.context.lineTo(x2, y2);
        this.context.lineWidth = 1;
        this.context.strokeStyle = 'black';
        this.context.stroke();
    };

    this.drawGrid = function(rows, columns) {

        var width = this.gridWidth(columns);
        var height = this.gridHeight(rows);

        this.context.beginPath();
        this.context.lineWidth = 1;
        this.context.strokeStyle = 'black';

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

    this.gridWidth = function(columns) {
        return columns * this.cellWidth;
    }

    this.gridHeight = function(rows) {
        return rows * this.cellHeight;
    }
}