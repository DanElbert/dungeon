function Board(canvas) {
  this.images = {};

  this.canvas = canvas;
  this.context = this.canvas.getContext('2d');
  this.drawing = new Drawing(this.context);
  this.event_manager = new BoardEvents(this);
  this.current_tool = null;
  this.drawing_queue = [];
  this.drawn_list = [];

  this.drawingCanvas = document.createElement("canvas");
  this.drawingContext = this.drawingCanvas.getContext('2d');
  this.drawingDrawing = new Drawing(this.drawingContext);

  this.board_data = null;
  this.rows = 0;
  this.columns = 0;
  this.height = 0;
  this.width = 0;
  this.viewPortCoord = [0, 0];
  this.viewPortSize = [canvas.width, canvas.height];
  this.zoom = 1;
  this.drawing_version = null;
  this.drawing_image = null;

  this.hovered_cell = null;

  // Used in events
  var self = this;

  $(this.event_manager).on('mousemove', function(evt, mapEvt) {
    self.cellHover(mapEvt.mapPointCell[0], mapEvt.mapPointCell[1]);
  });

  this.setZoom = function(val) {
    this.zoom = val;
    this.viewPortSize = [this.canvas.width * val, this.canvas.height * val];
    this.width = this.drawing.gridWidth(this.columns) * val;
    this.height = this.drawing.gridHeight(this.rows) * val;
    var newVpx = Math.min(this.width - this.viewPortSize[0], this.viewPortCoord[0]);
    var newVpy = Math.min(this.height - this.viewPortSize[1], this.viewPortCoord[1]);
    this.viewPortCoord = [Math.max(0, newVpx), Math.max(0, newVpy)];
  };

  this.setTool = function(tool) {
    if (this.current_tool) {
      this.current_tool.disable();
    }
    this.current_tool = tool;
    this.current_tool.enable();
  };

  this.refresh = function(data) {

    if (!data) {
      return;
    }

    this.board_data = data;
    this.drawing.cellHeight = data.cell_size;
    this.drawing.cellWidth = data.cell_size;

    if (data.drawing_version != this.drawing_version) {
      this.drawing_image = document.createElement("img");
      var self = this;
      this.drawing_image.drawing_version = data.drawing_version;
      $(this.drawing_image).load(function() {
        self.drawing_version = this.drawing_version;
        self.drawingCanvas.width = self.canvas.width;
        self.drawingCanvas.height = self.canvas.height;
        self.drawingContext.drawImage(this, 0, 0);
        self.renderDrawActions(self.drawn_list, self.drawingDrawing);
      });
      this.drawing_image.src = BOARD_DRAWING_URL + "/" + data.drawing_version;
    } else if (this.drawn_list.length > 0) {
      var image_data = this.drawingCanvas.toDataURL();
      var post_data = {drawing_version: this.drawing_version, drawing_data: image_data};

      $.post(BOARD_DRAWING_URL, post_data, function(data, status, xhr) {
        if (data.success) {
          self.drawn_list = [];
          self.drawing_version = data.version;
        }
      });
    }

    var self = this;

    // Ensure a current tool:
    if (!this.current_tool) {
      this.setTool(new Pointer(this));
    }

    this.prepareImages(data.board_images);
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
    this.drawing.drawGrid(this.rows, this.columns, "rgba(255, 255, 255, 0.5)");
  };

  this.renderDrawing = function() {
    this.renderDrawActions(this.drawing_queue, this.drawingDrawing);
    for (var x = 0; x < this.drawing_queue.length; x++) {
      this.drawn_list.push(this.drawing_queue[x]);
    }
    this.drawing_queue = [];

    this.context.drawImage(this.drawingCanvas, 0, 0);
  };

  this.renderDrawActions = function(actions, drawing) {
    for (var x = 0; x < actions.length; x++) {
      var action = actions[x];
      var y = x + 1;
      while (y < actions.length && this.isActionSimilar(action, actions[y])) {
        y++;
      }

      switch (action.type) {
        case "line":
          var starts = [];
          var ends = [];
          for (var i = x; i < y; i++) {
            var a = actions[i];
            starts.push(a.start);
            ends.push(a.end);
          }
          drawing.drawLines(starts, ends, action.width, action.color);
          break;
      }

      x = y - 1;
    }
  };

  this.isActionSimilar = function(a1, a2) {
    if (a1.type == a2.type) {
      switch (a1.type) {
        case "line":
          return a1.color == a2.color && a1.width == a2.width;
      }
    }
  };

  this.update = function() {

    if (!this.board_data) {
      return;
    }

    var context = this.context;
    var drawing = this.drawing;
    var data = this.board_data;

    this.rows = data.board_extents[1] + 1;
    this.columns = data.board_extents[0] + 1;

    this.width = drawing.gridWidth(this.columns) * this.zoom;
    this.height = drawing.gridHeight(this.rows) * this.zoom;

    context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    context.save();
    context.scale(this.zoom, this.zoom);
    context.translate(-1 * this.viewPortCoord[0], -1 * this.viewPortCoord[1]);

    this.renderBoardBackground();
    this.renderDrawing();
    this.renderBoardGrid();

    if (this.hovered_cell) {
      this.drawing.colorCell(this.hovered_cell[0], this.hovered_cell[1], "rgba(0, 204, 0, 0.25)");
    }

    context.restore();
  };

  this.cellHover = function(x, y) {
    this.hovered_cell = [x, y];
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

// Wraps canvas events and generates map-friendly events.
// Raises the following events:
// dragStart
// drag
// dragStop
// mouseMove
// click
// Each event has a custom event object with the following properties (as appropriate):
// dragStart, dragStartCell, previousDrag, mapPoint, mapPointCell, mousePoint
function BoardEvents(board) {
  this.board = board;

  var jqThis = $(this);
  var jqCanvas = $(board.canvas);

  this.isLeftMouseDown = false;
  this.isDragging = false;
  this.dragStart = null;
  this.previousDrag = null;

  var self = this;

  this.getCanvasCoordinates = function(mouseX, mouseY) {
    // x, y coords of mouse click relative to canvas
    var offset = $(this.board.canvas).offset();
    var x = mouseX - offset.left;
    var y = mouseY - offset.top;

    return [x, y];
  };

  this.getMapCoordinates = function(mouseX, mouseY) {
    var canvasPoint = this.getCanvasCoordinates(mouseX, mouseY);
    var x = canvasPoint[0];
    var y = canvasPoint[1];

    // scale to current zoom
    x = x / this.board.zoom;
    y = y / this.board.zoom;

    // Translate to current viewport
    x = x + this.board.viewPortCoord[0];
    y = y + this.board.viewPortCoord[1];

    return [x, y];
  };

  this.getCell = function(mapX, mapY) {
    var x = Math.floor(mapX / (this.board.drawing.cellWidth));
    var y = Math.floor(mapY / (this.board.drawing.cellHeight));

    return [x, y];
  };

  jqCanvas.on('mousedown.BoardEvents', function(evt) {
    if (evt.which == 1) { // left button
      self.isLeftMouseDown = true;
      self.dragStart = self.getMapCoordinates(evt.pageX, evt.pageY);
    }
    evt.stopPropagation();
  });

  jqCanvas.on('mouseup.BoardEvents', function(evt) {
    if (evt.which == 1) { // left button
      var mapPoint = self.getMapCoordinates(evt.pageX, evt.pageY);
      var cell = self.getCell(mapPoint[0], mapPoint[1]);
      var mouse = self.getCanvasCoordinates(evt.pageX, evt.pageY);

      self.isLeftMouseDown = false;
      self.isDragging = false;

      jqThis.trigger('dragstop', {
        dragStart: self.dragStart,
        dragStartCell: self.getCell(self.dragStart[0], self.dragStart[1]),
        previousDrag: self.previousDrag ? self.previousDrag : self.dragStart,
        mousePoint: mouse,
        mapPoint: mapPoint,
        mapPointCell: cell});

      self.dragStart = null;
      self.previousDrag = null;
    }
    evt.stopPropagation();
  });

  jqCanvas.on('mousemove.BoardEvents', function(evt) {
    var mapPoint = self.getMapCoordinates(evt.pageX, evt.pageY);
    var cell = self.getCell(mapPoint[0], mapPoint[1]);
    var mouse = self.getCanvasCoordinates(evt.pageX, evt.pageY);

    if (self.isLeftMouseDown && !self.isDragging) {
      self.isDragging = true;
      jqThis.trigger('dragstart', {dragStart: self.dragStart, dragStartCell: self.getCell(self.dragStart[0], self.dragStart[1]), mousePoint: mouse});
    }

    if (self.isDragging) {
      jqThis.trigger('drag', {
        dragStart: self.dragStart,
        dragStartCell: self.getCell(self.dragStart[0], self.dragStart[1]),
        previousDrag: self.previousDrag ? self.previousDrag : self.dragStart,
        mousePoint: mouse,
        mapPoint: mapPoint,
        mapPointCell: cell});

      self.previousDrag = mapPoint;
    }

    jqThis.trigger('mousemove', {mapPoint: mapPoint, mapPointCell: cell, mousePoint: mouse});
    evt.stopPropagation();
  });
}