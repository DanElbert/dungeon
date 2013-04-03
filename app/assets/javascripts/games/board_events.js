
// Wraps canvas events and generates map-friendly events.
// Each event has a custom event object with the following properties (as appropriate):
// dragStart, dragStartCell, previousDrag, mapPoint, mapPointCell, mousePoint
function BoardEvents(board) {
  this.board = board;

  var jqThis = $(this);
  var jqCanvas = $(board.canvas);

  this.leftMouseState = {
    down: false,
    dragging: false,
    dragStart: null,
    previousDrag: null,
    eventPrefix: ''
  };

  this.rightMouseState = {
    down: false,
    dragging: false,
    dragStart: null,
    previousDrag: null,
    eventPrefix: 'right'
  };

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

  this.cursorDownHandler = function(canvasCoords, mouseState) {
    mouseState.down = true;
    mouseState.dragStart = self.getMapCoordinates(canvasCoords[0], canvasCoords[1]);
  };

  this.cursorMoveHandler = function(canvasCoords, mouseState) {
    var mapPoint = self.getMapCoordinates(canvasCoords[0], canvasCoords[1]);
    var cell = self.getCell(mapPoint[0], mapPoint[1]);

    if(mouseState.down && !mouseState.dragging) {
      mouseState.dragging = true;
      jqThis.trigger(mouseState.eventPrefix + 'dragstart', {mapPoint: mouseState.dragStart, mapPointCell: self.getCell(mouseState.dragStart[0], mouseState.dragStart[1]), mousePoint: canvasCoords});
    }

    if (mouseState.dragging) {
      jqThis.trigger(mouseState.eventPrefix + 'drag', {
        dragStart: mouseState.dragStart,
        dragStartCell: self.getCell(mouseState.dragStart[0], mouseState.dragStart[1]),
        previousDrag: mouseState.previousDrag ? mouseState.previousDrag : mouseState.dragStart,
        mousePoint: canvasCoords,
        mapPoint: mapPoint,
        mapPointCell: cell});

      mouseState.previousDrag = mapPoint;
    }

    jqThis.trigger(mouseState.eventPrefix + 'mousemove', {mapPoint: mapPoint, mapPointCell: cell, mousePoint: canvasCoords});
  };

  this.cursorUpHandler = function(mouseState) {
    // Ignore any mouse up events that didn't start with a mousedown on the canvas
    if (!mouseState.down) {
      return;
    }

    var mapPoint, cell;

    if (mouseState.dragging) {
      mapPoint = mouseState.previousDrag;
      cell = self.getCell(mapPoint[0], mapPoint[1]);

      jqThis.trigger(mouseState.eventPrefix + 'dragstop', {
        dragStart: mouseState.dragStart,
        dragStartCell: self.getCell(mouseState.dragStart[0], mouseState.dragStart[1]),
        previousDrag: mouseState.previousDrag ? mouseState.previousDrag : mouseState.dragStart,
        mapPoint: mapPoint,
        mapPointCell: cell
      });

    } else {
      mapPoint = mouseState.dragStart;
      cell = self.getCell(mapPoint[0], mapPoint[1]);

      jqThis.trigger(mouseState.eventPrefix + 'click', {
        mapPoint: mapPoint,
        mapPointCell: cell
      });
    }

    mouseState.dragStart = null;
    mouseState.previousDrag = null;
    mouseState.dragging = false;
    mouseState.down = false;
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

  this.scrollHandler = function(deltaX, deltaY) {
    jqThis.trigger('scroll', {
      deltaX: deltaX,
      deltaY: deltaY,
      mapScaledDeltaX: deltaX / self.board.zoom,
      mapScaledDeltaY: deltaY / self.board.zoom
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

    evt.preventDefault();
  });

  jqCanvas.on('mousedown.BoardEvents', function(evt) {
    var canvasCoords;
    if (evt.which == 1) { // left button
      canvasCoords = self.getCanvasCoordinates(evt.pageX, evt.pageY);
      self.cursorDownHandler(canvasCoords, self.leftMouseState);
    } else if (evt.which == 3) { // right button
      canvasCoords = self.getCanvasCoordinates(evt.pageX, evt.pageY);
      self.cursorDownHandler(canvasCoords, self.rightMouseState);
    }
    evt.preventDefault();
  });

  // Disable browser context menu
  jqCanvas.on('contextmenu.BoardEvents', function(evt) {
    evt.preventDefault();
  });

  jqCanvas.on('mouseup.BoardEvents', function(evt) {
    if (evt.which == 1) { // left button
      self.cursorUpHandler(self.leftMouseState);
    } else if (evt.which == 3) { // right button
      self.cursorUpHandler(self.rightMouseState);
    }
    evt.preventDefault();
  });

  jqCanvas.on('mousemove.BoardEvents', function(evt) {
    var canvasCoords = self.getCanvasCoordinates(evt.pageX, evt.pageY);
    self.cursorMoveHandler(canvasCoords, self.leftMouseState);
    self.cursorMoveHandler(canvasCoords, self.rightMouseState);
    evt.preventDefault();
  });

  jqCanvas.on('mouseout.BoardEvents', function(evt) {
    self.cursorUpHandler(self.leftMouseState);
    self.cursorUpHandler(self.rightMouseState);
  });

  // Special event handling for mouse wheel events.
  // jQuery doesn't handle this well; see javascripts/mouse_wheel_events
  addWheelListener(board.canvas, function(evt) {
    self.scrollHandler(evt.deltaX, evt.deltaY);
    evt.preventDefault();
  });

  jqCanvas.on('touchstart.BoardEvents', function(evt) {
    var nEvt = evt.originalEvent;
    var touch, canvasCoords;
    if (nEvt.targetTouches.length == 1) {
      touch = nEvt.targetTouches[0];
      canvasCoords = self.getCanvasCoordinates(touch.pageX, touch.pageY);
      self.cursorDownHandler(canvasCoords, self.leftMouseState);
    } else if (nEvt.targetTouches.length == 2) {

    }
    //evt.stopPropagation();
  });

  jqCanvas.on('touchend.BoardEvents', function(evt) {
    self.cursorUpHandler(self.leftMouseState);
    //evt.stopPropagation();
  });

  jqCanvas.on('touchmove.BoardEvents', function(evt) {
    var nEvt = evt.originalEvent;
    if (nEvt.targetTouches.length == 1) {
      var touch = nEvt.targetTouches[0];
      var canvasCoords = self.getCanvasCoordinates(touch.pageX, touch.pageY);
      self.cursorMoveHandler(canvasCoords, self.leftMouseState);
    }
    //evt.stopPropagation();
  });
}
