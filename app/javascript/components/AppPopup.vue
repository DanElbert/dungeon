<template>
  <div class="modal fade modeless" role="dialog">
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
  </div>
</template>

<script>

  import bsn from "bootstrap.native/dist/bootstrap-native-v4";

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
        isOpen: false
      };
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
      }
    },

    mounted() {
      this.modal = new bsn.Modal(this.$el, {
        backdrop: false
      });

      this.$el.addEventListener('shown.bs.modal', () =>{
        this.isOpen = true;
        this.$emit("opened");
      });

      this.$el.addEventListener('hidden.bs.modal', () =>{
        this.isOpen = false;
        this.$emit("closed");
      });
    }
  }

</script>

<style lang="scss" scoped>

</style>