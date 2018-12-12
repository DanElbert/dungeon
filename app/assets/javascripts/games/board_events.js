
// Wraps canvas events and generates map-friendly events.
// Each event has a custom event object with the following properties (as appropriate):
// dragStart, dragStartCell, previousDrag, mapPoint, mapPointCell, mousePoint
class BoardEvents extends Eventer {
  constructor(board) {
    super();

    this.board = board;
    this.canvas = board.canvas;
    preventGhosts(this.canvas);

    // Track mouse location as it moves so that we can use it in events that don't give the mouse location
    this.mouseCanvasPoint = null;

    this.leftMouseState = {
      down: false,
      dragging: false,
      dragStart: null,
      previousDrag: null,
      previousClick: null,
      eventPrefix: ''
    };

    this.rightMouseState = {
      down: false,
      dragging: false,
      dragStart: null,
      previousDrag: null,
      previousClick: null,
      eventPrefix: 'right'
    };

    this.shiftKey = false;
    this.altKey = false;
    this.ctrlKey = false;

    this.draggingFingers = 0;

    this.setupEvents();
  }

  getCanvasCoordinates(mouseX, mouseY) {
    // x, y coords of mouse click relative to canvas
    var rect = this.canvas.getBoundingClientRect();
    var win = this.canvas.ownerDocument.defaultView;
    var offset = {
      top: rect.top + win.pageYOffset,
      left: rect.left + win.pageXOffset
    };

    var x = mouseX - offset.left;
    var y = mouseY - offset.top;

    return [x, y];
  }

  getMapCoordinates(canvasX, canvasY) {
    var x = canvasX;
    var y = canvasY;

    // scale to current zoom
    x = x / this.board.getZoom();
    y = y / this.board.getZoom();

    // Translate to current viewport
    x = x + this.board.getViewPortCoordinates()[0];
    y = y + this.board.getViewPortCoordinates()[1];

    return [x, y];
  }

  getCell(mapX, mapY) {
    return Geometry.getCell([mapX, mapY], this.board.drawing.cellSize);
  }

  cursorDownHandler(canvasCoords, mouseState) {
    mouseState.down = true;
    mouseState.dragStart = this.getMapCoordinates(canvasCoords[0], canvasCoords[1]);
  }

  cursorMoveHandler(canvasCoords, mouseState) {
    var mapPoint = this.getMapCoordinates(canvasCoords[0], canvasCoords[1]);
    var cell = this.getCell(mapPoint[0], mapPoint[1]);

    if(mouseState.down && !mouseState.dragging) {
      mouseState.dragging = true;
      this.trigger(mouseState.eventPrefix + 'dragstart', {mapPoint: mouseState.dragStart, mapPointCell: this.getCell(mouseState.dragStart[0], mouseState.dragStart[1]), mousePoint: canvasCoords});
    }

    if (mouseState.dragging) {
      this.trigger(mouseState.eventPrefix + 'drag', {
        dragStart: mouseState.dragStart,
        dragStartCell: this.getCell(mouseState.dragStart[0], mouseState.dragStart[1]),
        previousDrag: mouseState.previousDrag ? mouseState.previousDrag : mouseState.dragStart,
        mousePoint: canvasCoords,
        mapPoint: mapPoint,
        mapPointCell: cell});

      mouseState.previousDrag = mapPoint;
    }

    this.trigger(mouseState.eventPrefix + 'mousemove', {mapPoint: mapPoint, mapPointCell: cell, mousePoint: canvasCoords});
  }

