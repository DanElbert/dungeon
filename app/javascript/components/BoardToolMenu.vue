<template>
  <div>

    <div v-if="visible" class="tool-menu">
      <div v-for="t in tools" :key="t.name">
        <board-tool-menu-item :tool="t"></board-tool-menu-item>
      </div>
    </div>

    <div v-if="visible && options" class="option-menu">
      <span v-for="o in options">
        {{ o.name }}
      </span>
    </div>

  </div>
</template>

<script>

  import BoardToolMenuItem from "./BoardToolMenuItem";

  export default {
    props: {
      toolsInput: {
        required: true,
        type: Array
      }
    },

    data() {
      return {
        tools: this.toolsInput,
        visible: true,
        options: null
      };
    },

    methods: {
      toggleDisplay() {
        this.visible = !this.visible;
      },

      updateOptions(opts) {
        this.options = opts;
      }
    },

    components: {
      BoardToolMenuItem
    }
  }

</script>

<style lang="scss" scoped>

  $toolpanel_shadow: 7px 3px 3px rgba(1, 1, 1, 0.5);

  .tool-menu {
    position: absolute;
    top: 32px;
    left: 32px;
    z-index: 200;
    box-shadow: $toolpanel_shadow;
  }

</style>