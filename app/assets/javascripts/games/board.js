function Board(canvas, toolBarsApi, initiativeApi) {
  this.images = {};

  this.initiative = initiativeApi;
  this.toolBars = toolBarsApi;

  this.canvas = canvas;
  this.context = this.canvas.getContext('2d');
  this.drawing = new Drawing(this.context);
  this.event_manager = new BoardEvents(this);
  this.current_tool = null;

  this.pending_action_queue = [];
  this.template_actions = [];
  this.undo_stack = [];

  this.drawingLayer = new DrawingLayer();

  this.board_data = null;
  this.viewPortCoord = [0, 0];
  this.viewPortSize = [canvas.width, canvas.height];
  this.zoom = 1;

  this.hovered_cell = null;

  this.globalShortcutTool = new GlobalShortCuts(this);

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

  $(this.initiative).on('changed', function(e, evt) {
    self.addAction({actionType: "updateInitiativeAction", initiative: evt.initiative, uid: generateActionId()}, null, true);
  });

  this.setCanvasSize = function(width, height) {

    this.canvas.width = width;
    this.canvas.height = height;

    this.setZoom(this.zoom);
  };

  this.setZoom = function(val) {
    this.zoom = val;
    var oldSize = this.viewPortSize;
    this.viewPortSize = [this.canvas.width / val, this.canvas.height / val];

    this.viewPortCoord = [this.viewPortCoord[0] + (oldSize[0] - this.viewPortSize[0]),
      this.viewPortCoord[1] + (oldSize[1] - this.viewPortSize[1])];

    this.context.restore();
    this.context.save();
    this.context.scale(this.zoom, this.zoom);
    this.context.translate(-1 * this.viewPortCoord[0], -1 * this.viewPortCoord[1]);

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

    this.initiative.update(data.initiative);
    this.board_data = data.board;

    _.each(data.board.drawing_actions, function(action) {
      this.addAction(action, null, false);
    }, this);

    _.each(data.board.template_actions, function(action) {
      this.addAction(action, null, false);
    }, this);

    // Ensure a current tool:
    if (!this.current_tool) {
      this.setTool(new Pointer(this));
    }

    this.globalShortcutTool.disable();
    this.globalShortcutTool.enable();

    this.prepareImages(data.board.board_images);
  };

  this.regenerateDrawing = function() {

  };

  this.renderBoardBackground = function() {
    var data = this.board_data;
    var drawing = this.drawing;
    drawing.tileBackground(this.viewPortCoord[0], this.viewPortCoord[1], this.viewPortSize[0], this.viewPortSize[1], this.images[data.background_image]);
  };

  this.renderBoardGrid = function() {
    this.drawing.drawGrid(this.viewPortCoord[0], this.viewPortCoord[1], this.viewPortSize[0], this.viewPortSize[1], "rgba(0, 0, 0, 1.0)");
  };

  this.renderDrawing = function() {
    // The drawing layer is rendered with the same transforms as the viewport
    // So remove all currently set transforms with the identity matrix before
    // copying the drawing layer over

//    this.context.save();
//    this.context.setTransform(1, 0, 0, 1, 0, 0);
//    this.context.drawImage(this.drawingCanvas, 0, 0);
//    this.context.restore();

    this.drawingLayer.draw(this.viewPortCoord[0], this.viewPortCoord[1], this.viewPortSize[0], this.viewPortSize[1], this.drawing);
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
      if (!this.images[imgs[i].name]) {
        images[i] = new Image();
        this.images[imgs[i].name] = images[i];
        images[i].onabort = inc;
        images[i].onerror = inc;
        images[i].onload = inc;
        images[i].src = imgs[i].url;
      }
    }
  };

  $(this.toolBars).on('toolchanged', function(e) {
    var tool = self.toolBars.getTool();
    var width = self.toolBars.getLineWidth();
    var color = self.toolBars.getColor();

    switch (tool) {
      case "Pointer":
        self.setTool(new Pointer(self));
        break;
      case "Pen":
        self.setTool(new Pen(self, width, color));
        break;
      case "Square":
        self.setTool(new SquarePen(self, width, color));
        break;
      case "Circle":
        self.setTool(new CirclePen(self, width, color));
        break;
      case "Eraser":
        self.setTool(new Eraser(self, 30));
        break;
      case "Measure":
        self.setTool(new Measure(self, color));
        break;
      case "Radius":
        self.setTool(new RadiusTemplate(self, color));
        break;
      case "Cone":
        self.setTool(new ConeTemplate(self, color));
        break;
      case "Line":
        self.setTool(new Pointer(self));
        //game_board.setTool(new LineTemplate(game_board, $("#tool_color").toolMenu("value").color));
        break;
      default:
        throw "No such tool";
    }
  });

  $(this.toolBars).on('undo', function(e) {
    self.undo();
  });

  $(this.toolBars).on('zoomchanged', function(e) {
    self.setZoom(e.value);
  });
};

