<template>
  <div :class="itemClass" @mouseenter="handleMouseenter" @mouseleave="handleMouseleave" @click="handleClick" ref="item" v-tooltip :data-original-title="tool.tooltip" data-placement="right">
    <i :class="activeTool.glyph"></i>

    <div class="submenu-wrapper" v-if="submenuOpen" :style="submenuWrapperStyle" ref="submenuWrapper">
      <div class="submenu">
        <board-tool-menu-submenu-item v-for="t in tool.children" :key="t.name" :tool="t">
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
      }
    },

    data() {
      return {
        hovered: false,
        submenuOpen: false,
        submenuPosition: new Vector2(0, 0)
      };
    },

    computed: {
      activeTool() {
        if (this.tool.type === "group") {
          return this.tool.children.find(c => c.selected === true) || this.tool.children[0];
        } else {
          return this.tool;
        }
      },

      itemClass() {
        return {
          item: true,
          selected: this.tool.selected,
          hovered: this.hovered,
          active: this.tool.active
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
          this.submenuOpen = true;
          this.$nextTick(() => {
            const item = this.$refs.item;
            const wrapper = this.$refs.submenuWrapper;
            const itemBox = item.getBoundingClientRect();
            const headRoom = itemBox.top;
            const half = (wrapper.scrollHeight / 2) - (itemBox.height / 2);

            this.submenuPosition = new Vector2(item.offsetWidth, -Math.min(headRoom, half));
          });
        }
      },

      closeSubmenu() {
        this.submenuOpen = false;
      }
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

    i {
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