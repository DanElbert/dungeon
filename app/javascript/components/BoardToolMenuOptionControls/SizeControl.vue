<template>
  <div>
    <option-dropdown v-model="option.value" :list="availableSizes">
      <div class="line-container" slot-scope="{ item }">
        <span class="line-label">
          {{ item.name }}
        </span>
        <div class="line" :style="{height: item.height + 'px' }"></div>
      </div>
    </option-dropdown>
  </div>
</template>

<script>

  import BoardToolMenuOptionMixin from "../../lib/BoardToolMenuOptionMixin";
  import { feetToText } from "../../lib/Formatting";

  export default {
    mixins: [
      BoardToolMenuOptionMixin
    ],

    computed: {
      availableSizes() {
        const maxHeight = 20;
        const minHeight = 3;

        let maxSize = -1;
        let minSize = 99999;
        for (let s of this.option.sizes) {
          if (s > maxSize) maxSize = s;
          if (s < minSize) minSize = s;
        }

        return this.option.sizes.map(s => {
          const dist = (s - minSize) / (maxSize - minSize);
          return {
            name: this.pixelsToMeasure(s),
            value: s,
            height: (minHeight + ((maxHeight - minHeight) * dist))>>0
          }
        });
      }
    },

    methods: {
      pixelsToMeasure(px) {
        // 50 px = 5 ft.  10px = 1 ft.
        let feet = px / 10;

        return feetToText(feet);
      }
    }
  }

</script>

<style lang="scss" scoped>

  @import "../../styles/variables";

  .line-container {
    display: flex;
    height: 100%;
    align-items: center;

    .line {
      width: 100%;
      background-color: $grey-light;
      opacity: 0.5;
    }

    .line-label {
      position: absolute;
      display: block;
      width: 100%;
      text-align: center;
      color: $black;
    }
  }

</style>