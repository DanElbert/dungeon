<template>
  <div class="dropdown" :class="{'is-active': open, 'is-hoverable': hover}">
    <div class="dropdown-trigger">
      <button type="button" class="button" :class="buttonClass" @click="toggle">
        <slot name="button">
          <span>{{ label }}</span>
        </slot>
        <font-awesome-icon :icon="['fas', 'angle-down']"></font-awesome-icon>
      </button>
    </div>

    <div class="dropdown-menu">
      <div class="dropdown-content">
        <slot>
          Default Content
        </slot>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  props: {
    open: {
      required: false,
      type: Boolean,
      default: false
    },

    hover: {
      required: false,
      type: Boolean,
      default: false
    },

    label: {
      required: false,
      type: String,
      default: 'Select'
    },

    buttonClass: {
      required: false,
      default: ""
    }
  },

  methods: {
    toggle() {
      if (this.open) {
        this.triggerClose();
      } else {
        this.triggerOpen();
      }
    },

    triggerOpen() {
      this.$emit("open");
    },

    triggerClose() {
      this.$emit("close");
    },

    handleOutsideClick(evt) {
      if (this.open) {
        if (!this.$el.contains(evt.target)) {
          this.triggerClose();
        }
      }
    }
  },

  mounted() {
    document.addEventListener("click", this.handleOutsideClick);
  },

  beforeDestroy() {
    document.removeEventListener("click", this.handleOutsideClick);
  }
}

</script>

<style lang="scss" scoped>

</style>