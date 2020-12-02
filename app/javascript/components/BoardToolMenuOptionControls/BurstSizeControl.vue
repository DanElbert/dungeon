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
  {value: 'small', name: "Small"},
  {value: 'medium', name: "Medium"},
  {value: 'large', name: "Large"}
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