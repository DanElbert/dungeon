<template>
  <div :class="itemClass" @mouseenter="handleMouseenter" @mouseleave="handleMouseleave" @click="handleClick" v-touch-tap="handleTap" ref="item" :data-tooltip="tool.tooltip">
    <font-awesome-icon :icon="activeTool.glyph"></font-awesome-icon>

    <div class="submenu-wrapper" v-if="submenuOpen" :style="submenuWrapperStyle" ref="submenuWrapper">
      <div class="submenu">
        <board-tool-menu-submenu-item v-for="t in tool.children.filter(c => c.visible !== false)" :key="t.name" :tool="t" @close="closeSubmenu">
        </board-tool-menu-submenu-item>
      </div>
    </div>
  </div>
</template>

<script>

  import BoardToolMenuSubmenuItem from "./BoardToolMenuSubmenuItem";
  import { Vector2 } from "../lib/geometry"

  export default {
    props: {
      tool: {
        required: true,
        type: Object
      },

      submenuOpen: {
        required: true,
        type: Boolean
      },

      submenuMinY: {
        required: false,
        type: Number,
        default: 10
      }
    },

    data() {
      return {
        hovered: false,
        submenuPosition: new Vector2(0, 0),
        activeToolName: null,
        activeTool: null
      };
    },

    computed: {
      itemClass() {
        return {
          item: true,
          selected: this.tool.selected,
          hovered: this.hovered,
          active: this.tool.active,
          tooltip: this.tool.tooltip,
          'is-tooltip-right': true
        }
      },

      submenuWrapperStyle() {
        return {
          left: `${this.submenuPosition.x}px`,
          top: `${this.submenuPosition.y}px`
        }
      }
    },

    methods: {
      handleTap() {
        if (this.tool.handler) {
          this.tool.handler();
        } else if (this.submenuOpen) {
          this.closeSubmenu();
        } else {
          this.openSubmenu();
        }
      },

      handleClick() {
        if (this.tool.handler) {
          this.tool.handler();
        } else if (this.activeTool.handler && !this.tool.noClickthrough) {
          this.activeTool.handler();
        }
      },

      handleMouseenter() {
        this.openSubmenu();
        this.hovered = true;
      },

      handleMouseleave(e) {
        if (e.relatedTarget !== null) {
          this.closeSubmenu();
          this.hovered = false;
        }
      },

      openSubmenu() {
        if (!this.submenuOpen && this.tool.children && this.tool.children.length > 0) {
          this.$emit("submenu-open");
        }
      },

      closeSubmenu() {
        this.$emit("submenu-close");
      }
    },

    watch: {
      submenuOpen: function(newVal, oldVal) {
        if (newVal) {
          this.$nextTick(() => {
            const item = this.$refs.item;
            const wrapper = this.$refs.submenuWrapper;
            const itemBox = item.getBoundingClientRect();
            const headRoom = itemBox.top - this.submenuMinY;
            const half = (wrapper.scrollHeight / 2) - (itemBox.height / 2);

            this.submenuPosition = new Vector2(item.offsetWidth, -Math.min(headRoom, half));
          });
        }
      },
    },

    created() {
      this.$watch("tool",
        function(newTool) {
          let tool = newTool;

          if (newTool.type === "group") {
            const selectedTool = newTool.children.find(c => c.selected === true);
            const defaultTool = newTool.children.find(c => c.name === this.activeToolName) || newTool.children[0];
            tool = selectedTool || defaultTool;
          }

          this.activeTool = tool;
          this.activeToolName = tool.name;
        },
        {
          deep: true,
          immediate: true
        });
    },

    components: {
      BoardToolMenuSubmenuItem
    }
  }

</script>

<style lang="scss" scoped>

  @import "../styles/variables";

  .item {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;

    color: $white;
    background-color: $primary;

    &.hovered {
      background-color: lighten($primary, 15%);
    }

    &.selected {
      color: $primary;
      background-color: $white;
    }

    &.active {
      color: $white;
      background-color: $red;
    }

    svg {
      font-size: 1.5rem;
    }
  }

  .submenu-wrapper {
    position: absolute;
    background: none;
    padding: 1em;

  }

  .submenu {
    background-color: $white;
    color: $body-color;
    width: 13rem;
  }
</style>