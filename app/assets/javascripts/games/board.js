function Board(canvas) {
  this.images = {};

  this.canvas = canvas;
  this.context = this.canvas.getContext('2d');
  this.drawing = new Drawing(this.context);
  this.event_manager = new BoardEvents(this);
  this.current_tool = null;

  this.pending_action_queue = [];
  this.drawing_actions = [];
  this.undo_stack = [];

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

  this.hovered_cell = null;

  // Used in events
  var self = this;

  $(this.event_manager).on('mousemove', function(evt, mapEvt) {
    self.cellHover(mapEvt.mapPointCell[0], mapEvt.mapPointCell[1]);
  });

  this.setZoom = function(val) {
    this.zoom = val;
    this.viewPortSize = [this.canvas.width / val, this.canvas.height / val];
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

  this.addAction = function(action, undoAction) {
    action = attachActionMethods(action);
    this.pending_action_queue.push(action);

    if (undoAction) {
      undoAction = attachActionMethods(undoAction);
      this.undo_stack.push(undoAction);
    }
  }

  this.undo = function() {
    if (this.undo_stack.length > 0) {
      var action = this.undo_stack.pop();
      this.addAction(action);
    }
  };

  this.refresh = function(data) {

    if (!data) {
      return;
    }

    this.board_data = data;
    this.drawing.cellHeight = data.cell_size;
    this.drawing.cellWidth = data.cell_size;
    this.drawingDrawing.cellHeight = data.cell_size;
    this.drawingDrawing.cellWidth = data.cell_size;
    this.rows = data.board_extents[1] + 1;
    this.columns = data.board_extents[0] + 1;
    this.width = this.drawing.gridWidth(this.columns);
    this.height = this.drawing.gridHeight(this.rows);

    // Generate drawing actions and add them to the list
    _.each(data.drawing_actions, function(drawingAction) {
      drawingAction = attachActionMethods(drawingAction);
      this.drawing_actions.push(drawingAction);
    }, this);

    this.regenerateDrawing();

    // Ensure a current tool:
    if (!this.current_tool) {
      this.setTool(new Pointer(this));
    }

    this.prepareImages(data.board_images);
  };

  this.regenerateDrawing = function() {
    this.drawingCanvas.height = this.height;
    this.drawingCanvas.width = this.width;

    // Drawing actions typically add themselves to the drawing_actions list, so clear it first
    var actions = this.drawing_actions;
    this.drawing_actions = [];

    _.each(actions, function(action) {
      action.apply(this);
    }, this);
  };

  this.renderBoardBackground = function() {
    var data = this.board_data;
    var drawing = this.drawing;

    drawing.colorBackground(this.columns, this.rows, "rgba(50, 50, 50, 1)");

    for (var x = 0; x < data.board_pieces.length; x++) {
      var p = data.board_pieces[x];
      drawing.drawTile(p.left, p.top, p.width, p.height, this.images[p.image]);
    }
  };

  this.renderBoardGrid = function() {
    this.drawing.drawGrid(this.rows, this.columns, "rgba(255, 255, 255, 0.5)");
  };

  this.renderDrawing = function() {
    this.context.drawImage(this.drawingCanvas, 0, 0);
  };

  this.renderTool = function() {
    if (this.current_tool) {
      this.current_tool.draw();
    }
  };

  this.executeActions = function() {
    _.each(this.pending_action_queue, function(action) {
      action = attachActionMethods(action);
      action.apply(this);
    }, this);

    this.pending_action_queue = [];
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

    this.width = drawing.gridWidth(this.columns);
    this.height = drawing.gridHeight(this.rows);

    this.executeActions();

    context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    context.save();
    context.scale(this.zoom, this.zoom);
    context.translate(-1 * this.viewPortCoord[0], -1 * this.viewPortCoord[1]);

    this.renderBoardBackground();
    this.renderDrawing();
    this.renderBoardGrid();
    this.renderTool();

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

  this.getMapCoordinates = function(canvasX, canvasY) {
    var x = canvasX;
    var y = canvasY;

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

  this.cursorDownHandler = function(canvasCoords) {
    self.isLeftMouseDown = true;
    self.dragStart = self.getMapCoordinates(canvasCoords[0], canvasCoords[1]);
  };

  this.cursorMoveHandler = function(canvasCoords) {
    var mapPoint = self.getMapCoordinates(canvasCoords[0], canvasCoords[1]);
    var cell = self.getCell(mapPoint[0], mapPoint[1]);

    if (self.isLeftMouseDown && !self.isDragging) {
      self.isDragging = true;
      jqThis.trigger('dragstart', {dragStart: self.dragStart, dragStartCell: self.getCell(self.dragStart[0], self.dragStart[1]), mousePoint: canvasCoords});
    }

    if (self.isDragging) {
      jqThis.trigger('drag', {
        dragStart: self.dragStart,
        dragStartCell: self.getCell(self.dragStart[0], self.dragStart[1]),
        previousDrag: self.previousDrag ? self.previousDrag : self.dragStart,
        mousePoint: canvasCoords,
        mapPoint: mapPoint,
        mapPointCell: cell});

      self.previousDrag = mapPoint;
    }

    jqThis.trigger('mousemove', {mapPoint: mapPoint, mapPointCell: cell, mousePoint: canvasCoords});
  };

  this.cursorUpHandler = function() {

    if (!self.isDragging) {
      return;
    }

    var mapPoint = self.previousDrag;
    var cell = self.getCell(mapPoint[0], mapPoint[1]);

    self.isLeftMouseDown = false;
    self.isDragging = false;

    jqThis.trigger('dragstop', {
      dragStart: self.dragStart,
      dragStartCell: self.getCell(self.dragStart[0], self.dragStart[1]),
      previousDrag: self.previousDrag ? self.previousDrag : self.dragStart,
      mapPoint: mapPoint,
      mapPointCell: cell});

    self.dragStart = null;
    self.previousDrag = null;
  };

  jqCanvas.on('mousedown.BoardEvents', function(evt) {
    if (evt.which == 1) { // left button
      var canvasCoords = self.getCanvasCoordinates(evt.pageX, evt.pageY);
      self.cursorDownHandler(canvasCoords);
    }
    evt.stopPropagation();
  });

  jqCanvas.on('mouseup.BoardEvents', function(evt) {
    if (evt.which == 1) { // left button
      var canvasCoords = self.getCanvasCoordinates(evt.pageX, evt.pageY);
      self.cursorUpHandler(canvasCoords);
    }
    evt.stopPropagation();
  });

  jqCanvas.on('mousemove.BoardEvents', function(evt) {
    var canvasCoords = self.getCanvasCoordinates(evt.pageX, evt.pageY);
    self.cursorMoveHandler(canvasCoords);
    evt.stopPropagation();
  });

  jqCanvas.on('touchstart.BoardEvents', function(evt) {
    var nEvt = evt.originalEvent;
    if (nEvt.targetTouches.length == 1) {
      var touch = nEvt.targetTouches[0];
      var canvasCoords = self.getCanvasCoordinates(touch.pageX, touch.pageY);
      self.cursorDownHandler(canvasCoords);
    }
    //evt.stopPropagation();
  });

  jqCanvas.on('touchend.BoardEvents', function(evt) {
    self.cursorUpHandler();
    //evt.stopPropagation();
  });

  jqCanvas.on('touchmove.BoardEvents', function(evt) {
    var nEvt = evt.originalEvent;
    if (nEvt.targetTouches.length == 1) {
      var touch = nEvt.targetTouches[0];
      var canvasCoords = self.getCanvasCoordinates(touch.pageX, touch.pageY);
      self.cursorMoveHandler(canvasCoords);
    }
    //evt.stopPropagation();
  });
}