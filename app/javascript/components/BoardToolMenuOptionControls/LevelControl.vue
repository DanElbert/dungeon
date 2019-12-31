<template>
  <select v-model="selectedLevel">
    <option v-for="lvl in option.levels" :key="lvl.id" :value="lvl.id">
      {{lvl.name}}
    </option>
  </select>
</template>

<script>

  import BoardToolMenuOptionMixin from "../../lib/tool_menu/BoardToolMenuOptionMixin";

  export default {
    mixins: [
      BoardToolMenuOptionMixin
    ],

    computed: {
      selectedLevel: {
        get() {
          return this.option.value;
        },

        set(val) {
          this.option.value = val;
        }
      }
    }
  }

</script>

<style lang="scss" scoped>

</style>