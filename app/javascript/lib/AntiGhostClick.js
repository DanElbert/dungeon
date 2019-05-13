const ANTI_GHOST_DELAY = 2000;

const POINTER_TYPE = {
  MOUSE: 0,
  TOUCH: 1
};

export function preventGhosts(element) {

  var latestInteractionType,
    latestInteractionTime;

  function handleTap(type, e) {
    // console.log('got tap ' + e.type + ' of pointer ' + type);

    var now = Date.now();

    if (type !== latestInteractionType) {

      if (now - latestInteractionTime <= ANTI_GHOST_DELAY) {
        // console.log('!prevented!');
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }

      latestInteractionType = type;
    }

    latestInteractionTime = now;
  }

  function attachEvents(eventList, interactionType) {
    eventList.forEach(function(eventName) {
      element.addEventListener(eventName, handleTap.bind(null, interactionType), true);
    });
  }

  var mouseEvents = ['mousedown', 'mouseup', 'mousemove'];
  var touchEvents = ['touchstart', 'touchend'];

  attachEvents(mouseEvents, POINTER_TYPE.MOUSE);
  attachEvents(touchEvents, POINTER_TYPE.TOUCH);
}

window.preventGhosts = preventGhosts;