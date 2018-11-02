/* eslint no-console:0 */


import Vue from 'vue'

import { ToolMenuItem, ToolMenuGroup, ZoomMenuItem, CheckMenuItem } from "../lib/BoardTools";
import Eventer from "../lib/Eventer";
import { Vector2, TransformMatrix, Rectangle, Geometry } from "../lib/geometry";

import AppColorPicker from "../components/AppColorPicker";
import AppImagePicker from "../components/AppImagePicker";


window.ToolMenuItem = ToolMenuItem;
window.ToolMenuGroup = ToolMenuGroup;
window.ZoomMenuItem = ZoomMenuItem;
window.CheckMenuItem = CheckMenuItem;

window.Vector2 = Vector2;
window.Rectangle = Rectangle;
window.TransformMatrix = TransformMatrix;
window.Geometry = Geometry;
window.Eventer = Eventer;

function installComponent(element, component, opts) {
  opts = opts || {};

  let attrs = {};

  if (element.dataset.attributes) {
    attrs = JSON.parse(element.dataset.attributes);
  }

  const vmOptions = Object.assign(opts, {
    el: element,
    render: createElement => createElement(component, { props: attrs })
  });

  return new Vue(vmOptions);
}

window.VUE_COMPONENTS = {
  install: installComponent,
  AppColorPicker,
  AppImagePicker
};


document.addEventListener('DOMContentLoaded', () => {

  for (let el of document.body.querySelectorAll("[data-image-picker]")) {
    installComponent(el, AppImagePicker);
  }

  for (let el of document.body.querySelectorAll("[data-color-picker]")) {
    installComponent(el, AppColorPicker);
  }

});