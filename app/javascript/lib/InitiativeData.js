import Eventer from "./Eventer";

class InitiativeData extends Eventer {
  constructor() {
    super();

    this.initiatives = [];
  }

  get length() {
    return this.initiatives.length;
  }

  add(init) {
    this.initiatives.push(init);
  }

  update(newInitiatives) {
    this.initiatives = newInitiatives || [];
  }

  clear() {
    this.initiatives = [];
  }

  sort() {
    this.initiatives.sort((a, b) => {
      if (a.value < b.value) {
        return -1;
      }
      if (a.value > b.value) {
        return 1;
      }
      return 0;
    })
  }
}

export default InitiativeData;