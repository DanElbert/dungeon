import {ActionMessenger} from "../../lib/ActionMessenger";
import {generateActionId} from "../../lib/Actions";

let actionMessenger = null;

export default {
  addItem({ commit, dispatch }, payload) {
    commit("addItem", payload);
    return dispatch("sendData");
  },

  updateItem({ commit, dispatch }, payload) {
    commit("updateItem", payload);
    return dispatch("sendData");
  },

  moveItem({ commit, dispatch }, payload) {
    commit("moveItem", payload);
    return dispatch("sendData");
  },

  removeItem({ commit, dispatch }, payload) {
    commit("removeItem", payload);
    return dispatch("sendData");
  },

  sort({ commit, dispatch }) {
    commit("sort");
    return dispatch("sendData");
  },

  clear({ commit, dispatch }) {
    commit("clear");
    return dispatch("sendData");
  },

  roll({ commit, dispatch }) {
    commit("roll");
    commit("sort");
    return dispatch("sendData");
  },

  ensureMessenger({ commit, state, rootState }) {
    if (actionMessenger === null) {
      actionMessenger = new ActionMessenger("InitiativeChannel", { campaign_id: rootState.campaignId }, message => {
        if (message.actionType === "updateInitiativeAction") {
          commit("updateInitiatives", message);
        }
      });
      actionMessenger.ignoreReflections = false;
    }
    return Promise.resolve();
  },

  sendData({ state }) {
    if (actionMessenger !== null) {
      const action = {actionType: "updateInitiativeAction", initiative: state.items, uid: generateActionId()};
      actionMessenger.sendActionMessage(action);
    }
    return Promise.resolve();
  }
}