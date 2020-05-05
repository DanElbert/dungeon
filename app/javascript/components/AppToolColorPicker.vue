<template>
  <div class="wrapper">
    <input type="hidden" :value="option.value" :name="name">
    <color-control :option="option"></color-control>
  </div>
</template>

<script>

  import ColorControl from "./BoardToolMenuOptionControls/ColorControl";

  export default {
    props: {
      initialValue: {
        type: String
      },

      name: {
        type: String
      }
    },

    data() {
      return {
        option: {
          value: this.initialValue || '#000000'
        }
      }
    },

    components: {
      ColorControl
    }
  }
</script>

<style lang="scss" scoped>
  div.wrapper {
    height: 35px;
    width: 50px;
    position: relative;
    z-index: 99;
  }
</style>