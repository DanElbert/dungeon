<template>
  <app-dropdown :open="isOpen" @open="isOpen = true" @close="isOpen = false">
    <template v-slot:button>
      <template v-if="!!selectedOption && !alwaysShowPlaceholder">
        <slot v-bind:option="selectedOption">
        </slot>
      </template>
      <template v-else>
        {{ placeholderText }}
      </template>
    </template>

    <a class="dropdown-item" v-for="option in options" :key="getOptionValue(option)" @click="select(option)">
      <slot v-bind:option="option">
      </slot>
    </a>

    <div class="dropdown-item" v-if="!options || options.length === 0">
      <slot name="empty">
        No Items
      </slot>
    </div>
  </app-dropdown>
</template>

<script>

import AppDropdown from "./AppDropdown";

export default {
  props: {
    options: {
      type: Array,
      required: false,
      default: () => []
    },

    valueAttribute: {
      type: String,
      required: false,
      default: null
    },

    value: {
      required: false,
      default: null
    },

    placeholderText: {
      type: String,
      default: "Select..."
    },

    alwaysShowPlaceholder: {
      type: Boolean,
      required: false,
      default: false
    }
  },

  data() {
    return {
      isOpen: false
    }
  },

  computed: {
    selectedOption() {
      if (this.value !== null) {
        return this.options.find(opt => this.getOptionValue(opt) === this.value);
      }
    }
  },

  methods: {
    getOptionValue(opt) {
      if (this.valueAttribute) {
        return opt ? opt[this.valueAttribute] : null;
      } else {
        return opt;
      }
    },

    select(option) {
      this.$emit("input", this.getOptionValue(option));
      this.isOpen = false;
    }
  },

  components: {
    AppDropdown
  }
}

</script>