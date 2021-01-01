import Vue from 'vue'
import Vuex from 'vuex'

import { ActionMessenger } from "../lib/ActionMessenger";
import { generateActionId } from "../lib/Actions";
import game from "./game";
import initiative from "./initiative";

Vue.use(Vuex);

export default new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  modules: {
    game,
    initiative
  },
  state: {
    beckon: {
      current: null,
      previous: null
    },

    campaignId: null,

    user: null
  },
  actions: {

  },
  getters: {},
  mutations: {
    setCampaignId(state, value) {
      state.campaignId = value;
    },

    setUser(state, value) {
      state.user = value;
    },
  }
});
