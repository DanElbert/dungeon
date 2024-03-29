import { ActionMessenger } from "../ActionMessenger";
import { AnimationManager } from "./Animation";
import { BackgroundLayer } from "./BackgroundLayer";
import { BoardEvents } from "./BoardEvents";
import { Drawing } from "./Drawing";
import { MultiLevelDrawingLayer } from "./MultiLevelDrawingLayer";
import { ImageCache } from "./ImageCache";
import { MoveIndicatorLayer } from "./MoveIndicatorLayer";
import { PingLayer } from "./PingLayer";
import { TemplateLayer } from "./TemplateLayer";
import { TokenLayer } from "./TokenLayer";
import { ToolManager } from "../tools/ToolManager";
import { ViewPortLabels } from "./ViewPortLabels";
import { ViewPortManager } from "./ViewPortManager";
import { toggleDungeonFullscreen } from "./Fullscreen";
import { generateActionId, attachActionMethods } from "../Actions";
import store from "../../store";

export function Board(canvas, gameId, userData) {

  this.switchImageHack = (uid, newUrl) => {
    const action = { uid: generateActionId(), actionType: "updateImageUrl", targetUid: uid, newUrl: newUrl };
    this.addAction(action, null, true);
  }

  this.gameId = gameId;
  this.user = userData;
  this.invalid = true;
  this.networkDown = false;
  this.camera = null;

  this.imageCache = new ImageCache();
  this.drawingSettings = {
    imageCache: this.imageCache,
    zoom: 1,
    cellSize: 50,
    cellSizeFeet: 5,
    isOwner: false
  };
  this.campaign_images = null;

  this.animations = new AnimationManager();

  this.canvas = canvas;
  this.context = this.canvas.getContext('2d');
  this.drawing = new Drawing(this.context, this.drawingSettings);
  // To account for device pixel ratios that are not 1:1, we transform the identity matrix to match
  this.pixelRatio = 1;
  this.identityTransform = () => { this.context.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0) };

  this.event_manager = new BoardEvents(this);
  this.toolManager = new ToolManager(this);
  this.compassSettings = { rotation: 0, visible: false };
  //this.boardDetectionManager = new BoardDetectionManager(this, this.toolManager, this.camera, null);

  this.isOwner = false;
  this.pcMode = false;

  this.editingImage = null;
  this.copiedArea = null;
  this.isItemDragging = false;
  this.selectedItem = null;

  this.pending_action_queue = [];
  this.undo_stack = [];

  this.drawingLayer = new MultiLevelDrawingLayer(this.drawingSettings);
  this.moveIndicatorLayer = new MoveIndicatorLayer(this);
  this.pingLayer = new PingLayer(this);
  this.tokenLayer = new TokenLayer(this);
  this.labelLayer = new ViewPortLabels(this, true);
  this.backgroundLayer = new BackgroundLayer(this);
  this.templateLayer = new TemplateLayer(this);

  this.board_data = null;

  this.viewPortManager = new ViewPortManager(this);

  this.displayCapturePattern = false;

  this.hovered_cell = null;

  // Used in events
  var self = this;

  this.addActionManager = new ActionMessenger("GameActionChannel", { game_id: this.gameId }, function(message) {
    self.handleAddActionMessage(message);
  });

  this.addActionManager.onDisconnected = function() {
    // the client is offline
    self.toolManager.setErrorState(true, "Cannot connect to Dungeon server");
    self.networkDown = true;
  };

  this.addActionManager.onConnected = function() {
    self.toolManager.setErrorState(false, "Connection restored");
    self.networkDown = false;
  };

  this.event_manager.on('mousemove', function(mapEvt) {
    self.cellHover(mapEvt.mapPointCell[0], mapEvt.mapPointCell[1]);
  });

  this.setCanvasSize = function(width, height, pixelRatio) {

    this.canvas.width = Math.floor(width * pixelRatio);
    this.canvas.height = Math.floor(height * pixelRatio);
    this.canvas.style.width = width.toString() + "px";
    this.canvas.style.height = height.toString() + "px";
    this.pixelRatio = pixelRatio;

    this.viewPortManager.setCanvasSize([width, height], pixelRatio);
    this.backgroundLayer.setCanvasSize(width, height);
  };

  this.setZoom = function(val, mapCenter, noAnimate) {
    this.viewPortManager.setZoom(val, mapCenter, !noAnimate);
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

  this.setViewPortCoordinates = function(coords, zoom, noAnimate) {
    this.viewPortManager.setViewPort(coords[0], coords[1], zoom || this.viewPortManager.getZoom(), !noAnimate);
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

  this.getViewPortRectangle = function() {
    var coords = this.getViewPortCoordinates();
    var size = this.getViewPortSize();
    return new Rectangle(
      new Vector2(coords[0], coords[1]),
      size[0],
      size[1]
    );
  };

  this.beckon = function() {
    console.log("This implementation does nothing. See ShowGame.vue");
  };

  this.getLevel = function() {
    return this.drawingLayer.getLevel()
  };

  this.setLevel = function(newLevel) {
    this.drawingLayer.setLevel(newLevel);
    this.invalidate();
  };

  this.getLevelData = function() {
    return this.drawingLayer.getLevelData();
  };

  this.handleAddActionMessage = function(message) {
    this.addAction(message, null, false);
  };

  this.sendActionMessage = function(action) {
    this.addActionManager.sendActionMessage(action);
  };

  this.addAction = function(action, undoAction, broadcastAction) {
    action = attachActionMethods(action);

    this.pending_action_queue.push(action);

    if (broadcastAction) {
      this.sendActionMessage(action.serialize());
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

  this.resetFog = function(level, fillFog) {
    this.drawingLayer.resetFog(level, fillFog);
  };

  this.setPcMode = function(mode) {
    this.pcMode = mode;
    this.drawingLayer.setOwner(!mode);
    this.toolManager.setPcModeActiveState(this.pcMode);
    this.invalidate();
  };

  this.toggleFullscreen = function() {

    toggleDungeonFullscreen();
  };

  this.refresh = function(data) {

    if (!data) {
      return;
    }

    const pixelsPerFoot = data.board.cell_size_pixels / data.board.cell_size_feet;

    this.board_data = data.board;
    this.isOwner = data.is_owner;
    this.campaign_id = data.campaign_id;
    this.campaign_images = data.drawing_images;
    this.token_images = data.token_images;
    this.setPcMode(!this.isOwner);
    this.drawingLayer.setOwner(this.isOwner);
    this.gridColor = data.board.grid_color || "rgba(0, 0, 0, 1.0)";
    this.labelLayer.useXLetters = data.useXLetters;
    this.setViewPortCoordinates([data.board.default_coordinates_x * pixelsPerFoot, data.board.default_coordinates_y * pixelsPerFoot], data.board.default_zoom / 100.0, true);
    this.drawingSettings.cellSize = data.board.cell_size_pixels;
    this.drawingSettings.cellSizeFeet = data.board.cell_size_feet;
    this.drawingSettings.isOwner = this.isOwner;

    this.toolManager.setTemplateSet(data.board.template_type);
    this.toolManager.sharedToolOptions.pingColor.value = data.default_ping_color || "#EE204D";

    this.compassSettings.rotation = data.board.compass_rotation;

    if (!this.isOwner) {
      this.toolManager.hideFogTools();
      this.toolManager.hideImageTool();
      this.toolManager.hidePcModeTool();
      this.toolManager.hideBeckonTool();
      this.toolManager.hideTokensFromTool();
    }

    data.board.actions.forEach(action => {
      this.addAction(action, null, false);
    });


    this.toolManager.initialize();

    this.imageCache.addImages(data.board.board_images);
  };

  this.renderBoardBackground = function() {
    this.backgroundLayer.draw();
    // var data = this.board_data;
    // var drawing = this.drawing;
    //drawing.tileBackground(this.getViewPortCoordinates()[0], this.getViewPortCoordinates()[1], this.getViewPortSize()[0], this.getViewPortSize()[1], data.background_image);
  };

  this.renderBoardGrid = function(colorOverride) {
    this.drawing.drawGrid(this.getViewPortCoordinates()[0], this.getViewPortCoordinates()[1], this.getViewPortSize()[0], this.getViewPortSize()[1], colorOverride || this.gridColor, this.getZoom());
  };

  this.renderDrawing = function() {
    this.drawingLayer.draw(this.getViewPortCoordinates()[0], this.getViewPortCoordinates()[1], this.getViewPortSize()[0], this.getViewPortSize()[1], this.drawing, this.viewPortManager.getZoom());
  };

  this.renderCursor = function() {
    if (this.hovered_cell) {
      this.drawing.colorCell(this.hovered_cell[0], this.hovered_cell[1], "rgba(0, 204, 0, 0.125)");
    }
  };

  this.renderTemplates = function() {
    this.templateLayer.draw(this.drawing);
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
    this.renderBoardGrid("rgba(0, 0, 0, 0.05)");
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
      this.identityTransform();

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
    if (this.pending_action_queue.length > 0) {
      this.invalidate();
    }

    this.pending_action_queue.forEach(action => {
      action.apply(this);
    });

    this.pending_action_queue = [];
  };

  this.invalidate = function(rect, includeFog) {
    this.invalid = true;
    if (rect) {
      this.drawingLayer.invalidateRectangle(rect, includeFog);
    }
  };

  this.validate = function() {
    this.invalid = false;
  };

  // Whether the drawing is invalid and needs to be re-drawn
  this.isInvalid = function() {
    return this.invalid || this.drawBorder || this.animations.isAnimating();
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
    this.animations.update();
    this.viewPortManager.update();
    this.drawingSettings.zoom = this.getZoom();

    if (this.displayCapturePattern) {
      this.renderCapturePattern();
      this.renderPings();
    } else {
      if (this.isInvalid()) {
        context.clearRect(this.getViewPortCoordinates()[0], this.getViewPortCoordinates()[1], this.getViewPortSize()[0], this.getViewPortSize()[1]);
        this.renderBoardBackground();
        this.renderDrawing();
        this.renderCursor();
        this.renderTemplates();
        this.renderTokens();
        this.renderTool();
        this.renderBoardGrid();
        this.moveIndicatorLayer.draw(this.drawing);
        this.renderPings();
        this.labelLayer.draw();
        this.renderBorder();

        this.validate();
      }
    }

    this.drawingSettings.loopCache = null;
  };

  this.cellHover = function(x, y) {
    this.hovered_cell = [x, y];
  };

  this.drawIntoNewCanvas = function(x, y, width, height, level) {
    const oldLevel = this.getLevel();
    this.setLevel(level);
    var canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    var context = canvas.getContext('2d');
    var drawing = new Drawing(context, this.drawingSettings);
    context.save();
    context.translate(-1 * x, -1 * y);
    this.drawingLayer.draw(x, y, width, height, drawing, 1, true);
    context.restore();
    this.setLevel(oldLevel.id);
    return canvas;
  };

  this.copyArea = function(x, y, width, height) {
    const canvas = this.drawIntoNewCanvas(x, y, width, height, this.getLevel().id);
    return canvas.toDataURL().slice("data:image/png;base64,".length);
  };

  this.setCopiedArea = function(url) {
    this.copiedArea = url;
    this.toolManager.showPasteTool();
  };

  this.clearTokens = function(e) {
    this.addAction({actionType: "clearTokensAction", uid: generateActionId()}, null, true);
  };

}

