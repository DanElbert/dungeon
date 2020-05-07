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
    name = (name || "").trim();
    value = (value === null || value === undefined || value === "") ? null : parseInt(value);
    if (name === "") {
      return false;
    }

    const { parsedName, parsedBonus } = this.parseName(name);

    if (value === null && !parsedBonus) {
      return false;
    }

    const init = {
      name: parsedName,
      bonus: parsedBonus,
      source: "manual",
      value: value,
      id: --idCounter
    };

    if (value === null) {
      this.rollForInitItem(init);
    }

    this.initiatives.push(init);
    this.trigger("changed");

    return true;
  }

  parseName(name) {
    const match = name.match(/^(.*?)\s+([+-]\d+[+-]?)$/);
    if (match) {
      return {
        parsedName: match[1],
        parsedBonus: match[2]
      }
    } else {
      return {
        parsedName: name,
        parsedBonus: null
      }
    }
  }

  remove(id) {
    const idx = this.initiatives.findIndex(i => i.id === id);
    if (idx >= 0) {
      this.initiatives[idx]._destroy = true;
      this.trigger("changed");
    }
  }

  updateItem(id, name, value) {
    const idx = this.initiatives.findIndex(i => i.id === id);
    if (idx >= 0) {
      this.initiatives[idx].name = name;
      this.initiatives[idx].value = value;
      this.initiatives[idx].source = "manual";
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
    this.initiatives.forEach(i => i._destroy = true);
    this.trigger("changed");
  }

  roll() {
    this.initiatives.forEach(i => {
      this.rollForInitItem(i);
    });

    this.sort(true);
  }

  rollForInitItem(i) {
    const d20 = () => Math.floor(Math.random() * 20) + 1;
    let diceRolls = [d20()];
    let diceFunc = Math.max;
    let bonus = i.bonus || 0;

    if (bonus !== 0) {
      const m = bonus.match(/([\+\-]\d+)([\+\-])?/);
      bonus = parseInt(m[1]);
      if (m[2]) {
        diceRolls.push(d20());
        if (m[2] === "-") {
          diceFunc = Math.min;
        }
      }
    }

    i.value = diceFunc(...diceRolls) + bonus;
    i.source = diceRolls.join(", ");
  }

  sort(forceChange) {
    const preSort = this.initiatives.map(i => i.id);
    let isChanged = false;

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
        isChanged = true;
        break;
      }
    }

    if (forceChange === true || isChanged === true) {
      this.trigger("changed");
    }
  }
}

export default InitiativeData;