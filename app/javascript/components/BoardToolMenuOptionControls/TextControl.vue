<template>
  <div>
    <input type="text" v-model="option.value" />
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



</style>