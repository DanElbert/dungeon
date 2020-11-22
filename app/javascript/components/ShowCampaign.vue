<template>
<div v-if="internalCampaign !== null">

  <div class="columns">
    <div class="column">
      <h2 class="title">
        {{ internalCampaign.name }}<br/>
      </h2>
      <h3 class="subtitle">
        <span class="fa fa-user"></span>
        {{ internalCampaign.user_name }}
      </h3>
    </div>
  </div>

  <div class="columns">
    <div class="column">
      <span v-if="isOwner">
        <a :href="`/campaigns/${internalCampaign.id}/games/new`" class="button is-primary">Add Game</a>
        <a :href="`/campaigns/${internalCampaign.id}/images`" class="button is-primary">Manage Images</a>
      </span>
      <a :href="`/campaigns/${internalCampaign.id}/initiative`" class="button is-primary">Initiative <span class="far fa-hourglass fa-fw"></span></a>
    </div>
  </div>

  <div class="columns">
    <div class="column">
      <game-list :games="activeGames" :is-owner="isOwner" title="Active Games"></game-list>
    </div>
  </div>

  <div class="columns" v-if="isOwner">
    <div class="column">
      <game-list :games="hiddenGames" :is-owner="isOwner" title="Hidden Games"></game-list>
    </div>
  </div>

  <div class="columns">
    <div class="column">
      <game-list :games="oldGames" :is-owner="isOwner" title="Old Games"></game-list>
    </div>
  </div>

  <div class="columns mt-3">
    <div class="column">
      <span v-if="isOwner">
        <a :href="`/campaigns/${internalCampaign.id}/edit`" class="button is-primary">Edit Campaign</a>
        <a :href="`/campaigns/${internalCampaign.id}/games/new`" class="button is-primary">Add Game</a>
      </span>
      <a href="/" class="button is-primary">Back to Lobby</a>
    </div>
  </div>

  <beckon-notification v-if="campaignMessenger !== null" :campaign-messenger="campaignMessenger"></beckon-notification>

</div>
</template>

<script>

import GameList from "./GameList"
import BeckonNotification from "./BeckonNotification";
import {CampaignMessenger} from "../lib/campaignMessenger";

export default {
  props: {
    isOwner: {
      type: Boolean,
      required: true
    },

    campaign: {
      type: Object,
      required: true
    },

    currentUser: {
      type: Object,
      required: true
    }
  },

  data() {
    return {
      campaignMessenger: null,
      internalCampaign: null
    }
  },

  computed: {
    activeGames() {
      return this.internalCampaign.games.filter(g => g.status === 'active');
    },

    hiddenGames() {
      return this.internalCampaign.games.filter(g => g.status === 'hidden');
    },

    oldGames() {
      return this.internalCampaign.games.filter(g => g.status === 'archived');
    }
  },

  mounted() {
    this.internalCampaign = this.campaign;
    this.campaignMessenger = new CampaignMessenger(this.currentUser.id, this.internalCampaign.id);

    this.campaignMessenger.on("updated", c => {
      this.internalCampaign = c;
    })
  },

  components: {
    BeckonNotification,
    GameList
  }
}

</script>