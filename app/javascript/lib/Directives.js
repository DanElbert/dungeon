
import Vue from "vue";
import bsn from "bootstrap.native/dist/bootstrap-native-v4";

Vue.directive("tooltip", {
  bind(el, binding) {
    new bsn.Tooltip(el, {
      delay: 10
    });
  },

  update(el, binding) {
  },

  componentUpdated(el, binding) {

  },

  unbind(el, binding) {
    if (el.Tooltip) {
      el.Tooltip.hide();
    }
  }
});

const listenerKey = "__catchExternalClickList";

function disableExternalClicks(el) {
  const listener = el[listenerKey];
  if (listener) {
    document.body.removeEventListener("click", listener);
    delete el[listenerKey];
  }
}

function enableExternalClicks(el, handler) {
  const listener = function(e) {
    if (!el.contains(e.target)) {
      handler(e);
    }
  };

  el[listenerKey] = listener;
  document.body.addEventListener("click", listener);
}

Vue.directive("catch-external-click", {
  bind(el, binding) {
    const handler = binding.value;
    if (handler) {
      enableExternalClicks(el, handler);
    }
  },

  update(el, binding) {
    const handler = binding.value;
    disableExternalClicks(el);
    if (handler) {
      enableExternalClicks(el, handler);
    }
  },

  unbind(el, binding) {
    disableExternalClicks(el);
  }
});