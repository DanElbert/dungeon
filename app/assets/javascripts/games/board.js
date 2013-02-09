function Board(canvas) {
    this.images = {};

    this.canvas = canvas;
    this.context = this.canvas.getContext('2d');
    this.drawing = new Drawing(this.context);

    this.board_data = null;
    this.rows = 0;
    this.columns = 0;
    this.height = 0;
    this.width = 0;
    this.viewPortCoord = [0, 0];
    this.viewPortSize = [canvas.width, canvas.height];
    this.zoom = 1;

    this.hovered_cell = null;

    this.dragging = false;
    this.dragOrigin = null;


    // Used in events
    var self = this;

    $(this.canvas).mousemove(function(eventObject) {
        var $this = $(this);
        var offset = $this.offset();
        var x = eventObject.pageX - offset.left;
        var y = eventObject.pageY - offset.top;

        var tileX = Math.floor((x + (self.viewPortCoord[0] * self.zoom)) / (self.drawing.cellWidth * self.zoom));
        var tileY = Math.floor((y + (self.viewPortCoord[1] * self.zoom)) / (self.drawing.cellHeight * self.zoom));

        self.cellHover(tileX, tileY);

        if (this.dragging) {
            
        }
    });

    $(this.canvas).mousedown(function(eventObject) {
        this.dragging = true;
    });

    this.setZoom = function(val) {
        this.zoom = val;
        this.viewPortSize = [this.canvas.width * val, this.canvas.height * val];
        var newVpx = Math.min(this.width - this.viewPortSize[0], this.viewPortCoord[0]);
        var newVpy = Math.min(this.height - this.viewPortSize[1], this.viewPortCoord[1]);
        this.viewPortCoord = [Math.max(0, newVpx), Math.max(0, newVpy)];
    };

    this.refresh = function(data) {

        if (!data) {
            return;
        }

        this.board_data = data;
        var self = this;

        this.prepareImages(data.board_images, function(args) { self.update(); });
    };

    this.renderBoardBackground = function() {
        var data = this.board_data;
        var drawing = this.drawing;

        drawing.colorBackground(this.columns, this.rows, "black");

        for (var x = 0; x < data.board_pieces.length; x++) {
            var p = data.board_pieces[x];
            drawing.drawTile(p.left, p.top, p.width, p.height, this.images[p.image]);
        }
    };

    this.renderBoardGrid = function() {
        this.drawing.drawGrid(this.rows, this.columns);
    };

    this.update = function() {
        var context = this.context;
        var drawing = this.drawing;
        var data = this.board_data;

        this.rows = data.board_extents[1];
        this.columns = data.board_extents[0];

        this.width = drawing.gridWidth(this.columns) * this.zoom;
        this.height = drawing.gridHeight(this.rows) * this.zoom;

        context.save();
        context.translate(-1 * this.viewPortCoord[0], -1 * this.viewPortCoord[1]);
        context.scale(this.zoom, this.zoom);

        drawing.clear(this.columns, this.rows);

        this.renderBoardBackground();

        if (this.hovered_cell) {
            this.drawing.colorCell(this.hovered_cell[0], this.hovered_cell[1], "rgba(0, 204, 0, 0.75)");
        }

        context.restore();
    };

    this.cellHover = function(x, y) {
        if (this.hovered_cell && this.hovered_cell[0] == x && this.hovered_cell[1] == y)
            return;

        this.hovered_cell = [x, y];

//        this.context.save();
//        this.context.scale(this.zoom, this.zoom);
//
//        this.drawing.colorCell(x, y, "rgba(0, 204, 0, 0.75)");
//
//        if (this.hovered_cell) {
//            this.drawing.drawCellsFromCanvas(this.hovered_cell[0], this.hovered_cell[1], 1, 1, this.boardCanvas);
//        }
//
//        this.hovered_cell = [x, y];
//
//        this.context.restore();
    };

    this.boardPieceAt = function(x, y) {
        var data = this.board_data;
        for (var i = 0; x < data.board_pieces.length; i++) {
            var p = data.board_pieces[i];
            if (p.left <= x && p.right >= x && p.top <= y && p.bottom >= y) {
                return p;
            }
        }
        return null;
    };

    this.prepareImages = function(imgs, callback) {
        "use strict";
        var loaded = 0;
        var images = [];
        imgs = Object.prototype.toString.apply( imgs ) === '[object Array]' ? imgs : [imgs];
        var inc = function() {
            loaded += 1;
            if ( loaded === imgs.length && callback ) {
                callback( images );
            }
        };
        for ( var i = 0; i < imgs.length; i++ ) {
            if (!this.images[imgs[i]]) {
                images[i] = new Image();
                this.images[imgs[i]] = images[i];
                images[i].onabort = inc;
                images[i].onerror = inc;
                images[i].onload = inc;
                images[i].src = ROOT_URL + "assets/" + imgs[i];
            }
        }
    };
};

function BoardEvents(board) {

}