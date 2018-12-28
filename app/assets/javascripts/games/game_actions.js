var RemovalAction = createActionType("RemovalAction", Action, {
  isRemoval: function() { return true; },
  validateData: function() {
    this.ensureFields(["actionId", "uid"]);
  }
});


// An action that is managed by the drawing layer.  Requires bounds and draw methods.
var DrawingAction = createActionType("DrawingAction", Action, {
  initialize: function(actionData) {
    Action.prototype.initialize.call(this, actionData);
    Object.defineProperty(this, "isPcLayer", { enumerable : true, get: function() { return this.properties.isPcLayer; }});
  },
  isPersistent: function() { return true; },
  apply: function(board) {
    board.drawingLayer.addAction(this);
  },

  // Returns the bounding box of the drawing action as an array of arrays as: [[LEFT, TOP], [RIGHT, BOTTOM]]
  bounds: function() {
    if (this.boundData == null) {
      var boundsArr = this.calculateBounds();
      this.boundData = new Rectangle(
        new Vector2(boundsArr[0][0], boundsArr[0][1]),
        boundsArr[1][0] - boundsArr[0][0],
        boundsArr[1][1] - boundsArr[0][1]
      )
    }
    return this.boundData;
  },

  calculateBounds: function() {
    return [[0,0], [1,1]];
  },

  // Given a drawing object, applies the drawing action to it
  draw: function(drawing) { }
});


var TemplateAction = createActionType("TemplateAction", Action, {
  isPersistent: function() { return true; },
});


