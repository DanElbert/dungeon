/* eslint no-console:0 */

import "../styles";
import 'vue-resize/dist/vue-resize.css'

import Vue from "vue";
import Rails from 'rails-ujs';
import TWEEN from '@tweenjs/tween.js'


import "../lib/BulmaGlue";
import "../lib/AntiGhostClick";
import "../lib/MouseWheelEvents";
import "../lib/board/GameBoard";
import "../lib/Directives";
import "../lib/TouchTapDirective";
import "../lib/drawing_objects";
import "../lib/board/Actions";

import VueResize from 'vue-resize'
import AppCampaignUsers from "../components/AppCampaignUsers";
import AppColorPicker from "../components/AppColorPicker";
import AppImagePicker from "../components/AppImagePicker";
import BoardToolMenu from "../components/BoardToolMenu";
import CompassRose from "../components/CompassRose";
import Initiative from "../components/Initiative";





// Setup global animation loop
function animate () {
  TWEEN.update();
  requestAnimationFrame(animate);
}
animate();


function installComponent(element, component, opts, attrs) {
  opts = opts || {};
  attrs = attrs || {};

  if (element.dataset.attributes) {
    attrs = JSON.parse(element.dataset.attributes);
  }

  const vmOptions = Object.assign(opts, {
    el: element,
    render: createElement => createElement(component, { props: attrs, ref: 'component' })
  });

  const vm = new Vue(vmOptions);
  return vm.$refs.component;
}

window.VUE_COMPONENTS = {
  install: installComponent,
  AppCampaignUsers,
  AppColorPicker,
  AppImagePicker,
  BoardToolMenu,
  CompassRose,
  Initiative
};

Vue.use(VueResize);


document.addEventListener('DOMContentLoaded', () => {

  Rails.start();

  const map = {
    "image-picker": AppImagePicker,
    "color-picker": AppColorPicker,
    "campaign-users": AppCampaignUsers
  };

  for (let dataAttr in map) {
    for (let el of document.body.querySelectorAll(`[data-${dataAttr}]`)) {
      installComponent(el, map[dataAttr]);
    }
  }

});