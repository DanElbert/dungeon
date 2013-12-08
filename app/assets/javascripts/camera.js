function InitializeCameraApi() {
  var $camera = $("div#camera");
  var $display = $("#camera_display");
  var $begin_button = $("#camera_begin");
  var $capture_button = $("#camera_capture");
  var $quit_button = $("#camera_quit");
  var $select = $("#camera_select");
  var $snapshot = $("#camera_snapshot");
  var $controls = $("#camera_controls");

  var hasSources = false;
  var manual_close = false;
  var self = this;

  navigator.getUserMedia  = navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.msGetUserMedia;

  function gotSources(sourceInfos) {
    for (var i = 0; i != sourceInfos.length; ++i) {
      var sourceInfo = sourceInfos[i];
      var option = $("<option />");
      option.attr('value', sourceInfo.id);
      if (sourceInfo.kind === 'video') {
        hasSources = true;
        option.text(sourceInfo.label || 'camera ' + ($select.children().length + 1));
        $select.append(option);
      }
    }

    triggerSupportedStateChange();
  }

  if (typeof MediaStreamTrack !== 'undefined' && MediaStreamTrack.getSources){
    MediaStreamTrack.getSources(gotSources);
  }

  $capture_button.hide();

  var api = {
    open: function(width, height) {
      $camera.dialog("open");

      var max_width = $display.width() + $controls.width();
      var max_height = $display.height() + $controls.height();
      if (width > max_width) {
        width = max_width + 75;
      }

      if (height > max_height) {
        height = max_height + 75;
      }

      if (height < ($display.height() + 50)) {
        height = $display.height() + 75;
      }

      if (width < $display.width()) {
        width = $display.width();
      }

      $camera.dialog("option", {width: width, height: height});
    },

    close: function() {
      manual_close = true;
      $camera.dialog("close");
      manual_close = false;
    },

    showWaitMessage: function(msg) {
      var pos = $.extend({
        width: $camera.outerWidth(),
        height: $camera.outerHeight()
      }, $camera.position());
      var $cover = $("<div></div>", {
        class: 'waitMessage',
        css: {
          position: 'absolute',
          width: pos.width,
          height: pos.height,
          backgroundColor: '#000',
          opacity:.8,
          'z-index': 200,
          color: '#FFFFFF',
          padding: '30px',
          'font-size': "50px"
        }
      });
      $cover.html(msg);
      $cover.appendTo($camera);
    },

    clearWaitMessage: function () {
      $camera.find(".waitMessage").remove();
    },

    enableCapture: function() {
      $capture_button.show();
    },

    disableCapture: function() {
      $capture_button.hide();
    },

    supported: function() {
      return navigator.getUserMedia && hasSources;
    }
  };

  function triggerClosed() {
    var e = $.Event('close', {});
    $(api).trigger(e);
  }

  function triggerStart() {
    var e = $.Event('start', {});
    $(api).trigger(e);
  }

  function triggerSupportedStateChange() {
    var e = $.Event('supportedChanged', {});
    $(api).trigger(e);
  }

  function triggerCapture(orientation, data) {
    var e = $.Event('capture', {
      image_data: data,
      image_orientation: orientation
    });
    $(api).trigger(e);
  }

  function successCallback(stream) {
    window.stream = stream; // make stream available to console
    $display[0].autoplay = true;
    $display[0].src = window.URL.createObjectURL(stream);
  }

  function errorCallback(error){
    console.log("navigator.getUserMedia error: ", error);
  }

  function stop() {
    if (!!window.stream) {
      $display[0].src = null;
      window.stream.stop();
      window.stream = null;
    }
  }

  function start(){
    stop();
    var videoSource = $select.val();
    var constraints = {
      video: {
        optional: [{sourceId: videoSource}]
      }
    };
    navigator.getUserMedia(constraints, successCallback, errorCallback);

    triggerStart();
  }

  $begin_button.click(function() {
    start();
  });

  $quit_button.click(function() {
    stop();
    $camera.dialog("close");
  });

  $camera.dialog({
    close: function( event, ui ) {
      stop();
      if (!manual_close) {
        triggerClosed();
      }
    },
    autoOpen: false
  });

  $capture_button.click(function() {
    if (!!window.stream) {
      var canvas = $snapshot[0];
      var video = $display[0];
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      var ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);

      triggerCapture(0, $snapshot[0].toDataURL('image/png'));
    }
  });

  return api;
}