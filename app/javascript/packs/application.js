/* eslint no-console:0 */

import "../styles";

import Vue from "vue";
import draggable from 'vuedraggable'
import _ from "underscore";
import bsn from "bootstrap.native/dist/bootstrap-native-v4";

window._ = _;

import Api from "../lib/Api";
import { ToolMenuItem, ToolMenuGroup, ZoomMenuItem, CheckMenuItem } from "../lib/BoardTools";
import ToolOptions from "../lib/BoardToolOptions";
import Eventer from "../lib/Eventer";
import { Vector2, TransformMatrix, Rectangle, Geometry } from "../lib/geometry";
import "../lib/Directives";

import AppColorPicker from "../components/AppColorPicker";
import AppImagePicker from "../components/AppImagePicker";
import BoardToolMenu from "../components/BoardToolMenu";
import Initiative from "../components/Initiative";
import InitiativeData from "../lib/InitiativeData";


window.ToolMenuItem = ToolMenuItem;
window.ToolMenuGroup = ToolMenuGroup;
window.ZoomMenuItem = ZoomMenuItem;
window.CheckMenuItem = CheckMenuItem;

window.ToolOptions = ToolOptions;
window.InitiativeData = InitiativeData;

window.Vector2 = Vector2;
window.Rectangle = Rectangle;
window.TransformMatrix = TransformMatrix;
window.Geometry = Geometry;
window.Eventer = Eventer;
window.BootstrapNative = bsn;
window.Api = Api;

Vue.component('draggable', draggable);

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
  AppColorPicker,
  AppImagePicker,
  BoardToolMenu,
  Initiative
};


document.addEventListener('DOMContentLoaded', () => {

  for (let el of document.body.querySelectorAll("[data-image-picker]")) {
    installComponent(el, AppImagePicker);
  }

  for (let el of document.body.querySelectorAll("[data-color-picker]")) {
    installComponent(el, AppColorPicker);
  }

});