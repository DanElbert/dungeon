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
  this.pingLayer = new PingLayer();

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
  };

  this.handleAddActionMessage = function(message) {
    var index = _.indexOf(this.sentMessageIds, message.uid);
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

  this.renderPings = function() {
    this.pingLayer.draw(this.drawing);
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

    this.executeActions();

    context.clearRect(this.viewPortCoord[0], this.viewPortCoord[1], this.viewPortSize[0], this.viewPortSize[1]);

    this.renderBoardBackground();
    this.renderTemplates();
    this.renderBoardGrid();
    this.renderDrawing();
    this.renderPings();
    this.renderCursor();
    this.renderTool();
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
        self.setTool(new LineTemplate(self, color));
        break;
      case "Ping":
        self.setTool(new PingTool(self, color));
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