  cursorUpHandler(mouseState) {
    // Ignore any mouse up events that didn't start with a mousedown on the canvas
    if (!mouseState.down) {
      return;
    }

    var mapPoint, cell;

    if (mouseState.dragging) {
      mapPoint = mouseState.previousDrag;
      cell = this.getCell(mapPoint[0], mapPoint[1]);

      this.trigger(mouseState.eventPrefix + 'dragstop', {
        dragStart: mouseState.dragStart,
        dragStartCell: this.getCell(mouseState.dragStart[0], mouseState.dragStart[1]),
        previousDrag: mouseState.previousDrag ? mouseState.previousDrag : mouseState.dragStart,
        mapPoint: mapPoint,
        mapPointCell: cell
      });

    } else {
      mapPoint = mouseState.dragStart;
      cell = this.getCell(mapPoint[0], mapPoint[1]);

      this.trigger(mouseState.eventPrefix + 'click', {
        mapPoint: mapPoint,
        mapPointCell: cell
      });

      var now = Date.now();
      if (mouseState.previousClick && (now - mouseState.previousClick < 500)) {
        this.trigger(mouseState.eventPrefix + 'dblclick', {
          mapPoint: mapPoint,
          mapPointCell: cell
        });
      }

      mouseState.previousClick = now;
    }

    mouseState.dragStart = null;
    mouseState.previousDrag = null;
    mouseState.dragging = false;
    mouseState.down = false;
  }

  keyDownHandler(key) {
    this.trigger("keydown", {
      key: key,
      isShift: this.shiftKey,
      isAlt: this.altKey,
      isCtrl: this.ctrlKey
    });
  }

  keyUpHandler(key) {
    this.trigger("keyup", {
      key: key,
      isShift: this.shiftKey,
      isAlt: this.altKey,
      isCtrl: this.ctrlKey
    });
  }

  scrollHandler(evt) {

    var deltaX = evt.deltaX;
    var deltaY = evt.deltaY;

    // Page at a time mode.
    if (evt.deltaMode === 1) {
      deltaX = deltaX * 25;
      deltaY = deltaY * 25;
    }

    if (this.mouseCanvasPoint !== null) {
      this.trigger('scroll', {
        deltaX: deltaX,
        deltaY: deltaY,
        mapPoint: this.getMapCoordinates(this.mouseCanvasPoint[0], this.mouseCanvasPoint[1])
      });
    }
  }

