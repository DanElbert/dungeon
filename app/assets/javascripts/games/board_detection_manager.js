
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
function BoardDetectionManager(board, toolManager, camera, gameClient) {
  this.board = board;
  this.toolManager = toolManager;
  this.camera = camera;

  // Hide camera button by default
  this.toolManager.hideCameraButton();

  var self = this;

  this.boardDetectionActionManager = new ActionMessenger(gameClient, '/game/' + GAME_ID + '/board_detection', function(message) {
    self.receiveAction(message);
  });
  this.boardDetectionActionManager.connect();

  $(this.toolManager).on('startBoardCapture', function(e) {
    var size = parseInt(self.getPatternDimension());
    var origin_x = board.getViewPortCoordinates()[0];
    var origin_y = board.getViewPortCoordinates()[1];

    self.addAction({
          actionType: "submitBoardDetectionGeometryAction",
          uid: generateActionId(),
          origin_x: origin_x,
          origin_y: origin_y,
          width: board.getViewPortSize()[0],
          height: board.getViewPortSize()[1],
          pattern_size: self.getPatternSize(),
          pattern_dimension: size});

    self.board.displayCapturePattern = true;

    self.toolBars.hideStartCaptureButton();
  });

  $(this.toolManager).on('stopBoardCapture', function(e) {
    var action = {actionType: "finishBoardDetectionAction", uid: generateActionId() };
    self.addAction(action);
  });

  $(this.toolManager).on('openCamera', function(e) {
    self.toolBars.hideCameraButton();
    var width = parseInt(self.board.canvas.width * 0.9);
    var height = parseInt(self.board.canvas.height * 0.9);
    self.camera.open(width, height);
    self.addAction({actionType: "initializeBoardDetectionAction", uid: generateActionId()}, null, true, true);
  });

  $(this.camera).on('capture', function(e) {
    self.addAction({actionType: "captureBoardDetectionImageAction", uid: generateActionId(), image_data: e.image_data, image_orientation: e.image_orientation}, null, true, true);
  });

  $(this.camera).on('close', function(e) {
    var action = {actionType: "finishBoardDetectionAction", uid: generateActionId() };
    self.addAction(action);
  });

  $(this.camera).on('supportedChanged', function() {
    self.enableCameraButton();
  });

  this.enableCameraButton();
}

_.extend(BoardDetectionManager.prototype, {
  enableCameraButton: function() {
    if (this.camera.supported()) {
      this.toolManager.showCameraButton();
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
    this.camera.showWaitMessage("Processing...");
  },

  detectionResultsAction: function(action) {
    this.toolBars.showClearTokensButton();
    this.camera.clearWaitMessage();

    var results = action.properties.results;

    if (!results.was_board_found) {
      this.board.addAction({actionType: "alertAction", type: "error", message: "Unable to find board", uid: generateActionId()}, null, false);
    } else if (results.items.length == 0) {
      this.board.addAction({actionType: "alertAction", type: "warning", message: "No items on board", uid: generateActionId()}, null, false);
    } else {
      var count = results.items.length;
      this.board.addAction({actionType: "alertAction", type: "notice", message: count + " items marked", uid: generateActionId()}, null, false);
      this.board.addAction({actionType: "setTokensAction", tokens: results.items, uid: generateActionId()}, null, false);

      _.each(results.items, function(item) {
        this.board.addAction({actionType: "pingAction", point: [item.raw_x, item.raw_y], color: "rgba(255, 0, 0, 1.0)", uid: generateActionId()}, null, false);
      }, this);
    }
  },

  finishAction: function(action) {
    this.enableCameraButton();
    this.toolBars.hideStartCaptureButton();
    this.toolBars.hideEndCaptureButton();
    this.board.displayCapturePattern = false;
    this.camera.disableCapture();
    this.camera.close();
  },

  getPatternSize: function() {
    return 4;
  },

  getPatternDimension: function() {
    return parseInt(this.board.getViewPortSize()[0] * 0.08);
  },

  addAction: function(action) {
    action = attachActionMethods(action);
    action.apply(this.board);
    this.boardDetectionActionManager.sendActionMessage(action.serialize());
  },

  receiveAction: function(action) {
    action = attachActionMethods(action);
    action.apply(this.board);
  }
});


// =================================================
// New Action Types
// =================================================
var BoardDetectionAction = createActionType("BoardDetectionAction", Action, {
  isBoardDetection: function() {
    return true;
  }
});


_.extend(actionTypes, {
  initializeBoardDetectionAction: createActionType("InitializeBoardDetectionAction", BoardDetectionAction, {
    apply: function (board) {
      board.boardDetectionManager.initializeAction(this);
    },
    validateData: function() {
      this.ensureFields(["uid"]);
    }
  }),

  submitBoardDetectionGeometryAction: createActionType("SubmitBoardDetectionGeometryAction", BoardDetectionAction, {
    apply: function (board) {
      board.boardDetectionManager.submitGeometryAction(this);
    },
    validateDate: function() {
      this.ensureFields(["uid", "origin_x", "origin_y", "width", "height", "pattern_size", "pattern_dimension"]);
    }
  }),

  captureBoardDetectionImageAction: createActionType("CaptureBoardDetectionImageAction", BoardDetectionAction, {
    apply: function(board) {
      board.boardDetectionManager.captureAction(this);
    },
    validateDate: function() {
      this.ensureFields(["uid", "image_data", "image_orientation"]);
    }
  }),

  boardDetectionResultsAction: createActionType("BoardDetectionResultsAction", BoardDetectionAction, {
    apply: function(board) {
      board.boardDetectionManager.detectionResultsAction(this);
    },
    validateDate: function() {
      this.ensureFields(["uid", "results"]);
    }
  }),

  finishBoardDetectionAction: createActionType("FinishBoardDetectionAction", BoardDetectionAction, {
    apply: function(board) {
      board.boardDetectionManager.finishAction(this);
    },
    validateDate: function() {
      this.ensureFields(["uid"]);
    }
  })
});
