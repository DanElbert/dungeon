<template>
  <button @click="clickHandler">
    <font-awesome-icon :icon="option.glyph"></font-awesome-icon>
  </button>
</template>

<script>

  import BoardToolMenuOptionMixin from "../../lib/tool_menu/BoardToolMenuOptionMixin";

  export default {
    mixins: [
      BoardToolMenuOptionMixin
    ],

    methods: {
      clickHandler() {
        if (this.option.handler) {
          this.option.handler();
        }
      }
    }
  }

</script>

<style lang="scss" scoped>



</style>