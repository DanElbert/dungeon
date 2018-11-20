import Eventer from "./Eventer";

let idCounter = 0;

class InitiativeData extends Eventer {
  constructor() {
    super();

    this.initiatives = [];
  }

  get length() {
    return this.initiatives.length;
  }

  add(name, value) {
    this.initiatives.push({
      name: name,
      value: value,
      id: --idCounter
    });
    this.trigger("changed");
  }

  remove(id) {
    const idx = this.initiatives.findIndex(i => i.id === id);
    if (idx >= 0) {
      this.initiatives[idx]._destroy = true;
      this.trigger("changed");
    }
  }

  move(id, newIdx) {
    const oldIdx = this.initiatives.findIndex(i => i.id === id);
    if (oldIdx >= 0 && oldIdx !== newIdx) {
      const toMove = this.initiatives.splice(oldIdx, 1);
      this.initiatives.splice(newIdx, 0, ...toMove);
      this.trigger("changed");
    }
  }

  update(newInitiatives) {
    this.initiatives = newInitiatives || [];
  }

  clear() {
    this.initiatives = [];
    this.trigger("changed");
  }

  sort() {
    const preSort = this.initiatives.map(i => i.id);
    this.initiatives.sort((a, b) => {
      if (a.value > b.value) {
        return -1;
      }
      if (a.value < b.value) {
        return 1;
      }
      return 0;
    });

    for (let x = 0; x < preSort.length; x++) {
      if (preSort[x] !== this.initiatives[x].id) {
        this.trigger("changed");
        break;
      }
    }
  }
}

export default InitiativeData;