  setupEvents() {

    var self = this;

    window.document.addEventListener("keydown", function(evt) {
      self.board.invalidate();

      // Process all keystrokes, but only those not obviously intended for something else
      var tag = evt.target.tagName.toLowerCase();
      if (tag == "input" || tag == "textarea") {
        return;
      }

      if (evt.key == "Shift") {
        self.shiftKey = true;
      } else if (evt.key == "Control") {
        self.ctrlKey = true;
      } else if (evt.key == "Alt") {
        self.altKey = true;
      }

      self.keyDownHandler(evt.key);
    });



    window.document.addEventListener("keyup", function(evt) {
      self.board.invalidate();
      // Process all keystrokes, but only those not obviously intended for something else
      var tag = evt.target.tagName.toLowerCase();
      if (tag == "input" || tag == "textarea") {
        return;
      }

      if (evt.key == "Shift") {
        self.shiftKey = false;
      } else if (evt.key == "Control") {
        self.ctrlKey = false;
      } else if (evt.key == "Alt") {
        self.altKey = false;
      }

      self.keyUpHandler(evt.key);

      evt.preventDefault();
    });

    this.canvas.addEventListener("mousedown", function(evt) {
      self.board.invalidate();
      var canvasCoords;
      if (evt.button == 0) { // left button
        canvasCoords = self.getCanvasCoordinates(evt.pageX, evt.pageY);
        self.cursorDownHandler(canvasCoords, self.leftMouseState);
      } else if (evt.button == 2) { // right button
        canvasCoords = self.getCanvasCoordinates(evt.pageX, evt.pageY);
        self.cursorDownHandler(canvasCoords, self.rightMouseState);
      }
      evt.preventDefault();
    });

    // Disable browser context menu
    this.canvas.addEventListener("contextmenu", function(evt) {
      self.board.invalidate();
      evt.preventDefault();
    });

    this.canvas.addEventListener('mouseup', function(evt) {
      self.board.invalidate();
      if (evt.button == 0) { // left button
        self.cursorUpHandler(self.leftMouseState);
      } else if (evt.button == 2) { // right button
        self.cursorUpHandler(self.rightMouseState);
      }
      evt.preventDefault();
    });

    this.canvas.addEventListener('mousemove', function(evt) {
      self.board.invalidate();
      self.mouseCanvasPoint = self.getCanvasCoordinates(evt.pageX, evt.pageY);
      self.cursorMoveHandler(self.mouseCanvasPoint, self.leftMouseState);
      self.cursorMoveHandler(self.mouseCanvasPoint, self.rightMouseState);
      evt.preventDefault();
    });

    this.canvas.addEventListener('mouseout', function(evt) {
      self.board.invalidate();
      self.mouseCanvasPoint = null;
      self.cursorUpHandler(self.leftMouseState);
      self.cursorUpHandler(self.rightMouseState);
    });

    // Special event handling for mouse wheel events.
    // jQuery doesn't handle this well; see javascripts/mouse_wheel_events
    addWheelListener(this.canvas, function(evt) {
      self.board.invalidate();
      self.scrollHandler(evt);
      evt.preventDefault();
    });

    var hammer = new Hammer.Manager(this.canvas, {
      inputClass: Hammer.TouchInput,
      recognizers: [
        // RecognizerClass, [options], [recognizeWith, ...], [requireFailure, ...]
        [Hammer.Tap, {taps: 1, event: "tap"}],
        [Hammer.Press, {time: 500}],
        [Hammer.Pan, {event: "drag"}],
        [Hammer.Pan, {event: "twofingerdrag", pointers: 2, threshold: 10}],
        [Hammer.Pinch, {threshold: 0 }, ["twofingerdrag"]]
      ]
    });

    hammer.on('tap', function(evt) {
      self.board.invalidate();
      var coords = self.getCanvasCoordinates(evt.center.x, evt.center.y);
      self.cursorDownHandler(coords, self.leftMouseState);
      self.cursorUpHandler(self.leftMouseState);
    });

    hammer.on('dragstart twofingerdragstart', function(evt) {
      self.board.invalidate();
      var coords = self.getCanvasCoordinates(evt.center.x, evt.center.y);
      self.draggingFingers = evt.pointers.length;
      if (self.draggingFingers == 1) {
        self.cursorDownHandler(coords, self.leftMouseState);
      } else if (self.draggingFingers == 2) {
        self.cursorDownHandler(coords, self.rightMouseState);
      }
    });

    hammer.on('drag twofingerdrag', function(evt) {
      self.board.invalidate();
      if (self.draggingFingers != evt.pointers.length) {
        self.cursorUpHandler(self.leftMouseState);
        self.cursorUpHandler(self.rightMouseState);
        return;
      }
      var coords = self.getCanvasCoordinates(evt.center.x, evt.center.y);
      if (evt.pointers.length == 1) {
        self.cursorMoveHandler(coords, self.leftMouseState);
      } else if (evt.pointers.length == 2) {
        self.cursorMoveHandler(coords, self.rightMouseState);
      }
    });

    hammer.on('dragend twofingerdragend', function(evt) {
      self.board.invalidate();
      if (evt.pointers.length == 1) {
        self.cursorUpHandler(self.leftMouseState);
      } else if (evt.pointers.length == 2) {
        self.cursorUpHandler(self.rightMouseState);
      }
    });

    hammer.on('pinchstart', function(evt) {
      self.board.invalidate();
      var canvasCoords = self.getCanvasCoordinates(evt.center.x, evt.center.y);
      var mapCoords = self.getMapCoordinates(canvasCoords[0], canvasCoords[1]);
      self.trigger('pinchstart', {
        scale: evt.scale,
        center: mapCoords
      });
    });

    hammer.on('pinchmove', function(evt) {
      self.board.invalidate();
      var canvasCoords = self.getCanvasCoordinates(evt.center.x, evt.center.y);
      var mapCoords = self.getMapCoordinates(canvasCoords[0], canvasCoords[1]);
      self.trigger('pinch', {
        scale: evt.scale,
        center: mapCoords
      });
    });

    hammer.on('press', function(evt) {
      self.board.invalidate();
      var canvasCoords = self.getCanvasCoordinates(evt.center.x, evt.center.y);
      var mapCoords = self.getMapCoordinates(canvasCoords[0], canvasCoords[1]);
      self.trigger('hold', {
        mapPoint: mapCoords,
        mapPointCell: self.getCell(mapCoords[0], mapCoords[1])
      });
    });
  }
}
