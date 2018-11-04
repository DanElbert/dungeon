<template>
  <div class="img" :style="{backgroundImage: `url(${option.url})`}">
  </div>
</template>

<script>

  import BoardToolMenuOptionMixin from "../../lib/BoardToolMenuOptionMixin";

  export default {
    mixins: [
      BoardToolMenuOptionMixin
    ]
  }

</script>

<style lang="scss" scoped>

  .img {
    height: 50px;
    width: 50px;
    background-repeat: no-repeat;
    background-size: contain;
  }

</style>