<template>
  <app-floater :start-position="startPosition">
    <div class="box" v-if="visible">
      <h1 class="title is-5">The DM has beckoned you to a map location...</h1>
      <button type="button" class="button is-primary" @click="follow">Follow</button>
      <button type="button" class="button is-danger" @click="dismiss">Dismiss</button>
    </div>
  </app-floater>
</template>

<script>

import AppFloater from "./AppFloater";

import { Vector2 } from "../lib/geometry";

export default {
  props: {
    campaignMessenger: {
      type: Object,
      required: true
    },

    board: {
      type: Object,
      required: false,
      default: null
    }
  },

  data() {
    return {
      startPosition: new Vector2(100, 100),
      currentBeckon: null
    }
  },

  computed: {
    visible() {
      return this.currentBeckon !== null;
    }
  },

  methods: {
    follow() {
      const data = this.currentBeckon;

      if (this.board !== null && this.currentBeckon.gameId === this.campaignMessenger.gameId) {
        this.board.setLevel(data.level);
        this.board.setViewPortCoordinates([data.x, data.y], data.zoom);
      } else {
        const json = {
          level: data.level,
          x: data.x,
          y: data.y,
          zoom: data.zoom
        }
        window.location = `/games/${this.currentBeckon.gameId}#beckon=${encodeURIComponent(JSON.stringify(json))}`
      }
      this.currentBeckon = null;
    },

    dismiss() {
      this.currentBeckon = null;
    }
  },

  mounted() {
    this.campaignMessenger.on("beckon", data => {
      this.currentBeckon = data;
    })
  },

  components: {
    AppFloater
  }
}

</script>

<style lang="scss" scoped>


</style>