<template>
  <app-floater class="modal" role="dialog" :start-position="startPosition" drag-selector=".modal-header">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h4 class="modal-title">{{ title }}</h4>
          <button type="button" class="close" data-dismiss="modal">&times;</button>
        </div>
        <div class="modal-body">
          <slot></slot>
        </div>
      </div>
    </div>
  </app-floater>
</template>

<script>

  import bsn from "bootstrap.native/dist/bootstrap-native-v4";
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
        this.modal.open();
      },

      close() {
        this.modal.close();
      },

      toggle() {
        this.modal.toggle();
      },

    },

    mounted() {
      this.modal = new bsn.Modal(this.$el, {
        backdrop: false
      });

      this.$el.addEventListener('shown.bs.modal', () => {
        this.isOpen = true;
        this.$emit("opened");
      });

      this.$el.addEventListener('hidden.bs.modal', () => {
        this.isOpen = false;
        this.$emit("closed");
      });
    },

    components: {
      AppFloater
    }
  }

</script>

<style lang="scss" scoped>

  .modal {
    overflow: hidden;
    right: auto;
    bottom: auto;
    z-index: 8000;

    .modal-header {
      cursor: move;
    }

    .modal-dialog {
      margin: 0;
    }
  }

</style>