_.extend(actionTypes, {
  labelAction: createActionType("LabelAction", DrawingAction, {
    draw: function(drawing) {
      drawing.drawLabel(
        this.properties.point,
        this.properties.text,
        this.properties.color,
        "rgba(0, 0, 0, 0.5)",
        this.properties.backgroundColor || "rgba(255, 255, 255, 0.25",
        this.properties.fontSize);
    },
    calculateBounds: function() {
      return this.properties.bound;
    },
    validateData: function() {
      this.ensureFields(["color", "text", "point", "bound", "uid"]);
    }
  }),

  // A pen action consists of a color, a width, and a collection of lines that are to be drawn on the drawing layer
  penAction: createActionType("PenAction", Action, {
    isPersistent: function() { return true; },
    apply: function(board) {
      board.drawingLayer.addAction(new PenDrawing(this.uid, board, this.properties.lines, this.properties.width, this.properties.color, this.properties.isPcLayer));
    },

    validateData: function() {
      this.ensureFields(["color", "width", "lines", "uid"]);
    }
  }),

  addFogPenAction: createActionType("AddFogPenAction", Action, {
    isPersistent: function() { return true; },
    apply: function(board) {
      board.drawingLayer.addFogAction(new PenDrawing(this.uid, board, this.properties.lines, this.properties.width, "black", false));
    },
    validateData: function() {
      this.ensureFields(["width", "lines", "uid"]);
    }
  }),

  // An remove fog action consists of a width, and a collection of lines that are to be drawn on the fog layer
  removeFogPenAction: createActionType("RemoveFogPenAction", Action, {
    isPersistent: function() { return true; },
    apply: function(board) {
      board.drawingLayer.addFogAction(new PenDrawing(this.uid, board, this.properties.lines, this.properties.width, -1, false));
    },
    validateData: function() {
      this.ensureFields(["width", "lines", "uid"]);
    }
  }),

  fogEverythingAction: createActionType("FogEverythingAction", Action, {
    isPersistent: function() { return true; },
    apply: function(board) {
      board.resetFog(true);
    },
    validateData: function() {
      this.ensureFields(["uid"]);
    }
  }),

  fogNothingAction: createActionType("FogNothingAction", Action, {
    isPersistent: function() { return true; },
    apply: function(board) {
      board.resetFog(false);
    },
    validateData: function() {
      this.ensureFields(["uid"]);
    }
  }),

  // Draws a square.  Requires topLeft, bottomRight, color, and width
  squarePenAction: createActionType("SquarePenAction", DrawingAction, {
    initialize: function(actionData) {
      this.super.initialize.apply(this, arguments);
    },
    draw: function(drawing) {
      drawing.drawSquare(this.properties.topLeft, this.properties.bottomRight, this.properties.color, this.properties.backgroundColor, this.properties.width);
    },

    calculateBounds: function() {
      var margin = parseInt(this.properties.width / 2);
      return [[this.properties.topLeft[0] - margin, this.properties.topLeft[1] - margin], [this.properties.bottomRight[0] + margin, this.properties.bottomRight[1] + margin]];
    },

    validateData: function() {
      this.ensureFields(["color", "width", "topLeft", "bottomRight", "uid"]);
    }
  }),

  // Draws a circle.  Requires center, radius, color, and width
  circlePenAction: createActionType("CirclePenAction", DrawingAction, {
    draw: function(drawing) {
      drawing.drawCircle(this.properties.center[0], this.properties.center[1], this.properties.radius, this.properties.width, this.properties.color, this.properties.backgroundColor);
    },

    calculateBounds: function() {
      var center = this.properties.center;
      var radius = this.properties.radius + parseInt(this.properties.width / 2);
      return [[center[0] - radius, center[1] - radius], [center[0] + radius, center[1] + radius]];
    },

    validateData: function() {
      this.ensureFields(["color", "width", "center", "radius", "uid"]);
    }
  }),

  // Draws a straight line.  Requires start, end, color, and width
  linePenAction: createActionType("LinePenAction", DrawingAction, {
    draw: function(drawing) {
      var lines = [{start: this.properties.start, end: this.properties.end}];
      drawing.drawLines(this.properties.color, this.properties.width, lines);
    },

    calculateBounds: function() {
      var start = this.properties.start;
      var end = this.properties.end;
      var margin = parseInt(this.properties.width / 2);
      var t = Math.min(start[1], end[1]);
      var l = Math.min(start[0], end[0]);
      var b = Math.max(start[1], end[1]);
      var r = Math.max(start[0], end[0]);
      return [[l - margin, t - margin], [r + margin, b + margin]];
    },

    validateData: function() {
      this.ensureFields(["color", "width", "start", "end", "uid"]);
    }
  }),

  pasteAction: createActionType("PasteAction", DrawingAction, {
    draw: function(drawing) {
      drawing.drawImage(this.properties.topLeft[0], this.properties.topLeft[1], this.properties.url)
    },

    calculateBounds: function() {
      var topLeft = this.properties.topLeft;
      return [topLeft, [topLeft[0] + this.properties.width, topLeft[1] + this.properties.height]];
    },

    validateData: function() {
      this.ensureFields(["uid", "url", "topLeft", "width", "height"]);
    }
  }),

  insertImageAction: createActionType("InsertImageAction", Action, {
    isPersistent: function() { return true; },
    apply: function(board) {
      var drawing = ImageDrawing.getImageDrawing(
        this.uid,
        board,
        this.properties.url,
        new Vector2(this.properties.width, this.properties.height),
        new Vector2(this.properties.center[0], this.properties.center[1]),
        this.properties.scale,
        this.properties.angle
      );

      board.drawingLayer.addAction(drawing);
    },

    validateData: function() {
      this.ensureFields(["uid", "url", "center", "width", "height", "scale", "angle"]);
    }
  }),

  // An erase action consists of a width and a collection of lines
  eraseAction: createActionType("EraseAction", Action, {
    isPersistent: function() { return true; },
    apply: function(board) {
      board.drawingLayer.addAction(new PenDrawing(this.uid, board, this.properties.lines, this.properties.width, -1, this.properties.isPcLayer));
    },

    validateData: function() {
      this.ensureFields(["width", "lines", "uid"]);
    }
  }),

  // References a drawing action to remove
  removeDrawingAction: createActionType("RemoveDrawingAction", RemovalAction, {
    apply: function(board) {
      board.drawingLayer.removeAction(this.properties.actionId);
    }
  }),

  // References a drawing action to remove
  removeFogAction: createActionType("RemoveFogAction", RemovalAction, {
    apply: function(board) {
      board.drawingLayer.removeAction(this.properties.actionId);
    }
  }),

  removeTemplateAction: createActionType("RemoveTemplateAction", RemovalAction, {
    apply: function(board) {
      board.templateLayer.removeTemplate(this.properties.actionId);
    }
  }),

  movementTemplateAction: createActionType("MovementTemplateAction", TemplateAction, {
    apply: function(board) {
      var p, delta;
      if (this.version === 0) {
        p = Geometry.getCellMidpoint(this.properties.start, board.drawingSettings.cellSize);
        delta = [this.properties.end[0] - this.properties.start[0], this.properties.end[1] - this.properties.start[1]];
      } else {
        p = this.properties.position;
        delta = this.properties.cellDelta;
      }
      var t = new PathfinderMovementTemplate(
        this.properties.uid,
        board,
        new Vector2(p),
        this.properties.color,
        new Vector2(delta)
      );

      board.templateLayer.addTemplate(t);
    },

    validateData: function() {
      this.ensureVersionedFields({
        0: ["color", "uid", "start", "end"],
        1: ["color", "uid", "position", "cellDelta"]
      });
    }
  }),

  radiusTemplateAction: createActionType("RadiusTemplateAction", TemplateAction, {
    apply: function(board) {
      var p;
      if (this.version === 0) {
        p = Geometry.getCellMidpoint(this.properties.intersection, board.drawingSettings.cellSize);
      } else {
        p = this.properties.position;
      }
      var t = new PathfinderRadiusTemplate(
        this.properties.uid,
        board,
        new Vector2(p),
        this.properties.color,
        this.properties.radius
      );

      board.templateLayer.addTemplate(t);
    },

    validateData: function() {
      this.ensureVersionedFields({
        0: ["intersection", "radius", "color", "uid"],
        1: ["position", "radius", "color", "uid"]
      });
    }
  }),

  lineTemplateAction: createActionType("LineTemplateAction", TemplateAction, {
    apply: function(board) {
      var p, delta;
      if (this.version === 0) {
        p = this.properties.start;
        delta = [this.properties.end[0] - this.properties.start[0], this.properties.end[1] - this.properties.start[1]];
      } else {
        p = this.properties.position;
        delta = this.properties.delta;
      }
      var t = new PathfinderLineTemplate(
        this.properties.uid,
        board,
        new Vector2(p),
        this.properties.color,
        new Vector2(delta)
      );

      board.templateLayer.addTemplate(t);
    },

    validateData: function() {
      this.ensureVersionedFields({
        0: ["start", "end", "color", "uid"],
        1: ["position", "delta", "color", "uid"]
      });
    }
  }),

  coneTemplateAction: createActionType("ConeTemplateAction", TemplateAction, {
    apply: function(board) {
      var p, r;
      if (this.version === 0) {
        p = Geometry.getCellMidpoint(this.properties.intersection, board.drawingSettings.cellSize);
        r = this.properties.radius;
      } else {
        p = this.properties.position;
        r = this.properties.cellRadius;
      }

      var t = new PathfinderConeTemplate(
        this.properties.uid,
        board,
        new Vector2(p),
        this.properties.color,
        r,
        this.properties.angle
      );

      board.templateLayer.addTemplate(t);
    },

    validateData: function() {
      this.ensureVersionedFields({
        0: ["intersection", "radius", "angle", "color", "uid"],
        1: ["position", "cellRadius", "angle", "color", "uid"]
      });
    }
  }),

  rectangleTemplateAction: createActionType("RectangleTemplateAction", TemplateAction, {
    apply: function(board) {
      var p, delta;
      if (this.version === 0) {
        p = Geometry.getCellMidpoint(this.properties.topLeft, board.drawingSettings.cellSize);
        delta = [this.properties.bottomRight[0] - this.properties.topLeft[0], this.properties.bottomRight[1] - this.properties.topLeft[1]]
      } else {
        p = this.properties.position;
        delta = this.properties.cellDelta;
      }

      var t = new PathfinderRectangleTemplate(
        this.properties.uid,
        board,
        new Vector2(p),
        this.properties.color,
        new Vector2(delta)
      );

      board.templateLayer.addTemplate(t);
    },

    validateData: function() {
      this.ensureVersionedFields({
        0: ["topLeft", "bottomRight", "color", "uid"],
        1: ["position", "cellDelta", "color", "uid"]
      });
    }
  }),

  reachTemplateAction: createActionType("ReachTemplateAction", TemplateAction, {
    apply: function(board) {
      var p;
      if (this.version === 0) {
        p = this.properties.anchor;
      } else {
        p = this.properties.position;
      }
      var t = new PathfinderReachTemplate(
        this.properties.uid,
        board,
        new Vector2(p),
        this.properties.color,
        this.properties.size,
        this.properties.reach
      );

      board.templateLayer.addTemplate(t);
    },

    validateData: function() {
      this.ensureVersionedFields({
        0: ["anchor", "size", "reach", "color", "uid"],
        1: ["position", "size", "reach", "color", "uid"]
      });
    }
  }),

  overlandMeasureTemplateAction: createActionType("OverlandMeasureTemplateAction", TemplateAction, {
    apply: function(board) {
      var t = new OverlandMeasureTemplate(
        this.properties.uid,
        board,
        new Vector2(this.properties.position),
        this.properties.color,
        new Vector2(this.properties.delta)
      );

      board.templateLayer.addTemplate(t);
    },

    validateData: function() {
      this.ensureFields(["position", "delta", "color", "uid"]);
    }
  }),

  pingAction: createActionType("PingAction", Action, {
    apply: function(board) {
      board.pingLayer.add(this.properties.point, this.properties.color);
    },
    validateData: function() {
      this.ensureFields(["uid", "point", "color"])
    }
  }),

  addTokenAction: createActionType("AddTokenAction", Action, {
    isPersistent: function() { return true; },
    apply: function(board) {
      var p, s;
      if (this.version === 0) {
        var cell = this.properties.cell;
        p = [cell[0] * board.drawingSettings.cellSize, cell[1] * board.drawingSettings.cellSize];
        s = this.properties.width;
      } else {
        p = this.properties.position;
        s = this.properties.tokenCellSize;
      }
      var t = new TokenDrawing(
        this.uid,
        board,
        new Vector2(p),
        s,
        this.properties.color,
        this.properties.fontColor,
        this.properties.fontSize,
        this.properties.text
      );
      board.tokenLayer.addToken(t);
    },
    validateData: function() {
      this.ensureVersionedFields({
        0: ["uid", "cell", "height", "width", "color", "text", "fontSize", "fontColor"],
        1: ["uid", "position", "tokenCellSize", "color", "fontColor", "fontSize", "text"]
      });
    }
  }),

  // References a drawing action to remove
  removeTokenAction: createActionType("RemoveTokenAction", RemovalAction, {
    apply: function(board) {
      board.tokenLayer.removeToken(this.properties.actionId);
    }
  }),

  setTokensAction: createActionType("SetTokensAction", Action, {
  }),

  clearTokensAction: createActionType("SetTokensAction", Action, {
  }),

  // setTokensAction: createActionType("SetTokensAction", Action, {
  //   isPersistent: function() { return true; },
  //   apply: function(board) {
  //     board.tokenLayer.setTokens(this.properties.tokens);
  //   },
  //   validateData: function() {
  //     this.ensureFields(["uid", "tokens"]);
  //   }
  // }),
  //
  // clearTokensAction: createActionType("ClearTokensAction", Action, {
  //   isPersistent: function() { return true; },
  //   apply: function(board) {
  //     board.tokenLayer.clearTokens();
  //     //board.toolBars.hideClearTokensButton();
  //   },
  //   validateData: function() {
  //     this.ensureFields(["uid"]);
  //   }
  // }),

  viewPortSyncAction: createActionType("ViewPortSyncAction", Action, {
    apply: function(board) {
      board.viewPortManager.handleViewPortAction(this);
    },
    validateData: function() {
      this.ensureFields(["uid", "zoom", "x", "y"]);
    }
  })
});

