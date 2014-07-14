function InitializeToolBarsApi() {

  var toolConfig = [
    {name: "View", tools: [
      {name: "Pointer"},
      {name: "Ping"},
      {name: "Camera", type: "event", eventName: "openCamera"},
      {name: "Begin Capture", type: "event", eventName: "startBoardCapture", hidden: true},
      {name: "End Capture", type: "event", eventName: "stopBoardCapture", hidden: true},
      {name: "Clear Tokens", type: "event", eventName: "clearTokens", hidden: true},
      {name: "Zoom", type: "zoom"}
    ]},

    {name: "Draw", tools: [
      {name: "Pen"},
      {name: "Line Pen"},
      {name: "Square"},
      {name: "Circle"},
      {name: "Label"},
      {name: "Eraser"},
      {name: "Copy"},
      {name: "Paste", hidden: true}
    ]},

    {name: "Templates", tools: [
      {name: "Measure"},
      {name: "Radius"},
      {name: "Cone"},
      {name: "Line"}
    ]},

    {name: "Fog", tools: [
      {name: "Add Fog"},
      {name: "Remove Fog"}
    ]}
  ];

  var toolBuilders = {
    toolButton: function(tool) {
      return $("<a></a>")
          .addClass("tool")
          .addClass("button")
          .html(tool.name)
          .click(function() { selectTool(tool.name); return false; });
    },

    zoom: function(tool) {
      // This is kind of hacky.  These IDs are referenced in other places; should probably try to generalize this somehow
      var $wrapper = $('<div></div>').addClass("zoomWrapper").css({float: 'left'});
      $('<div style="float: left;"><label id="zoom_level_label" for="zoom_level">Zoom:</label><input type="text" id="zoom_level" /></div>').appendTo($wrapper);
      $('<div style="float: left; margin-left: 20px;"><div id="zoom_slider"></div></div>').appendTo($wrapper);
      $('<br style="clear: both;" />').appendTo($wrapper);
      return $wrapper;
    },

    event: function(tool) {
      return $("<a></a>")
          .addClass("tool")
          .addClass("button")
          .html(tool.name)
          .click(function() { triggerEvent(tool.eventName, {}); return false; });
    }
  };

  var optionBuilders = {
    color: function(option) {
      var crayolaColors8 = [
        {name: "Black", color: "#000000"},
        {name: "Blue", color: "#1F75FE"},
        {name: "Brown", color: "#B4674D"},
        {name: "Green", color: "#1CAC78"},
        {name: "Orange", color: "#FF7538"},
        {name: "Red", color: "#EE204D"},
        {name: "Purple", color: "#926EAE"},
        {name: "Yellow", color: "#FCE883"}
      ];

      var clear = {name: "Clear", color: null};

      if (option.includeClear) {
        crayolaColors8.unshift(clear);
      }

      var $widget = $('<div></div>').addClass('toolMenu');
      var vals = _.map(crayolaColors8, function(c) { return c.color; });

      $widget.toolMenu({
        values: vals,
        initialValue: option.value || crayolaColors8[0].color,
        contentCallback: function(value) {
          var $content = $("<div></div>").css('width', '100%').css('height', '100%');
          if (value == null) {
            $content.css("background-color", "white");
          } else {
            $content.css("background-color", value);
          }
          return $content;
        },
        selectedCallback: function(value) {
          triggerOptionChanged(option.name, value);
        }
      });

      return $widget;
    },

    size: function(option) {

      var $widget = $('<div></div>').addClass('toolMenu');

      var maxHeight = 20;
      var minHeight = 3;

      var maxSize = -1;
      var minSize = 99999;
      _.each(option.sizes, function(s) {
        if (s > maxSize) maxSize = s;
        if (s < minSize) minSize = s;
      });

      var heightMap = {};
      _.each(option.sizes, function(s) {
        var dist = (s - minSize) / (maxSize - minSize);
        heightMap[s] = (minHeight + ((maxHeight - minHeight) * dist))>>0;
      });

      $widget.toolMenu({
        values: option.sizes,
        initialValue: option.value,
        contentCallback: function(value) {
          var wrapper = $("<div></div>").css({width: "100%", height: "100%"});
          var floater = $("<div></div>").css({float: "left", height: "50%", marginBottom: "-" + heightMap[value] / 2 + "px"});
          var line = $("<div></div>").css({clear: "both", height: heightMap[value] + "px", position: "relative", backgroundColor: "black"});
          wrapper.append(floater);
          wrapper.append(line);
          return wrapper;
        },
        selectedCallback: function(value) {
          triggerOptionChanged(option.name, value);
        }
      });

      return $widget;
    },

    copiedImage: function(options) {
      var $wrapper = $("<div/>");

      if (options.url) {
        $wrapper.addClass("tool");
        var $widget = $("<div/>").css("background-image", "url(\"" + options.url + "\")").addClass("img");
        $wrapper.append($widget);
      }

      return $wrapper;
    }
  };

  var $ribbon = $("#tool_ribbon");
  var $tabStrip = $("<div></div>")
      .addClass("tab_strip")
      .appendTo($ribbon);

  var $tabContents = $("<div></div>")
      .addClass("tab_contents")
      .appendTo($ribbon);

  var $tabs = $("<ul></ul>")
      .addClass("tabs")
      .appendTo($tabStrip);

  $ribbon.append($('<div></div>').css({'clear': 'both'}));

  var $currentTool = $("#current_tool");
  var $toolOptions = $("#tool_options");

  var toolMap = {};
  var tabMap = {};
  var currentTool = null;
  var currentOptions = null;

  _.each(toolConfig, function(tab, index) {

    var $content = $("<div></div>")
        .hide()
        .addClass("ribbon_panel")
        .appendTo($tabContents);

    var $li = $("<li></li>")
        .data("tabName", tab.name)
        .data("content", $content)
        .html(tab.name)
        .appendTo($tabs);

    tabMap[tab.name] = $li;

    _.each(tab.tools, function(tool) {

      var toolType = tool.type || "toolButton";
      var widget = toolBuilders[toolType](tool);
      toolMap[tool.name] = widget;
      widget.appendTo($content);

      if (tool.hidden) {
        widget.hide();
      }

    });

    $content.append($("<br/>").css({clear: "both"}));
  });

  $tabStrip.append($("<br/>").css({clear: "both"}));

  $ribbon.on("click", ".tabs li", function() {
    selectTab($(this).data("tabName"));
  });

  selectTab(toolConfig[0].name);
  selectTool(toolConfig[0].tools[0].name);

  function selectTab(name) {
    var $lis = $ribbon.find(".tabs li");
    var $contents = $ribbon.find("div.ribbon_panel").hide();
    $lis.removeClass("selected");
    $lis.each(function() {
      var $this = $(this);
      if ($this.data("tabName") == name) {
        $this.addClass("selected");
        $this.data("content").show();
      }
    });
  }

  function selectTool(name) {
    $currentTool.html(name);
    currentTool = name;

    _.each(toolMap, function(widget, toolName) {
      if (toolName == name) {
        widget.addClass("pressed");
      } else {
        widget.removeClass("pressed");
      }
    });

    triggerToolChanged();
  }

  function buildOptions(options) {
    clearOptions();
    currentOptions = options;
    options.each(function(opt) {
      var widget = optionBuilders[opt.type](opt);
      var label = $("<span></span>").addClass("optionLabel").html(opt.label);
      var wrapper = $("<div></div>").append(label).append(widget);
      $toolOptions.append(wrapper);
    }, this);
  }

  function clearOptions() {
    currentOptions = null;
    $toolOptions.empty();
  }

  var api = {
    getTool: function() {
      return currentTool;
    },
    setOptions: function(options) {
      buildOptions(options);
    },
    getZoom: function() {
      return parseFloat($("#zoom_level").val());
    },
    setZoom: function(val) {
      $("#zoom_level").val(val);
      $("#zoom_slider").slider("value", val);
    },
    showStartCaptureButton: function() {
      toolMap["Begin Capture"].show();
    },
    hideStartCaptureButton: function() {
      toolMap["Begin Capture"].hide();
    },
    showEndCaptureButton: function() {
      toolMap["End Capture"].show();
    },
    hideEndCaptureButton: function() {
      toolMap["End Capture"].hide();
    },
    showCameraButton: function() {
      toolMap["Camera"].show();
    },
    hideCameraButton: function() {
      toolMap["Camera"].hide();
    },
    showClearTokensButton: function() {
      toolMap["Clear Tokens"].show();
    },
    hideClearTokensButton: function() {
      toolMap["Clear Tokens"].hide();
    },
    hideFogTools: function() {
      tabMap["Fog"].hide();
    },
    showPasteTool: function() {
      toolMap["Paste"].show();
    },
    hidePasteTool: function() {
      toolMap["Paste"].hide();
    }
  };

  function ToolOptions() {
    this.lineSize = null;
    this.foreColor = null;
    this.backColor = null;
    
  }

  function triggerToolChanged() {
    var e = $.Event('toolchanged', {});
    $(api).trigger(e);
  }

  function triggerUndo() {
    var e = $.Event('undo', {});
    $(api).trigger(e);
  }

  function triggerZoomChanged(val) {
    var e = $.Event('zoomchanged', {
      value: parseFloat(val)
    });
    $(api).trigger(e);
  }

  function triggerOptionChanged(name, value) {
    if (currentOptions) {
      var opt = currentOptions.get(name);
      var oldValue = opt.value;
      opt.value = value;
      var e = $.Event('changed', {name: name, oldValue: oldValue});
      $(currentOptions).trigger(e);
    }
  }

  function triggerEvent(name, options) {
    var e = $.Event(name, options || {});
    $(api).trigger(e);
  }



  $("#zoom_level").change(function () {
    triggerZoomChanged($(this).val());
  });

  $("#undo_button").click(function() {
    triggerUndo();
  });

  $("#zoom_slider").slider({
    orientation:"horizontal",
    range:false,
    animate:true,
    min:0.3,
    max:2.5,
    step:0.1,
    value:1,
    slide:function (event, ui) {
      $("#zoom_level").val(ui.value).change();
    }
  });
  $("#zoom_level").val($("#zoom_slider").slider("value"));


  return api;
}