function Board(canvas) {
    this.canvas = canvas;
    this.rows = 0;
    this.columns = 0;
    this.height = 0;
    this.width = 0;
    this.zoom = 1;

    this.draw = function(data) {

        var context = this.canvas.getContext('2d');
        var drawing = new Drawing(context);

        this.rows = data[0].length;
        this.columns = data.length;
        this.width = drawing.gridWidth(this.columns) * this.zoom;
        this.height = drawing.gridHeight(this.rows) * this.zoom;

        this.canvas.width = this.width + 1;
        this.canvas.height = this.height + 1;

        context.save();
        context.scale(this.zoom, this.zoom);

        drawing.drawGrid(this.rows, this.columns);

        // Fill each space
        for (var x = 0; x < this.columns; x++) {
            for (var y = 0; y < this.rows; y++) {

                var color = "white";

                if (data[x][y] == "board") {
                    color = '#a9a9a9';
                }

                drawing.colorCell(x, y, color);
            }
        }

        context.restore();
    };
};