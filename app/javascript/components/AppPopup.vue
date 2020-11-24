<template>
  <app-floater class="modal" :class="{'is-active': isOpen}" role="dialog" :floating="floating" :start-position="startPosition" drag-selector=".modal-card-head" :hide-overlay="hideOverlay">
    <div class="modal-background" v-if="useBackground"></div>
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">{{ title }}</p>
        <button v-if="!alwaysOpen" @click="close" class="delete" aria-label="close"></button>
      </header>
      <section class="modal-card-body">
        <slot></slot>
      </section>
      <footer class="modal-card-foot">
        <slot name="footer"></slot>
      </footer>
    </div>
  </app-floater>
</template>

<script>

  import AppFloater from "./AppFloater";
  import { Rectangle, Vector2 } from "../lib/geometry";

  export default {
    props: {
      title: {
        required: true,
        type: String
      },

      floating: {
        required: false,
        type: Boolean,
        default: true
      },

      alwaysOpen: {
        required: false,
        type: Boolean,
        default: false
      },

      startPosition: {
        required: false,
        type: Object,
        default: () => new Vector2(-15, 15)
      },

      useBackground: {
        required: false,
        type: Boolean,
        default: false
      },

      hideOverlay: {
        type: Boolean,
        required: false,
        default: false
      }
    },

    data() {
      return {
        modal: null,
        isOpen: this.alwaysOpen
      };
    },

    computed: {
    },

    methods: {
      open() {
        this.isOpen = true;
      },

      close() {
        this.isOpen = false;
      },

      toggle() {
        this.isOpen = !this.isOpen;
      },

    },

    watch: {
      isOpen(val) {
        if (val) {
          this.$emit("open");
        } else {
          this.$emit("close");
        }
      }
    },

    mounted() {

    },

    components: {
      AppFloater
    }
  }

</script>

<style lang="scss" scoped>

  .modal {
    overflow: visible;
    right: auto;
    bottom: auto;
    z-index: 8000;

    .modal-card-head {
      cursor: move;
    }

    .modal-card {
      overflow: visible;
    }
  }

</style>