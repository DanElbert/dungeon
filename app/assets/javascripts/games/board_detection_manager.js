
// Manages the following workflow:
/*
  1. User opens the camera, which sends the initialize action
  2. Init action enables the "capture" button on all other browsers and disables camera button
  3. Capture button captures geometry and turns on the capture display. "capture" button is removed from all other clients
  4. Snapshot button is enabled on camera
  5. Snapshot button takes an image, sends it to the server for processing
  6. Server sends a create token message to all clients
  7. Camera can be closed, ending the session or can take another picture to re-try token generation

  *. During this process, the "cancel capture" button is displayed on all browsers.  It kills the capture session.
 */

// =================================================
// BoardDetectionManager class
// =================================================
function BoardDetectionManager(board, toolBars, camera, gameClient) {
  this.board = board;
  this.toolBars = toolBars;
  this.camera = camera;

  // Hide camera button by default
  this.toolBars.hideCameraButton();

  var self = this;

  this.boardDetectionActionManager = new ActionMessenger(gameClient, '/game/' + GAME_ID + '/board_detection', function(message) {
    self.receiveAction(message);
  });
  this.boardDetectionActionManager.connect();

  $(this.toolBars).on('startBoardCapture', function(e) {
    var size = parseInt(self.getPatternDimension());
    var origin_x = board.viewPortCoord[0];
    var origin_y = board.viewPortCoord[1];

    self.sendAction({
          actionType: "submitBoardDetectionGeometryAction",
          uid: generateActionId(),
          origin_x: origin_x,
          origin_y: origin_y,
          width: board.viewPortSize[0],
          height: board.viewPortSize[1],
          pattern_size: self.getPatternSize(),
          pattern_dimension: size});

    self.board.displayCapturePattern = true;

    self.toolBars.hideStartCaptureButton();
  });

  $(this.toolBars).on('stopBoardCapture', function(e) {
    var action = {actionType: "finishBoardDetectionAction", uid: generateActionId() };
    self.finishAction(action);
    self.sendAction(action);
  });

  $(this.toolBars).on('openCamera', function(e) {
    self.toolBars.hideCameraButton();
    var width = parseInt(self.board.canvas.width * 0.9);
    var height = parseInt(self.board.canvas.height * 0.9);
    self.camera.open(width, height);
    self.sendAction({actionType: "initializeBoardDetectionAction", uid: generateActionId()}, null, true, true);
  });

  $(this.camera).on('capture', function(e) {
    self.sendAction({actionType: "captureBoardDetectionImageAction", uid: generateActionId(), image_data: e.image_data, image_orientation: e.image_orientation}, null, true, true);
  });

  $(this.camera).on('close', function(e) {
    var action = {actionType: "finishBoardDetectionAction", uid: generateActionId() };
    self.finishAction(action);
    self.sendAction(action);
  });

  $(this.camera).on('supportedChanged', function() {
    self.enableCameraButton();
  });

  this.enableCameraButton();
}

_.extend(BoardDetectionManager.prototype, {
  enableCameraButton: function() {
    if (this.camera.supported()) {
      this.toolBars.showCameraButton();
    }
  },

  initializeAction: function(action) {
    this.toolBars.hideCameraButton();
    this.toolBars.showEndCaptureButton();
    this.toolBars.showStartCaptureButton();
  },

  submitGeometryAction: function(action) {
    this.toolBars.hideStartCaptureButton();
    this.toolBars.showEndCaptureButton();
    this.camera.enableCapture();
  },

  captureAction: function(action) {

  },

  finishAction: function(action) {
    this.enableCameraButton();
    this.toolBars.hideStartCaptureButton();
    this.toolBars.hideEndCaptureButton();
    this.board.displayCapturePattern = false;
  },

  getPatternSize: function() {
    return 4;
  },

  getPatternDimension: function() {
    return parseInt(this.board.viewPortSize[0] * 0.08);
  },

  sendAction: function(action) {
    action = attachActionMethods(action);
    this.boardDetectionActionManager.sendActionMessage(action);
  },

  receiveAction: function(action) {
    action = attachActionMethods(action);
    action.apply(this.board);
  }
});


// =================================================
// New Action Types
// =================================================
_.extend(actionMethods, {
  boardDetectionAction: {
    isBoardDetection: function() {
      return true;
    }
  },

  initializeBoardDetectionAction: {
    extend: function() { return "boardDetectionAction"; },
    apply: function (board) {
      board.boardDetectionManager.initializeAction(this);
    },
    validateData: function() {
      this.ensureFields(["uid"]);
    }
  },

  submitBoardDetectionGeometryAction: {
    extend: function() { return "boardDetectionAction"; },
    apply: function (board) {
      board.boardDetectionManager.submitGeometryAction(this);
    },
    validateDate: function() {
      this.ensureFields(["uid", "origin_x", "origin_y", "width", "height", "pattern_size", "pattern_dimension"]);
    }
  },

  captureBoardDetectionImageAction: {
    extend: function() { return "boardDetectionAction"; },
    apply: function(board) {
      board.boardDetectionManager.captureAction(this);
    },
    validateDate: function() {
      this.ensureFields(["uid", "image_data", "image_orientation"]);
    }
  },

  finishBoardDetectionAction: {
    extend: function() { return "boardDetectionAction"; },
    apply: function(board) {
      board.boardDetectionManager.finishAction(this);
    },
    validateDate: function() {
      this.ensureFields(["uid"]);
    }
  }
});