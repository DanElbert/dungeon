
import { dom, icon, library } from '@fortawesome/fontawesome-svg-core';
import Vue from 'vue';
import { FontAwesomeIcon, FontAwesomeLayers, FontAwesomeLayersText } from '@fortawesome/vue-fontawesome';

import {
  faAnchor,
  faAngleDoubleRight,
  faArrowCircleDown,
  faArrowCircleUp,
  faAngleDown,
  faBinoculars,
  faBolt,
  faBorderStyle,
  faBullseye,
  faBurn,
  faCircle,
  faCloud,
  faCopy,
  faDharmachakra,
  faDiceD20,
  faEraser,
  faEye,
  faFont,
  faHeart,
  faImage,
  faLayerGroup,
  faLightbulb,
  faMinus,
  faMinusCircle,
  faMinusSquare,
  faMousePointer,
  faPaste,
  faPen,
  faPlay,
  faPlus,
  faPlusCircle,
  faQuestion,
  faRuler,
  faSearchPlus,
  faShapes,
  faSkullCrossbones,
  faSquare,
  faSyncAlt,
  faTimes,
  faTv,
  faUndo,
  faUpload,
  faUser,
  faUserCircle,
} from "@fortawesome/free-solid-svg-icons";

import {
  faCheckSquare as farCheckSquare,
  faCircle as farCircle,
  faClock as farClock,
  faDizzy as farDizzy,
  faEdit as farEdit,
  faHourglass as farHourglass,
  faImage as farImage,
  faLightbulb as farLightbulb,
  faSquare as farSquare,
} from "@fortawesome/free-regular-svg-icons";

import {
  faGithub,
} from "@fortawesome/free-brands-svg-icons";

library.add(
  faAnchor,
  faAngleDoubleRight,
  faArrowCircleDown,
  faArrowCircleUp,
  faAngleDown,
  faBinoculars,
  faBolt,
  faBorderStyle,
  faBullseye,
  faBurn,
  faCircle,
  faCloud,
  faCopy,
  faDharmachakra,
  faDiceD20,
  faEraser,
  faEye,
  faFont,
  faHeart,
  faImage,
  faLayerGroup,
  faLightbulb,
  faMinus,
  faMinusCircle,
  faMinusSquare,
  faMousePointer,
  faPaste,
  faPen,
  faPlay,
  faPlus,
  faPlusCircle,
  faQuestion,
  faRuler,
  faSearchPlus,
  faShapes,
  faSkullCrossbones,
  faSquare,
  faSyncAlt,
  faTimes,
  faTv,
  faUndo,
  faUpload,
  faUser,
  faUserCircle,

  farCheckSquare,
  farCircle,
  farClock,
  farDizzy,
  farEdit,
  farHourglass,
  farImage,
  farLightbulb,
  farSquare,

  faGithub,
);

Vue.component('font-awesome-icon', FontAwesomeIcon);
Vue.component('font-awesome-layers', FontAwesomeLayers);
Vue.component('font-awesome-layers-text', FontAwesomeLayersText);

dom.watch();

const imgElements = {};

export function getImgElement(iconDef) {
  const key = `${iconDef.prefix}::${iconDef.iconName}`;

  if (imgElements[key] === undefined) {
    imgElements[key] = new Promise((resolve, reject) => {
      const iconData = icon(iconDef);
      const img = new Image();

      img.width = iconData.icon[0];
      img.height = iconData.icon[1];

      img.onload = () => {
        imgElements[key] = img;
        resolve(img);
      };

      img.onerror = e => {
        delete imgElements[key];
        reject(e);
      };

      const svgNode = iconData.node[0];
      svgNode.setAttribute("width", `${img.width}px`);
      svgNode.setAttribute("height", `${img.height}px`);
      const xml = new XMLSerializer().serializeToString(svgNode);

      // make it base64
      const svg64 = btoa(xml);
      const b64Start = 'data:image/svg+xml;base64,';

      // prepend a "header"
      const image64 = b64Start + svg64;

      // set it as the source of the img element
      img.src = image64;
    });
  }

  return Promise.resolve(imgElements[key]);
}