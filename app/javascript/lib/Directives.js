
import Vue from "vue";
import bsn from "bootstrap.native/dist/bootstrap-native-v4";

Vue.directive("tooltip", {
  bind(el, binding) {
    new bsn.Tooltip(el);
  },

  update(el, binding) {
  },

  unbind(el, binding) {
    if (el.Tooltip) {
      el.Tooltip.hide();
    }
  }
});