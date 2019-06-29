export class CompassManager {

  constructor(container) {
    this.container = container;
    this.element = document.createElement("div");
    this.container.appendChild(this.element);
    this.compass = VUE_COMPONENTS.install(this.element, VUE_COMPONENTS.CompassRose, {}, { });
  }

  setRotation(deg) {
    this.compass.setRotation(deg);
  }

  toggleDisplay() {
    this.compass.toggle();
  }

}