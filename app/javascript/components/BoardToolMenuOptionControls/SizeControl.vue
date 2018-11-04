<template>
  <div>
    <option-dropdown v-bind="option.value" :list="availableSizes">
      <div ></div>
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
        for (let s of thie.option.sizes) {
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



</style>