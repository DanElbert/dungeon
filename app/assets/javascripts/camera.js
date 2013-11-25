function InitializeCameraApi() {
  var $camera = $("div#camera");
  var $display = $("#camera_display");
  var $begin_button = $("#camera_begin");
  var $capture_button = $("#camera_capture");
  var $quit_button = $("#camera_quit");
  var $select = $("#camera_select");
  var $snapshot = $("#camera_snapshot");

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
        console.log(_.pairs(sourceInfo));
        option.text(sourceInfo.label || 'camera ' + ($select.children().length + 1));
        $select.append(option);
      }
    }
  }

  if (typeof MediaStreamTrack === 'undefined'){
  } else {
    MediaStreamTrack.getSources(gotSources);
  }

  function successCallback(stream) {
    window.stream = stream; // make stream available to console
    $display[0].src = window.URL.createObjectURL(stream);
    $display[0].play();
  }

  function errorCallback(error){
    console.log("navigator.getUserMedia error: ", error);
  }

  function stop() {
    if (!!window.stream) {
      $display[0].src = null;
      window.stream.stop();
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
  }

  $begin_button.click(function() {
    start();
  });

  $quit_button.click(function() {
    stop();
  });

  $capture_button.click(function() {
    if (!!window.stream) {
      var canvas = $snapshot[0];
      var video = $display[0];
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      var ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      // "image/webp" works in Chrome.
      // Other browsers will fall back to image/png.
      console.log($snapshot[0].toDataURL('image/webp'));
    }
  });

  $camera.dialog();
}