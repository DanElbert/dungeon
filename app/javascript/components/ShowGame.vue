<template>
  <div id="game_board_container" class="game_board_container">
    <compass-rose :rotation="compassRotation" :visible="compassVisible" ></compass-rose>
    <initiative ref="init" :floating="true" :campaign-id="campaignId"></initiative>
    <token-editor :selected-item="board ? board.selectedItem : null" @updateSelectedHp="updateTokenHp"></token-editor>
    <div class="main_menu">
      <button v-for="btn in mainMenu" :key="btn.name" @click="btn.handler" class="button is-secondary is-small">{{ btn.name }}</button>
    </div>
    <canvas id="game_board" ref="game_board" ></canvas>
  </div>
</template>

<script>

import CompassRose from "./CompassRose";
import Initiative from "./Initiative";
import TokenEditor from "./TokenEditor";

import { Board } from "../lib/board/Board";
import Api from "../lib/Api";
import {generateActionId} from "../lib/Actions";

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
    }
  },

  mounted() {
    this.board = new Board(this.$refs.game_board, this.gameId, this.currentUser);
    window.board = this.board;

    window.addEventListener('resize', this.setCanvasSize);
    this.setCanvasSize();

    Api.getJson(`/games/${this.gameId}/get_game_data`).then(data => {
      this.board.setZoom(1.0);
      this.board.refresh(data);
      this.drawGame();
    });
  },

  destroyed() {
    window.removeEventListener('mousemove', this.setCanvasSize);
  },

  components: {
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