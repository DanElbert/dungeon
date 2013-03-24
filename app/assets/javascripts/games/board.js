function Board(canvas) {
  this.images = {};

  this.canvas = canvas;
  this.context = this.canvas.getContext('2d');
  this.drawing = new Drawing(this.context);
  this.event_manager = new BoardEvents(this);
  this.current_tool = null;

  this.pending_action_queue = [];
  this.drawing_actions = [];
  this.template_actions = [];
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

  this.sentMessageIds = [];
  this.gameServerClient = new Faye.Client(GAME_SERVER_URL);
  this.gameServerClient.addExtension(
      {
        outgoing: function(message, callback) {
          message['ext'] = message['ext'] || {};
          message['ext']['user_id'] = USER_ID;
          message['ext']['auth_token'] = USER_AUTH_TOKEN;
          callback(message);
        }
      });
  this.addActionSubscription = this.gameServerClient.subscribe('/game/' + GAME_ID + '/add_action', function(message) {
    self.handleAddActionMessage(message);
  });

  $(this.event_manager).on('mousemove', function(evt, mapEvt) {
    self.cellHover(mapEvt.mapPointCell[0], mapEvt.mapPointCell[1]);
  });

  this.setCanvasSize = function(width, height) {

    this.canvas.width = width;
    this.canvas.height = height;
    this.drawingCanvas.width = width;
    this.drawingCanvas.height = height;

    this.setZoom(this.zoom);
  };

  this.setZoom = function(val) {
    this.zoom = val;
    this.viewPortSize = [this.canvas.width / val, this.canvas.height / val];
    var newVpx = Math.min(this.width - this.viewPortSize[0], this.viewPortCoord[0]);
    var newVpy = Math.min(this.height - this.viewPortSize[1], this.viewPortCoord[1]);
    this.viewPortCoord = [Math.max(0, newVpx), Math.max(0, newVpy)];

    this.context.restore();
    this.drawingContext.restore();
    this.context.save();
    this.drawingContext.save();
    this.context.scale(this.zoom, this.zoom);
    this.drawingContext.scale(this.zoom, this.zoom);
    this.context.translate(-1 * this.viewPortCoord[0], -1 * this.viewPortCoord[1]);
    this.drawingContext.translate(-1 * this.viewPortCoord[0], -1 * this.viewPortCoord[1]);

    this.regenerateDrawing();
  };

  this.setTool = function(tool) {
    if (this.current_tool) {
      this.current_tool.disable();
    }
    this.current_tool = tool;
    this.current_tool.enable();
  };

  this.handleAddActionMessage = function(message) {
    var index = _.indexOf(this.sentMessageIds, message.uid)
    if (index >= 0) {
      this.sentMessageIds.splice(index, 1);
    } else {
      this.addAction(message, null, false);
    }
  };

  this.sendActionMessage = function(action) {
    this.sentMessageIds.push(action.uid);
    // Publish action, omitting any privateData
    this.gameServerClient.publish('/game/' + GAME_ID + '/add_action', _.omit(action, 'privateData'));
  };

  this.addAction = function(action, undoAction, broadcastAction) {
    action = attachActionMethods(action);
    this.pending_action_queue.push(action);

    if (broadcastAction) {
      this.sendActionMessage(action);
    }

    if (undoAction) {
      undoAction = attachActionMethods(undoAction);
      this.undo_stack.push(undoAction);
    }
  };

  this.undo = function() {
    if (this.undo_stack.length > 0) {
      var action = this.undo_stack.pop();
      this.addAction(action, null, true);
    }
  };

  this.refresh = function(data) {

    if (!data) {
      return;
    }

    this.board_data = data;
    this.drawing.cellSize = data.cell_size;
    this.drawingDrawing.cellSize = data.cell_size;
    this.rows = data.board_extents[1] + 1;
    this.columns = data.board_extents[0] + 1;
    this.width = this.drawing.gridWidth(this.columns);
    this.height = this.drawing.gridHeight(this.rows);

    _.each(data.drawing_actions, function(action) {
      this.addAction(action, null, false);
    }, this);

    _.each(data.template_actions, function(action) {
      this.addAction(action, null, false);
    }, this);

    // Ensure a current tool:
    if (!this.current_tool) {
      this.setTool(new Pointer(this));
    }

    this.prepareImages(data.board_images);
  };

  this.regenerateDrawing = function() {
    this.drawingContext.clearRect(this.viewPortCoord[0], this.viewPortCoord[1], this.viewPortSize[0], this.viewPortSize[1]);

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
    this.drawing.drawGrid(this.rows, this.columns, "rgba(0, 0, 0, 1.0)");
  };

  this.renderDrawing = function() {
    // The drawing layer is rendered with the same transforms as the viewport
    // So remove all currently set transforms with the identity matrix before
    // copying the drawing layer over

    this.context.save();
    this.context.setTransform(1, 0, 0, 1, 0, 0);
    this.context.drawImage(this.drawingCanvas, 0, 0);
    this.context.restore();
  };

  this.renderCursor = function() {
    if (this.hovered_cell) {
      this.drawing.colorCell(this.hovered_cell[0], this.hovered_cell[1], "rgba(0, 204, 0, 0.25)");
    }
  };

  this.renderTemplates = function() {
    var actions = this.template_actions;
    this.template_actions = [];
    _.each(actions, function(action) {
      action.apply(this);
    }, this);
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

    context.clearRect(this.viewPortCoord[0], this.viewPortCoord[1], this.viewPortSize[0], this.viewPortSize[1]);

    this.renderBoardBackground();
    this.renderTemplates();
    this.renderBoardGrid();
    this.renderDrawing();
    this.renderCursor();
    this.renderTool();
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
  this.shiftKey = false;
  this.altKey = false;
  this.ctrlKey = false;

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
    return Geometry.getCell([mapX, mapY], this.board.drawing.cellSize);
  };

  this.cursorDownHandler = function(canvasCoords) {
    //console.log("down");
    self.isLeftMouseDown = true;
    self.dragStart = self.getMapCoordinates(canvasCoords[0], canvasCoords[1]);
  };

  this.cursorMoveHandler = function(canvasCoords) {
    //console.log("move");
    var mapPoint = self.getMapCoordinates(canvasCoords[0], canvasCoords[1]);
    var cell = self.getCell(mapPoint[0], mapPoint[1]);

    if (self.isLeftMouseDown && !self.isDragging) {
      self.isDragging = true;
      jqThis.trigger('dragstart', {mapPoint: self.dragStart, mapPointCell: self.getCell(self.dragStart[0], self.dragStart[1]), mousePoint: canvasCoords});
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
    //console.log("up");
    // Ignore any mouse up events that didn't start with a mousedown on the canvas
    if (!self.isLeftMouseDown) {
      return;
    }

    if (self.isDragging) {
      var mapPoint = self.previousDrag;
      var cell = self.getCell(mapPoint[0], mapPoint[1]);

      jqThis.trigger('dragstop', {
        dragStart: self.dragStart,
        dragStartCell: self.getCell(self.dragStart[0], self.dragStart[1]),
        previousDrag: self.previousDrag ? self.previousDrag : self.dragStart,
        mapPoint: mapPoint,
        mapPointCell: cell
      });

    } else {
      var mapPoint = self.dragStart;
      var cell = self.getCell(mapPoint[0], mapPoint[1]);

      jqThis.trigger('click', {
        mapPoint: mapPoint,
        mapPointCell: cell
      });
    }

    self.dragStart = null;
    self.previousDrag = null;
    self.isDragging = false;
    self.isLeftMouseDown = false;
  };

  this.keyDownHandler = function(key) {
    jqThis.trigger('keydown', {
      key: key,
      isShift: self.shiftKey,
      isAlt: self.altKey,
      isCtrl: self.ctrlKey
    });
  };

  this.keyUpHandler = function(key) {
    jqThis.trigger('keyup', {
      key: key,
      isShift: self.shiftKey,
      isAlt: self.altKey,
      isCtrl: self.ctrlKey
    });
  };

  $(document).on('keydown.BoardEvents', function(evt) {
    // Process all keystrokes, but only those not obviously intended for something else
    var tag = evt.target.tagName.toLowerCase();
    if (tag == "input" || tag == "textarea") {
      return;
    }

    if (evt.which == 16) {
      self.shiftKey = true;
    } else if (evt.which == 17) {
      self.ctrlKey = true;
    } else if (evt.which == 18) {
      self.altKey = true;
    }

    self.keyDownHandler(evt.which);
  });

  $(document).on('keyup.BoardEvents', function(evt) {
    // Process all keystrokes, but only those not obviously intended for something else
    var tag = evt.target.tagName.toLowerCase();
    if (tag == "input" || tag == "textarea") {
      return;
    }

    if (evt.which == 16) {
      self.shiftKey = false;
    } else if (evt.which == 17) {
      self.ctrlKey = false;
    } else if (evt.which == 18) {
      self.altKey = false;
    }

    self.keyUpHandler(evt.which);
  });

  jqCanvas.on('mousedown.BoardEvents', function(evt) {
    if (evt.which == 1) { // left button
      var canvasCoords = self.getCanvasCoordinates(evt.pageX, evt.pageY);
      self.cursorDownHandler(canvasCoords);
    }
    evt.preventDefault();
  });

  jqCanvas.on('mouseup.BoardEvents', function(evt) {
    if (evt.which == 1) { // left button
      self.cursorUpHandler();
    }
    evt.preventDefault();
  });

  jqCanvas.on('mousemove.BoardEvents', function(evt) {
    var canvasCoords = self.getCanvasCoordinates(evt.pageX, evt.pageY);
    self.cursorMoveHandler(canvasCoords);
    evt.preventDefault();
  });

  jqCanvas.on('mouseout.BoardEvents', function(evt) {
    self.cursorUpHandler();
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