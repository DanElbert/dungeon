<template>
  <app-popup ref="popup" title="Initiative">
    <div>
      INIT!!
    </div>
  </app-popup>
</template>

<script>

  import AppPopup from "./AppPopup";

  export default {

    data() {
      return {

      };
    },

    methods: {
      show() {
        this.$refs.popup.open();
      },

      hide() {
        this.$refs.popup.close();
      },

      toggle() {
        this.$refs.popup.toggle();
      }
    },

    components: {
      AppPopup
    }
  }

</script>

<style lang="scss" scoped>

</style>