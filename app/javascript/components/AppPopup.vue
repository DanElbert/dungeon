<template>
  <app-floater class="modal" :class="{'is-active': isOpen}" role="dialog" :start-position="startPosition" drag-selector=".modal-card-head">

    <div class="modal-background"></div>
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">{{ title }}</p>
        <button @click="close" class="delete" aria-label="close"></button>
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
      }
    },

    data() {
      return {
        modal: null,
        isOpen: false,
        startPosition: new Vector2(-15, 15)
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