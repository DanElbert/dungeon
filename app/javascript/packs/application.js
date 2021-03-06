/* eslint no-console:0 */

import "../styles";
import 'vue-resize/dist/vue-resize.css'

import Vue from "vue";
import Vuex from "vuex";
import Rails from '@rails/ujs';
import TWEEN from "@tweenjs/tween.js";

import "../lib/BulmaGlue";
import "../lib/AntiGhostClick";
import "../lib/MouseWheelEvents";
import "../lib/Directives";
import "../lib/TouchTapDirective";
import "../lib/drawing_objects";
import "../lib/board/Actions";
import "../lib/FontAwesome";

import store from '../store';
import VueResize from 'vue-resize'
import AppCampaignUsers from "../components/AppCampaignUsers";
import AppColorPicker from "../components/AppColorPicker";
import AppFilePicker from "../components/AppFilePicker";
import AppImagePicker from "../components/AppImagePicker";
import BoardToolMenu from "../components/BoardToolMenu";
import AppToolColorPicker from "../components/AppToolColorPicker";
import CompassRose from "../components/CompassRose";
import ShowCampaign from "../components/ShowCampaign";
import ShowGame from "../components/ShowGame";
import ShowInitiative from "../components/ShowInitiative";

function installComponent(element, component, opts, attrs) {
  opts = opts || {};
  attrs = attrs || {};

  if (element.dataset.attributes) {
    attrs = JSON.parse(element.dataset.attributes);
  }

  const vmOptions = Object.assign(opts, {
    el: element,
    store,
    render: createElement => createElement(component, { props: attrs, ref: 'component' })
  });

  const vm = new Vue(vmOptions);
  return vm.$refs.component;
}

window.VUE_COMPONENTS = {
  install: installComponent,
  AppCampaignUsers,
  AppColorPicker,
  AppFilePicker,
  AppImagePicker,
  BoardToolMenu,
  AppToolColorPicker,
  CompassRose,
  ShowCampaign,
  ShowGame,
  ShowInitiative
};

Vue.use(VueResize);
Vue.use(Vuex);

Vue.prototype.$tween = new TWEEN.Group();

function vueTweenAnimate() {
  requestAnimationFrame(vueTweenAnimate);
  Vue.prototype.$tween.update();
}

document.addEventListener('DOMContentLoaded', () => {

  Rails.start();
  vueTweenAnimate();

  const map = {
    "show-campaign": ShowCampaign,
    "show-game": ShowGame,
    "show-initiative": ShowInitiative,
    "image-picker": AppImagePicker,
    "color-picker": AppColorPicker,
    "file-picker": AppFilePicker,
    "campaign-users": AppCampaignUsers,
    "tool-color-picker": AppToolColorPicker
  };

  for (let dataAttr in map) {
    for (let el of document.body.querySelectorAll(`[data-${dataAttr}]`)) {
      installComponent(el, map[dataAttr]);
    }
  }

});