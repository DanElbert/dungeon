import Vue from "vue";
import { Vector2 } from "./geometry";

const touchTapListenerKey = "__touchTapState";

function touchStartHandler(e) {
  const state = e.currentTarget[touchTapListenerKey];
  const targetTag = e.target.tagName.toLowerCase();
  if (state && e.targetTouches && e.targetTouches.length === 1 && targetTag !== "select" && targetTag !== "option" && targetTag !== "input" && targetTag !== "textarea") {
    state.tapTesting = true;
    state.tapStart = new Vector2(e.targetTouches[0].pageX, e.targetTouches[0].pageY);
    e.preventDefault();
    e.stopPropagation();
  }
}

function touchMoveHandler(e) {
  const state = e.currentTarget[touchTapListenerKey];
  if (state && state.tapTesting) {

    if (e.targetTouches.length !== 1) {
      state.tapTesting = false;
    } else {
      const newPoint = new Vector2(e.targetTouches[0].pageX, e.targetTouches[0].pageY);
      if (newPoint.distance(state.tapStart) > 5) {
        state.tapTesting = false;
      }
    }

  }
}

function touchEndHandler(e) {
  const state = e.currentTarget[touchTapListenerKey];
  if (state && state.tapTesting) {
    state.handler();
    state.tapTesting = false;
    e.preventDefault();
    e.stopPropagation();
  }
}

function touchCancelHandler(e) {
  const state = e.currentTarget[touchTapListenerKey];
  if (state && state.tapTesting) {
    state.tapTesting = false;
  }
}

function disableTouchTap(el) {
  const state = el[touchTapListenerKey];
  if (state) {
    el.removeEventListener("touchstart", touchStartHandler);
    el.removeEventListener("touchend", touchEndHandler);
    el.removeEventListener("touchmove", touchMoveHandler);
    el.removeEventListener("touchcancel", touchCancelHandler);
    delete el[touchTapListenerKey];
  }
}

function enableTouchTap(el, handler) {
  el[touchTapListenerKey] = {
    handler: handler,
    tapTesting: false,
    tapStart: null
  };

  el.addEventListener("touchstart", touchStartHandler);
  el.addEventListener("touchend", touchEndHandler);
  el.addEventListener("touchmove", touchMoveHandler);
  el.addEventListener("touchcancel", touchCancelHandler);
}

Vue.directive("touch-tap", {
  bind(el, binding) {
    const handler = binding.value;
    if (handler) {
      enableTouchTap(el, handler);
    }
  },

  update(el, binding) {
    const handler = binding.value;
    disableTouchTap(el);
    if (handler) {
      enableTouchTap(el, handler);
    }
  },

  unbind(el, binding) {
    disableTouchTap(el);
  }
});