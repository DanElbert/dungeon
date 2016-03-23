window.toggleDungeonFullscreen = (function($) {

  function fullscreenAvailable() {
    return document.fullscreenEnabled ||
      document.webkitFullscreenEnabled ||
      document.mozFullScreenEnabled ||
      document.msFullscreenEnabled;
  }

  function isFullscreen() {
    return document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement;
  }

  function enableFullscreen() {

    var element = document.documentElement;

    if(element.requestFullscreen) {
      element.requestFullscreen();
    } else if(element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if(element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    } else if(element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }
  }

  function cancelFullscreen() {
    if(document.exitFullscreen) {
      document.exitFullscreen();
    } else if(document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if(document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }

  return function() {
    if (fullscreenAvailable()) {
      if (isFullscreen()) {
        cancelFullscreen();
      } else {
        enableFullscreen();
      }
    }
  }

})(jQuery);