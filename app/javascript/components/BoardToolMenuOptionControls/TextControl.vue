<template>
  <div>
    <input type="text" class="input is-small" v-model="option.value" />
  </div>
</template>

<script>

  import BoardToolMenuOptionMixin from "../../lib/tool_menu/BoardToolMenuOptionMixin";

  export default {
    mixins: [
      BoardToolMenuOptionMixin
    ]
  }

</script>

<style lang="scss" scoped>



</style>