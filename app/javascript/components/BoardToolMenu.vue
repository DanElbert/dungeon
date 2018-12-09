<template>
  <div>

    <div v-if="visible" class="tool-menu">
      <div v-for="t in tools" :key="t.name">
        <board-tool-menu-item :tool="t"></board-tool-menu-item>
      </div>
    </div>

    <div v-if="visible && options" class="option-menu">
      <div v-for="o in optionList" :key="o.name" class="option-item">
        <component :is="optionComponent(o)" :option="o" class="option-item-control"></component>
      </div>
    </div>

  </div>
</template>

<script>

  import BoardToolMenuItem from "./BoardToolMenuItem";

  import BooleanControl from "./BoardToolMenuOptionControls/BooleanControl";
  import ColorControl from "./BoardToolMenuOptionControls/ColorControl";
  import CommandControl from "./BoardToolMenuOptionControls/CommandControl";
  import CopiedImageControl from "./BoardToolMenuOptionControls/CopiedImageControl";
  import CreatureSizeControl from "./BoardToolMenuOptionControls/CreatureSizeControl";
  import ImageControl from "./BoardToolMenuOptionControls/ImageControl";
  import ShapesControl from "./BoardToolMenuOptionControls/ShapesControl";
  import SizeControl from "./BoardToolMenuOptionControls/SizeControl";
  import TextControl from "./BoardToolMenuOptionControls/TextControl";
  import TokenSizeControl from "./BoardToolMenuOptionControls/TokenSizeControl";

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
        options: null,
        wasExternalOptionUpdate: false
      };
    },

    computed: {
      optionList() {
        return this.options.options.filter(o => o.visible !== false);
      }
    },

    methods: {
      toggleDisplay() {
        this.visible = !this.visible;
      },

      updateOptions(opts) {
        this.wasExternalOptionUpdate = true;
        this.options = opts;
      },

      optionComponent(opt) {
        switch (opt.type) {
          case "color":
            return "color-control";
          case "shapes":
            return "shapes-control";
          case "size":
            return "size-control";
          case "copiedImage":
            return "copied-image-control";
          case "boolean" :
            return "boolean-control";
          case "creatureSize":
            return "creature-size-control";
          case "images":
            return "image-control";
          case "text":
            return "text-control";
          case "command":
            return "command-control";
          case "tokenSize":
            return "token-size-control";
          default:
            throw "Unknown opt type: " + opt.type;
        }
      }
    },

    mounted() {
      this.$watch("options",
        function(newVal, oldVal){
          if (this.wasExternalOptionUpdate) {
            this.wasExternalOptionUpdate = false;
          } else {
            this.options.trigger("changed");
          }
        },
        {deep: true})
    },

    components: {
      BoardToolMenuItem,

      BooleanControl,
      ColorControl,
      CommandControl,
      CopiedImageControl,
      CreatureSizeControl,
      ImageControl,
      ShapesControl,
      SizeControl,
      TextControl,
      TokenSizeControl
    }
  }

</script>

<style lang="scss" scoped>

  @import "../styles/variables";

  $toolpanel_shadow: 7px 3px 3px rgba(1, 1, 1, 0.5);

  .tool-menu {
    position: absolute;
    top: 40px;
    left: 32px;
    z-index: 200;
    box-shadow: $toolpanel_shadow;
  }

  .option-menu {
    position: absolute;
    display: flex;
    top: 40px;
    left: 150px;
    z-index: 100;
    box-shadow: $toolpanel_shadow;
    background-color: $white;
  }

  .option-item {
    margin: 3px;
    height: 2rem;
  }

  .option-item-control {
    height: 100%;
  }

</style>