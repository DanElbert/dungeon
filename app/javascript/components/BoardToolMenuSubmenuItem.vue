<template>
  <div :class="subitemClasses" @mouseenter="hovered = true" @mouseleave="hovered = false" @click="handleClick" v-tooltip :data-original-title="tool.tooltip" data-placement="right">
    <template v-if="tool.type === 'zoom'">
      <select v-model="internalValue" class="form-control">
        <option v-for="i in zoomSelectItems" :key="i.value" :value="i.value">{{i.label}}</option>
      </select>
    </template>
    <template v-else>
      <i :class="tool.glyph"></i>
      <i class="far" :class="{'fa-check-square': tool.value, 'fa-square': !tool.value}" v-if="tool.type === 'checkbox'"></i>
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
          hovered: this.hovered
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

    i {
      width: 2em;
    }

    &.hovered {
      border: $border-width solid $gray-200;
    }
  }

</style>