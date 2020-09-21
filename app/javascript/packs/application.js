/* eslint no-console:0 */

import "../styles";
import 'vue-resize/dist/vue-resize.css'

import Vue from "vue";
import Rails from '@rails/ujs';

import "../lib/BulmaGlue";
import "../lib/AntiGhostClick";
import "../lib/MouseWheelEvents";
import "../lib/Directives";
import "../lib/TouchTapDirective";
import "../lib/drawing_objects";
import "../lib/board/Actions";
import "../lib/FontAwesome";

import VueResize from 'vue-resize'
import AppCampaignUsers from "../components/AppCampaignUsers";
import AppColorPicker from "../components/AppColorPicker";
import AppFilePicker from "../components/AppFilePicker";
import AppImagePicker from "../components/AppImagePicker";
import BoardToolMenu from "../components/BoardToolMenu";
import AppToolColorPicker from "../components/AppToolColorPicker";
import CompassRose from "../components/CompassRose";
import ShowGame from "../components/ShowGame";
import Initiative from "../components/Initiative";

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
  AppFilePicker,
  AppImagePicker,
  BoardToolMenu,
  AppToolColorPicker,
  CompassRose,
  ShowGame,
  Initiative
};

Vue.use(VueResize);


document.addEventListener('DOMContentLoaded', () => {

  Rails.start();

  const map = {
    "show-game": ShowGame,
    "initiative": Initiative,
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