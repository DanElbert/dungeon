function Board(canvas, toolBarsApi, initiativeApi, cameraApi) {
  this.images = {};

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

  this.initiative = initiativeApi;
  this.toolBars = toolBarsApi;
  this.camera = cameraApi;

  this.canvas = canvas;
  this.context = this.canvas.getContext('2d');
  this.drawing = new Drawing(this.context);
  this.event_manager = new BoardEvents(this);
  this.boardDetectionManager = new BoardDetectionManager(this, this.toolBars, this.camera, this.gameServerClient);
  this.current_tool = null;

  this.isOwner = false;

  this.pending_action_queue = [];
  this.template_actions = [];
  this.undo_stack = [];

  this.drawingLayer = new DrawingLayer();
  this.pingLayer = new PingLayer();
  this.tokenLayer = new TokenLayer();

  this.board_data = null;
  this.viewPortCoord = [0, 0];
  this.viewPortSize = [canvas.width, canvas.height];
  this.zoom = 1;

  this.displayCapturePattern = false;

  this.hovered_cell = null;

  this.globalShortcutTool = new GlobalShortCuts(this);

  // Used in events
  var self = this;

  this.addActionManager = new ActionMessenger(this.gameServerClient, '/game/' + GAME_ID + '/add_action', function(message) {
    self.handleAddActionMessage(message);
  });

  this.initiativeManager = new ActionMessenger(this.gameServerClient, '/game/' + GAME_ID + '/update_initiative', function(message) {
    self.handleAddActionMessage(message);
  });

  this.addActionManager.connect();
  this.initiativeManager.connect();

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

  // Rounds the zoom and ensures it's within the min and max zoom values
  this.normalizeZoom = function(zoom) {
    var zoomMax = 2.5;
    var zoomMin = 0.3;
    var newZoom = Math.round(zoom * 100) / 100;
    newZoom = Math.min(zoomMax, newZoom);
    newZoom = Math.max(zoomMin, newZoom);
    return newZoom;
  };

  this.setZoom = function(val, mapCenter) {
    val = this.normalizeZoom(val);
    if (!mapCenter) mapCenter = [this.viewPortCoord[0] + this.viewPortSize[0] / 2, this.viewPortCoord[1] + this.viewPortSize[1] / 2];
    var canvasCenter = [(mapCenter[0] - this.viewPortCoord[0]) * this.zoom, (mapCenter[1] - this.viewPortCoord[1]) * this.zoom];

    this.zoom = val;
    this.viewPortSize = [this.canvas.width / val, this.canvas.height / val];
    this.viewPortCoord = [mapCenter[0] - (canvasCenter[0] / this.zoom), mapCenter[1] - (canvasCenter[1] / this.zoom)];

    this.context.restore();
    this.context.save();
    this.context.scale(this.zoom, this.zoom);
    this.context.translate(-1 * this.viewPortCoord[0], -1 * this.viewPortCoord[1]);
  };

  this.setTool = function(tool) {
    if (this.current_tool) {
      this.current_tool.disable();
    }
    this.current_tool = tool;
    this.current_tool.enable();
    this.current_tool.optionsChanged();
    this.toolBars.setOptions(tool.getOptions());
  };

  this.handleAddActionMessage = function(message) {
    this.addAction(message, null, false);
  };

  this.sendActionMessage = function(action) {
    this.addActionManager.sendActionMessage(action);
  };

  this.sendInitiativeMessage = function(action) {
    this.initiativeManager.sendActionMessage(action);
  };

  this.addAction = function(action, undoAction, broadcastAction) {
    action = attachActionMethods(action);

    this.pending_action_queue.push(action);

    if (broadcastAction) {
      if (action.actionType == 'updateInitiativeAction')
      {
        this.sendInitiativeMessage(action);
      } else {
        this.sendActionMessage(action);
      }
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
    this.isOwner = data.is_owner;
    this.drawingLayer.isOwner = this.isOwner;

    if (!this.isOwner) {
      this.toolBars.hideFogTools();
    }

    _.each(data.board.actions, function(action) {
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

  this.renderBoardBackground = function() {
    var data = this.board_data;
    var drawing = this.drawing;
    var img = this.images[data.background_image];
    if (img && img.loaded) drawing.tileBackground(this.viewPortCoord[0], this.viewPortCoord[1], this.viewPortSize[0], this.viewPortSize[1], img.image);
  };

  this.renderBoardGrid = function() {
    this.drawing.drawGrid(this.viewPortCoord[0], this.viewPortCoord[1], this.viewPortSize[0], this.viewPortSize[1], "rgba(0, 0, 0, 1.0)");
  };

  this.renderDrawing = function() {
    this.drawingLayer.draw(this.viewPortCoord[0], this.viewPortCoord[1], this.viewPortSize[0], this.viewPortSize[1], this.drawing, this.isOwner);
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
    if (this.current_tool) {
      this.current_tool.draw();
    }
  };

  this.renderCapturePattern = function() {
    this.drawing.colorBackground(this.viewPortCoord[0], this.viewPortCoord[1], this.viewPortSize[0], this.viewPortSize[1], "rgba(255, 255, 255, 1.0)");
    this.drawing.drawGrid(this.viewPortCoord[0], this.viewPortCoord[1], this.viewPortSize[0], this.viewPortSize[1], "rgba(0, 0, 0, 0.05)");
    var pattern_size = this.boardDetectionManager.getPatternSize();
    var size = this.boardDetectionManager.getPatternDimension();
    var gutter = (size / pattern_size);
    var origin_x = this.viewPortCoord[0];
    var origin_y = this.viewPortCoord[1];
    var extent_x = origin_x + this.viewPortSize[0];
    var extent_y = origin_y + this.viewPortSize[1];

    this.drawing.drawChessBoard(origin_x + gutter, origin_y + gutter, size, pattern_size);
    this.drawing.drawChessBoard(extent_x - gutter - size, origin_y + gutter, size, pattern_size);
    this.drawing.drawChessBoard(origin_x + gutter, extent_y - gutter - size, size, pattern_size);
    this.drawing.drawChessBoard(extent_x - gutter - size, extent_y - gutter - size, size, pattern_size);
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

    this.executeActions();

    context.clearRect(this.viewPortCoord[0], this.viewPortCoord[1], this.viewPortSize[0], this.viewPortSize[1]);

    if (this.displayCapturePattern) {
      this.renderCapturePattern();
      this.renderPings();
    } else {
      this.renderBoardBackground();
      this.renderTemplates();
      this.renderBoardGrid();
      this.renderDrawing();
      this.renderTokens();
      this.renderPings();
      this.renderCursor();
      this.renderTool();
    }
  };

  this.cellHover = function(x, y) {
    this.hovered_cell = [x, y];
  };

  this.prepareImages = function(imgs) {
    "use strict";
    var loaded = 0;
    var images = [];
    imgs = Object.prototype.toString.apply( imgs ) === '[object Array]' ? imgs : [imgs];

    for ( var i = 0; i < imgs.length; i++ ) {
      if (!this.images[imgs[i].name]) {

        images[i] = new Image();
        var imgObj = {image: images[i], loaded: false};
        this.images[imgs[i].name] = imgObj;

        images[i].onload = function() {
          imgObj.loaded = true;
        };

        images[i].src = imgs[i].url;
      }
    }
  };

  this.toolMap = {
    "Pointer": new Pointer(this),
    "Pen": new Pen(this),
    "Square": new SquarePen(this),
    "Circle": new CirclePen(this),
    "Line Pen": new LinePen(this),
    "Eraser": new Eraser(this),
    "Measure": new Measure(this),
    "Radius": new RadiusTemplate(this),
    "Cone": new ConeTemplate(this),
    "Line": new LineTemplate(this),
    "Ping": new PingTool(this),
    "Add Fog": new AddFogPen(this),
    "Remove Fog": new RemoveFogPen(this),
    "Label": new LabelTool(this)
  };

  $(this.toolBars).on('toolchanged', function(e) {
    var toolName = self.toolBars.getTool();
    var tool = self.toolMap[toolName];

    if (tool) {
      self.setTool(tool);
    } else {
      throw "No such tool";
    }
  });

  $(this.toolBars).on('undo', function(e) {
    self.undo();
  });

  $(this.toolBars).on('zoomchanged', function(e) {
    self.setZoom(e.value);
  });

  $(this.toolBars).on('clearTokens', function(e) {
    self.addAction({actionType: "clearTokensAction", uid: generateActionId()}, null, true);
  });
}

