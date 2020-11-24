<template>
  <div id="game_board_container" class="game_board_container">
    <compass-rose :rotation="compassRotation" :visible="compassVisible" :hide-overlay="hideOverlays"></compass-rose>
    <initiative ref="init" :floating="true" :campaign-id="campaignId" :hide-overlay="hideOverlays"></initiative>
    <token-editor :is-owner="isOwner" :selected-item="board ? board.selectedItem : null" @updateSelectedHp="updateTokenHp" @updateSelectedIcons="updateTokenIcons" :hide-overlay="hideOverlays"></token-editor>
    <beckon-notification v-if="campaignMessenger !== null" :board="board" :campaign-messenger="campaignMessenger"></beckon-notification>
    <div class="main_menu">
      <button v-for="btn in mainMenu" :key="btn.name" @click="btn.handler" class="button is-secondary is-small">{{ btn.name }}</button>
    </div>
    <canvas id="game_board" ref="game_board" ></canvas>
  </div>
</template>

<script>

import BeckonNotification from "./BeckonNotification";
import CompassRose from "./CompassRose";
import Initiative from "./Initiative";
import TokenEditor from "./TokenEditor";

import { Board } from "../lib/board/Board";
import Api from "../lib/Api";
import {generateActionId} from "../lib/Actions";
import { flashMessage } from "../lib/FlashMessages";
import { CampaignMessenger } from "../lib/campaignMessenger";

export default {
  props: {
    gameId: {
      type: Number,
      required: true
    },

    campaignId: {
      type: Number,
      required: true
    },

    currentUser: {
      type: Object,
      required: true
    }
  },

  data() {
    return {
      board: null,
      gameData: null,
      initVisible: false,
      campaignMessenger: null,
      mainMenu: [
        {name: 'Tools', handler: this.toolToggle},
        {name: 'Compass', handler: this.compassToggle},
        {name: 'Initiative', handler: this.initToggle},
        {name: 'Exit', handler: this.exitGame}
      ]
    }
  },

  computed: {
    compassRotation() {
      return this.board?.compassSettings?.rotation || 0;
    },

    compassVisible() {
      return !!this.board?.compassSettings?.visible;
    },

    editToken() {
      return this.board?.selectedToken || null;
    },

    isOwner() {
      if (this.board) {
        return this.board.isOwner;
      } else {
        return false;
      }
    },

    hideOverlays() {
      return !!(this.board && this.board.isItemDragging);
    }
  },

  methods: {
    toolToggle() {
      this.board.toolManager.toggleDisplay();
    },

    compassToggle() {
      this.board.compassSettings.visible = !this.board.compassSettings.visible;
    },

    initToggle() {
      this.$refs.init.toggle();
    },

    exitGame() {
      window.location.href = `/campaigns/${this.campaignId}`;
    },

    setCanvasSize(e) {
      if (e && e.target && e.target !== window)
        return;

      const width = Math.floor(window.innerWidth);
      const height = Math.floor(window.innerHeight);
      this.board.setCanvasSize(width, height, this.calculatePixelRatio());
    },

    calculatePixelRatio() {
      const ctx = document.createElement("canvas").getContext("2d"),
          dpr = window.devicePixelRatio || 1,
          bsr = ctx.webkitBackingStorePixelRatio ||
              ctx.mozBackingStorePixelRatio ||
              ctx.msBackingStorePixelRatio ||
              ctx.oBackingStorePixelRatio ||
              ctx.backingStorePixelRatio || 1;

      return dpr / bsr;
    },

    drawGame() {
      this.board.update();
      window.requestAnimationFrame(() => this.drawGame());
    },

    updateTokenHp(newHp) {
      if (this.board.selectedItem) {
        const action = { uid: generateActionId(), actionType: "updateTokenAction", actionId: this.board.selectedItem.uid, currentHp: newHp };
        const undoAction = { uid: generateActionId(), actionType: "updateTokenAction", actionId: this.board.selectedItem.uid, currentHp: this.board.selectedItem.currentHp };
        this.board.addAction(action, undoAction, true);
      }
    },

    updateTokenIcons(icons) {
      if (this.board.selectedItem) {
        const action = { uid: generateActionId(), actionType: "updateTokenAction", actionId: this.board.selectedItem.uid, icons: icons };
        const undoAction = { uid: generateActionId(), actionType: "updateTokenAction", actionId: this.board.selectedItem.uid, icons: this.board.selectedItem.icons };
        this.board.addAction(action, undoAction, true);
      }
    }
  },

  mounted() {
    this.campaignMessenger = new CampaignMessenger(this.currentUser.id, this.campaignId, this.gameId);
    this.board = new Board(this.$refs.game_board, this.gameId, this.currentUser);
    this.board.beckon = () => {
      const coords = this.board.getViewPortCoordinates();
      const zoom = this.board.getZoom();
      const level = this.board.getLevel();
      this.campaignMessenger.beckon(level.id, coords[0], coords[1], zoom);
      flashMessage("notice", "Beckon Sent");
    }
    window.board = this.board;

    window.addEventListener('resize', this.setCanvasSize);
    this.setCanvasSize();

    Api.getJson(`/games/${this.gameId}/get_game_data`).then(data => {
      this.board.setZoom(1.0);
      this.board.refresh(data);
      this.drawGame();
      // follow beckon here
      if (window.location.hash.startsWith("#beckon=")) {
        const param = window.location.hash.slice("#beckon=".length);
        const json = JSON.parse(decodeURIComponent(param));
        this.board.setLevel(json.level);
        this.board.setViewPortCoordinates([json.x, json.y], json.zoom);
        // Clear URL fragment (Not sure why this works...)
        history.replaceState(null, null, ' ');
      }
    });
  },

  destroyed() {
    window.removeEventListener('mousemove', this.setCanvasSize);
  },

  components: {
    BeckonNotification,
    CompassRose,
    Initiative,
    TokenEditor
  }
}

</script>

<style lang="scss" scoped>

div.game_board_container {
  position: relative;
  height: 100%;
  overflow: hidden;

  /deep/ canvas, /deep/ div.background {
    position: absolute;
    z-index: 1;
  }

  /deep/ canvas.background, /deep/ div.background {
    z-index: 0;
  }
}

.main_menu {
  position: fixed;
  right: 7px;
  bottom: 15px;
  text-align: right;
  z-index: 3;

  button {
    opacity: 0.7;
    display: block;
    font-size: 0.9em;
    width: 80px;
    margin: 4px 0;
    right: 0;
    margin-left: auto;
    margin-right: 0;
  }

  button:hover {
    opacity: 1.0;
    width: 85px;
  }
}

</style>