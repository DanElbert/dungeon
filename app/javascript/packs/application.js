/* eslint no-console:0 */

import "../styles";
import 'vue-resize/dist/vue-resize.css'

import Vue from "vue";
import _ from "lodash";
import TWEEN from '@tweenjs/tween.js';
import Hammer from "hammerjs";
import Rails from 'rails-ujs';

window._ = _;
window.TWEEN = TWEEN;

import Api from "../lib/Api";
import "../lib/BulmaGlue";
import "../lib/AntiGhostClick";
import "../lib/MouseWheelEvents";
import "../lib/board/GameBoard";
import { ToolMenuItem, ToolMenuGroup, ZoomMenuItem, CheckMenuItem } from "../lib/tool_menu/BoardTools";
import ToolOptions from "../lib/tool_menu/BoardToolOptions";
import Eventer from "../lib/Eventer";
import { Vector2, TransformMatrix, Rectangle, Geometry } from "../lib/geometry";
import "../lib/Directives";
import "../lib/TouchTapDirective";
import * as formatting from "../lib/Formatting";
import { ActionMessenger } from "../lib/ActionMessenger";
import { flashMessage } from "../lib/FlashMessages";
import { attachActionMethods, generateActionId } from "../lib/Actions";
import "../lib/drawing_objects";
import "../lib/board/Actions";

import VueResize from 'vue-resize'
import AppCampaignUsers from "../components/AppCampaignUsers";
import AppColorPicker from "../components/AppColorPicker";
import AppImagePicker from "../components/AppImagePicker";
import BoardToolMenu from "../components/BoardToolMenu";
import Initiative from "../components/Initiative";
import InitiativeData from "../lib/InitiativeData";


window.ActionMessenger = ActionMessenger;
window.ToolMenuItem = ToolMenuItem;
window.ToolMenuGroup = ToolMenuGroup;
window.ZoomMenuItem = ZoomMenuItem;
window.CheckMenuItem = CheckMenuItem;

window.flashMessage = flashMessage;
window.attachActionMethods = attachActionMethods;
window.generateActionId = generateActionId;

window.ToolOptions = ToolOptions;
window.InitiativeData = InitiativeData;

window.Vector2 = Vector2;
window.Rectangle = Rectangle;
window.TransformMatrix = TransformMatrix;
window.Geometry = Geometry;
window.Eventer = Eventer;
window.Api = Api;
window.Formatting = {
  feetToText: formatting.feetToText
};

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