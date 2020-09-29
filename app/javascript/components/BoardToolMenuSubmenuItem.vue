<template>
  <div :class="subitemClasses" @mouseenter="hovered = true" @mouseleave="hovered = false" @click.stop="handleClick" v-touch-tap="handleTap" :data-tooltip="tool.tooltip" data-placement="right">
    <div v-if="tool.type === 'zoom'" class="select is-fullwidth">
      <select v-model="internalValue">
        <option v-for="i in zoomSelectItems" :key="i.value" :value="i.value">{{i.label}}</option>
      </select>
    </div>
    <template v-else>
      <span class="icon">
        <font-awesome-icon :icon="tool.glyph"></font-awesome-icon>
      </span>
      <span class="icon" v-if="tool.type === 'checkbox'">
        <font-awesome-icon :icon="['far', tool.value ? 'check-square' : 'square']"></font-awesome-icon>
      </span>
      {{ tool.label }}
    </template>
  </div>
</template>

<script>

  const availableZooms = [10, 25, 50, 75, 100, 150, 200, 250];

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
        internalValue: this.tool.value
      };
    },

    computed: {
      subitemClasses() {
        return {
          subitem: true,
          hovered: this.hovered,
          selected: this.tool.selected,
          tooltip: this.tool.tooltip,
          'is-tooltip-right': true
        }
      },

      zoomSelectItems() {
        const items = availableZooms.map(i => ({selected: false, value: i / 100.0, label: `${i}%`}));
        let selected = items.find(i => i.value === this.tool.value);
        if (selected) {
          selected.selected = true;
        } else {
          selected = {selected: true, value: this.tool.value, label: `${parseInt(this.tool.value * 100)}%`};
          items.unshift(selected);
        }

        return items;
      }
    },

    watch: {
      "tool.value": function() {
        this.internalValue = this.tool.value;
      },

      internalValue() {
        if (this.tool.type === "zoom") {
          this.tool.handler(this.internalValue);
        }
      }
    },

    methods: {
      handleTap() {
        this.handleClick();
        if (this.tool.type !== "zoom") {
          this.$emit("close");
        }

      },

      handleClick() {
        switch (this.tool.type) {
          case "button":
            this.tool.handler();
            break;
          case "checkbox":
            this.tool.handler(!this.tool.value);
            break;
        }
      }
    },

    components: {

    }
  }

</script>

<style lang="scss" scoped>

  @import "../styles/variables";

  $border-width: 3px;

  .subitem {
    padding: 4px;
    font-size: 1.25rem;
    border: $border-width solid $white;

    //svg {
    //  width: 2em;
    //  align-content: flex-start;
    //}

    &.hovered {
      border: $border-width solid $grey-lighter;
    }

    &.selected {
      color: $white;
      background-color: $primary;
    }
  }

</style>