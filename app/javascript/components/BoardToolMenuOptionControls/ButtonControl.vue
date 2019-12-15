<template>
  <button>
    <i :class="option.glyph" @click="clickHandler"></i>
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