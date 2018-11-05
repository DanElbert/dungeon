<template>
  <div>
    <option-dropdown v-model="option.value" :list="availableSizes">
      <div class="line-container" slot-scope="{ item }">
        <div class="line" :style="{height: item.height + 'px' }"></div>
      </div>
    </option-dropdown>
  </div>
</template>

<script>

  import BoardToolMenuOptionMixin from "../../lib/BoardToolMenuOptionMixin";

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
            name: '',
            value: s,
            height: (minHeight + ((maxHeight - minHeight) * dist))>>0
          }
        });
      }
    }
  }

</script>

<style lang="scss" scoped>

  .line-container {
    display: flex;
    height: 100%;
    align-items: center;

    .line {
      width: 100%;
      background-color: black;
    }
  }

</style>