<template>
  <app-floater :start-position="startPosition">
    <div v-if="visible" class="compass-container has-text-black is-family-secondary" :style="containerStyle">
      <span class="compass-item north" :style="labelStyle">N</span>
      <span class="compass-item west" :style="labelStyle">W</span>
      <span class="compass-item east" :style="labelStyle">E</span>
      <span class="compass-item south" :style="labelStyle">S</span>
      <rose2 class="compass-item compass-image"></rose2>
    </div>
  </app-floater>
</template>

<script>

  import AppFloater from "./AppFloater";
  import Rose1 from "../dungeon_svg/Compass-Rose-BW.svg";
  import Rose2 from "../dungeon_svg/CompassRose.svg"

  import { Vector2 } from "../lib/geometry";

  export default {
    props: {
      rotation: {
        type: Number,
        required: false,
        default: 0
      }
    },

    data() {
      return {
        visible: false,
        startPosition: new Vector2(-75, -100)
      }
    },

    computed: {
      containerStyle() {
        return {
          transform: `rotate(${this.rotation}deg)`
        }
      },

      labelStyle() {
        return {
          transform: `rotate(-${this.rotation}deg)`
        }
      }
    },

    methods: {
      toggle() {
        this.visible = !this.visible;
      }
    },

    components: {
      AppFloater,
      Rose1,
      Rose2
    }
  }

</script>

<style lang="scss" scoped>

  $compass-label-size: 40px;

  .compass-container {
    display: grid;
    grid-template-columns: $compass-label-size auto $compass-label-size;
    grid-template-rows: $compass-label-size auto $compass-label-size;
    align-content: stretch;
    transition: transform 1s;

    .compass-item {
      place-self: center;
      font-weight: bold;
      font-size: 40px;
      color: white;
      -webkit-text-stroke: 1px black;
      transition: transform 1s;
    }

    .north {
      grid-area: 1 / 1 / 2 / 4;
    }

    .west {
      grid-area: 2 / 1 / 3 / 2;
    }

    .east {
      grid-area: 2 / 3 / 3 / 4;
    }

    .south {
      grid-area: 3 / 1 / 4 / 4;
    }

    .compass-image {
      grid-area: 2 / 2 / 3 / 3;
      width: 150px;
      height: 150px;
    }
  }

  svg {

    path.circle, g.circle {
      display: none;
    }
  }
</style>