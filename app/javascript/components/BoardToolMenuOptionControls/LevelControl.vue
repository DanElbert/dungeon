<template>
  <select>
    <option v-for="lvl in option.levels" :key="lvl.level" :value="lvl.level" :selected="lvl.level === option.value">
      {{lvl.name}}
    </option>
  </select>
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