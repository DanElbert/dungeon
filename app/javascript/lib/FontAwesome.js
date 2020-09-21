
import { dom, library } from '@fortawesome/fontawesome-svg-core';
import Vue from 'vue';
import { FontAwesomeIcon, FontAwesomeLayers, FontAwesomeLayersText } from '@fortawesome/vue-fontawesome';

import {
  faAngleDoubleRight,
  faArrowCircleDown,
  faArrowCircleUp,
  faBinoculars,
  faBolt,
  faBorderStyle,
  faBullseye,
  faCircle,
  faCloud,
  faCopy,
  faDharmachakra,
  faDiceD20,
  faEraser,
  faEye,
  faFont,
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
  faAngleDoubleRight,
  faArrowCircleDown,
  faArrowCircleUp,
  faBinoculars,
  faBolt,
  faBorderStyle,
  faBullseye,
  faCircle,
  faCloud,
  faCopy,
  faDharmachakra,
  faDiceD20,
  faEraser,
  faEye,
  faFont,
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