function Board(canvas, cameraApi) {

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

  this.networkDown = false;
  this.camera = cameraApi;

  this.imageCache = new ImageCache();

  this.canvas = canvas;
  this.context = this.canvas.getContext('2d');
  this.drawing = new Drawing(this.context, this.imageCache);
  this.event_manager = new BoardEvents(this);
  this.toolManager = new ToolManager(this);
  this.mainMenu = new MainMenu(this);
  this.initiative = new InitiativeManager(this, INITIATIVE_URL);
  this.boardDetectionManager = new BoardDetectionManager(this, this.toolManager, this.camera, this.gameServerClient);

  this.isOwner = false;

  this.copiedArea = null;

  this.pending_action_queue = [];
  this.template_actions = [];
  this.undo_stack = [];

  this.drawingLayer = new DrawingLayer(this.imageCache);
  this.pingLayer = new PingLayer();
  this.tokenLayer = new TokenLayer();
  this.labelLayer = new ViewPortLabels(this);

  this.board_data = null;

  this.viewPortManager = new ViewPortManager(this);

  this.displayCapturePattern = false;

  this.hovered_cell = null;

  // Used in events
  var self = this;

  this.gameServerClient.on('transport:down', function() {
    // the client is offline
    var alarmFunc = function() {
      if (self.networkDown) {
        flashMessage("error", "Cannot Connect to Dungeon Server!!");
        setTimeout(alarmFunc, 5000);
      }
    };
    self.networkDown = true;
    alarmFunc();
  });

  this.gameServerClient.on('transport:up', function() {
    if (self.networkDown) {
      self.networkDown = false;
      flashMessage("notice", "Connection to Dungeon Server Restored.");
    }
  });

  this.addActionManager = new ActionMessenger(this.gameServerClient, '/game/' + GAME_ID + '/add_action', function(message) {
    self.handleAddActionMessage(message);
  });

  this.initiativeActionManager = new ActionMessenger(this.gameServerClient, '/game/' + GAME_ID + '/update_initiative', function(message) {
    self.handleAddActionMessage(message);
  });

  this.addActionManager.connect();
  this.initiativeActionManager.connect();

  $(this.event_manager).on('mousemove', function(evt, mapEvt) {
    self.cellHover(mapEvt.mapPointCell[0], mapEvt.mapPointCell[1]);
  });

  $(this.initiative).on('changed', function(e, evt) {
    self.addAction({actionType: "updateInitiativeAction", initiative: evt.initiative, uid: generateActionId()}, null, true);
  });

  $(this.imageCache).on("imageloaded", function(evt) {
    self.drawingLayer.clear();
  });

  this.setCanvasSize = function(width, height) {

    this.canvas.width = width;
    this.canvas.height = height;

    this.viewPortManager.setCanvasSize([width, height]);
  };

  this.setZoom = function(val, mapCenter, noAnimate) {
    this.viewPortManager.setZoom(val, mapCenter, noAnimate);
  };

  this.getZoom = function(targetZoom) {
    if (targetZoom) {
      return this.viewPortManager.getTargetZoom();
    } else {
      return this.viewPortManager.getZoom();
    }
  };

  this.getViewPortCoordinates = function() {
    return this.viewPortManager.getCoordinates();
  };

  this.setViewPortCoordinates = function(coords, noAnimate) {
    this.viewPortManager.setCoordinates(coords, noAnimate);
  };

  this.getViewPortSize = function() {
    return this.viewPortManager.getSize();
  };
  
  this.saveViewPort = function() {
    this.viewPortManager.saveViewPort();
  };
  
  this.restoreViewPort = function() {
    this.viewPortManager.restoreViewPort();
  };

  this.handleAddActionMessage = function(message) {
    this.addAction(message, null, false);
  };

  this.sendActionMessage = function(action) {
    this.addActionManager.sendActionMessage(action);
  };

  this.sendInitiativeMessage = function(action) {
    this.initiativeActionManager.sendActionMessage(action);
  };

  this.addAction = function(action, undoAction, broadcastAction) {
    action = attachActionMethods(action);

    this.pending_action_queue.push(action);

    if (broadcastAction) {
      if (action.actionType == 'updateInitiativeAction')
      {
        this.sendInitiativeMessage(action.serialize());
      } else {
        this.sendActionMessage(action.serialize());
      }
    }

    if (undoAction) {
      this.undo_stack.push(undoAction);
    }
  };

  this.undo = function() {
    if (this.undo_stack.length > 0) {
      var action = this.undo_stack.pop();
      this.addAction(action, null, true);
    }
  };

  this.resetFog = function(fillFog) {
    this.drawingLayer.resetFog(fillFog);
  };

  this.toggleFullscreen = function() {

    window.toggleDungeonFullscreen();
  };

  this.refresh = function(data) {

    if (!data) {
      return;
    }

    this.initiative.update(data.initiative);
    this.board_data = data.board;
    this.isOwner = data.is_owner;
    this.drawingLayer.isOwner = this.isOwner;
    this.gridColor = data.board.grid_color || "rgba(0, 0, 0, 1.0)";

    if (!this.isOwner) {
      this.toolManager.hideFogTools();
    }

    _.each(data.board.actions, function(action) {
      this.addAction(action, null, false);
    }, this);

    this.toolManager.initialize();
    this.mainMenu.render();

    this.imageCache.addImages(data.board.board_images);
  };

  this.renderBoardBackground = function() {
    var data = this.board_data;
    var drawing = this.drawing;
    drawing.tileBackground(this.getViewPortCoordinates()[0], this.getViewPortCoordinates()[1], this.getViewPortSize()[0], this.getViewPortSize()[1], data.background_image);
  };

  this.renderBoardGrid = function() {
    this.drawing.drawGrid(this.getViewPortCoordinates()[0], this.getViewPortCoordinates()[1], this.getViewPortSize()[0], this.getViewPortSize()[1], this.gridColor);
  };

  this.renderDrawing = function() {
    this.drawingLayer.draw(this.getViewPortCoordinates()[0], this.getViewPortCoordinates()[1], this.getViewPortSize()[0], this.getViewPortSize()[1], this.drawing, false);
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

  this.renderPings = function() {
    this.pingLayer.draw(this.drawing);
  };

  this.renderTokens = function() {
    this.tokenLayer.draw(this.drawing);
  };

  this.renderTool = function() {
    this.toolManager.draw();
  };

  this.renderCapturePattern = function() {
    this.drawing.colorBackground(this.getViewPortCoordinates()[0], this.getViewPortCoordinates()[1], this.getViewPortSize()[0], this.getViewPortSize()[1], "rgba(255, 255, 255, 1.0)");
    this.drawing.drawGrid(this.getViewPortCoordinates()[0], this.getViewPortCoordinates()[1], this.getViewPortSize()[0], this.getViewPortSize()[1], "rgba(0, 0, 0, 0.05)");
    var pattern_size = this.boardDetectionManager.getPatternSize();
    var size = this.boardDetectionManager.getPatternDimension();
    var gutter = (size / pattern_size);
    var origin_x = this.getViewPortCoordinates()[0];
    var origin_y = this.getViewPortCoordinates()[1];
    var extent_x = origin_x + this.getViewPortSize()[0];
    var extent_y = origin_y + this.getViewPortSize()[1];

    this.drawing.drawChessBoard(origin_x + gutter, origin_y + gutter, size, pattern_size);
    this.drawing.drawChessBoard(extent_x - gutter - size, origin_y + gutter, size, pattern_size);
    this.drawing.drawChessBoard(origin_x + gutter, extent_y - gutter - size, size, pattern_size);
    this.drawing.drawChessBoard(extent_x - gutter - size, extent_y - gutter - size, size, pattern_size);
  };

  this.renderBorder = function() {
    if (this.drawBorder) {

      var width = 10;

      this.context.save();
      this.context.setTransform(1, 0, 0, 1, 0, 0);

      if (Math.floor(Date.now() / 1000) % 2 == 0) {
        this.context.lineDashOffset = 0;
        this.context.setLineDash([40, 20]);
      } else {
        this.context.lineDashOffset = 20;
        this.context.setLineDash([20, 40]);
      }

      this.drawing.drawSquare([width / 2, width / 2], [this.canvas.width - (width / 2), this.canvas.height - (width / 2)], 'rgb(0,0,0)', null, width, "butt");

      this.context.restore();

    }
  };

  this.executeActions = function() {
    _.each(this.pending_action_queue, function(action) {
      action.apply(this);
    }, this);

    this.pending_action_queue = [];
  };

  // ==============================
  // The main render loop
  // ==============================
  this.update = function() {

    if (!this.board_data) {
      return;
    }

    var context = this.context;

    this.executeActions();
    this.viewPortManager.update();

    //context.clearRect(this.viewPortCoord[0], this.viewPortCoord[1], this.getViewPortSize()[0], this.getViewPortSize()[1]);

    if (this.displayCapturePattern) {
      this.renderCapturePattern();
      this.renderPings();
    } else {
      this.renderBoardBackground();
      this.renderDrawing();
      this.renderTool();
      this.renderBoardGrid();
      this.renderTemplates();
      this.renderTokens();
      this.renderPings();
      this.labelLayer.draw();
      this.renderBorder();
      this.renderCursor();
    }
  };

  this.cellHover = function(x, y) {
    this.hovered_cell = [x, y];
  };

  this.copyArea = function(x, y, height, width) {
    var canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    var context = canvas.getContext('2d');
    var drawing = new Drawing(context, this.imageCache);
    context.save();
    context.translate(-1 * x, -1 * y);
    this.drawingLayer.draw(x, y, width, height, drawing, this.isOwner, true);
    context.restore();
    return canvas.toDataURL().slice("data:image/png;base64,".length)
  };

  this.setCopiedArea = function(url) {
    this.copiedArea = url;
    this.toolManager.showPasteTool();
  };

  this.clearTokens = function(e) {
    this.addAction({actionType: "clearTokensAction", uid: generateActionId()}, null, true);
  };

}

