function InitializeToolBarsApi() {

  var api = {
    getTool: function() {
      return $("#tool_menu").toolMenu("value");
    },
    getColor: function() {
      return $("#tool_color").toolMenu("value").color;
    },
    getLineWidth: function() {
      return $("#tool_line_width").toolMenu("value");
    },
    getFogLineWidth: function() {
      return $("#fog_tool_line_width").toolMenu("value");
    },
    getZoom: function() {
      return parseFloat($("#zoom_level").val());
    },
    setZoom: function(val) {
      $("#zoom_level").val(val);
      $("#zoom_slider").slider("value", val);
    },
    setStandardLineWidths: function() {
      $("#tool_line_width").show();
      $("#fog_tool_line_width").hide();
    },
    setFogLineWidths: function() {
      $("#tool_line_width").hide();
      $("#fog_tool_line_width").show();
    },
    showStartCaptureButton: function() {
      $("#enable_capture_button").show();
    },
    hideStartCaptureButton: function() {
      $("#enable_capture_button").hide();
    },
    showEndCaptureButton: function() {
      $("#end_capture_button").show();
    },
    hideEndCaptureButton: function() {
      $("#end_capture_button").hide();
    },
    showCameraButton: function() {
      $("#open_camera_button").show();
    },
    hideCameraButton: function() {
      $("#open_camera_button").hide();
    },
    showClearTokensButton: function() {
      $("#clear_tokens_button").show();
    },
    hideClearTokensButton: function() {
      $("#clear_tokens_button").hide();
    },
    hideFogTools: function() {
      $("#tool_menu").toolMenu("setValues", getTools(false));
    }
  };

  function getTools(includeFog) {
    var tools = ["Pointer", "Pen", "LinePen", "Label", "Square", "Circle", "Eraser", "Measure", "Radius", "Cone", "Line", "Ping"];

    if (includeFog) {
      tools = tools.concat(["Add Fog", "Remove Fog"]);
    }
    return tools;
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

  function triggerCaptureStart() {
    var e = $.Event('startBoardCapture', {});
    $(api).trigger(e);
  }

  function triggerEndCapture() {
    var e = $.Event('stopBoardCapture', {});
    $(api).trigger(e);
  }

  function triggerOpenCamera() {
    var e = $.Event('openCamera', {});
    $(api).trigger(e);
  }

  function triggerClearTokens() {
    var e = $.Event("clearTokens", {});
    $(api).trigger(e);
  }

  $("#tool_menu").toolMenu({
    values: getTools(true),
    initialValue: "Pointer",
    contentCallback: function(value) {
      return value;
    },
    selectedCallback: function(value) {
      triggerToolChanged();
    }
  });

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

//  var dansRandomColors = [
//    {name: "Red", color: "#FF0000"},
//    {name: "Yellow", color: "#FFFF00"},
//    {name: "Green", color: "#01DF01"},
//    {name: "Blue", color: "#0000FF"},
//    {name: "Black", color: "#000000"}
//  ];

  $("#tool_color").toolMenu({
    values: crayolaColors8,
    initialValue: crayolaColors8[0],
    contentCallback: function(value) {
      return $("<div></div>").css("background-color", value.color).css('width', '100%').css('height', '100%');
    },
    selectedCallback: function(value) {
      triggerToolChanged();
    }
  });

  $("#tool_line_width").toolMenu({
    values: [1, 3, 5, 7, 10, 15],
    initialValue: 3,
    contentCallback: function(value) {
      var wrapper = $("<div></div>").css({width: "100%", height: "100%"});
      var floater = $("<div></div>").css({float: "left", height: "50%", marginBottom: "-" + value / 2 + "px"});
      var line = $("<div></div>").css({clear: "both", height: value + "px", position: "relative", backgroundColor: "black"});
      wrapper.append(floater);
      wrapper.append(line);
      return wrapper;
    },
    selectedCallback: function(value) {
      triggerToolChanged();
    }
  });

  $("#fog_tool_line_width").toolMenu({
    values: [25, 75, 100, 200, 500],
    initialValue: 75,
    contentCallback: function(value) {
      var wrapper = $("<div></div>").css({width: "100%", height: "100%"});
      var floater = $("<div></div>").css({float: "left", height: "50%", marginBottom: "-" + (value / 25) / 2 + "px"});
      var line = $("<div></div>").css({clear: "both", height: (value / 25) + "px", position: "relative", backgroundColor: "black"});
      wrapper.append(floater);
      wrapper.append(line);
      return wrapper;
    },
    selectedCallback: function(value) {
      triggerToolChanged();
    }
  });

  $("#zoom_level").change(function () {
    triggerZoomChanged($(this).val());
  });

  $("#undo_button").click(function() {
    triggerUndo();
  });

  $("#enable_capture_button").click(function() {
    triggerCaptureStart();
  });

  $("#end_capture_button").click(function() {
    triggerEndCapture();
  });

  $("#open_camera_button").click(function() {
    triggerOpenCamera();
  });

  $("#clear_tokens_button").click(function() {
    triggerClearTokens();
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