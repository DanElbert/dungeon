<template>
  <div class="select is-small">
    <select v-model="option.value">
      <option v-for="s in availableSizes" :key="s.value" :value="s.value">{{s.name}}</option>
    </select>
  </div>
</template>

<script>

  import BoardToolMenuOptionMixin from "../../lib/tool_menu/BoardToolMenuOptionMixin";

  const sizes = [
    {value: 1, name: "1x1"},
    {value: 2, name: "2x2"},
    {value: 3, name: "3x3"},
    {value: 4, name: "4x4"}
  ];

  export default {
    mixins: [
      BoardToolMenuOptionMixin
    ],

    computed: {
      availableSizes() {
        return sizes;
      }
    }
  }

</script>

<style lang="scss" scoped>



</style>