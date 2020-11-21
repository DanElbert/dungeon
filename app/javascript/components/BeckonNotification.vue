<template>
  <app-floater :start-position="startPosition">
    <div v-if="visible">
      The DM has beckoned you to a map location...
      <button type="button" class="button is-primary" @click="follow">Follow</button>
      <button type="button" class="button is-danger" @click="dismiss">Dismiss</button>
      I'm a Notification!
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
      startPosition: new Vector2(-75, -100),
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