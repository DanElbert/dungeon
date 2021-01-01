import { rollDieWithBonus } from "../../lib/DiceRoller";

let idCounter = 0;

function rollForInit(i) {
  const roll = rollDieWithBonus(20, i.bonus);
  i.value = roll.value;
  i.source = roll.rolls.join(", ");
}

export default {
  setActionMessenger(state, actionMessenger) {
    state.actionMessenger = actionMessenger;
  },

  updateInitiatives(state, payload) {
    if (payload.initiative) {
      state.items = payload.initiative;
    }

    if (payload.initiative_names) {
      state.names = payload.initiative_names;
    }
  },

  addItem(state, payload) {
    const init = {
      name: payload.name,
      bonus: payload.bonus,
      source: "manual",
      value: payload.value,
      id: --idCounter
    };

    if (init.value === null) {
      rollForInit(init);
    }

    state.items.push(init);
  },

  updateItem(state, {id, name, value}) {
    const idx = state.items.findIndex(i => i.id === id);
    if (idx >= 0) {
      state.items[idx].name = name;
      state.items[idx].value = value;
      state.items[idx].source = "manual";
    }
  },

  moveItem(state, { id, newIdx }) {
    const oldIdx = state.items.findIndex(i => i.id === id);
    if (oldIdx >= 0 && oldIdx !== newIdx) {
      const toMove = state.items.splice(oldIdx, 1);
      state.items.splice(newIdx, 0, ...toMove);
    }
  },

  removeItem(state, { id }) {
    const idx = state.items.findIndex(i => i.id === id);
    if (idx >= 0) {
      state.items[idx]._destroy = true;
    }
  },

  sort(state) {
    state.items.sort((a, b) => {
      if (a.value > b.value) {
        return -1;
      }
      if (a.value < b.value) {
        return 1;
      }
      return 0;
    });
  },

  clear(state) {
    state.items.forEach(i => i._destroy = true);
  },

  roll(state) {
    state.items.forEach(i => {
      rollForInit(i);
    });
  }
}