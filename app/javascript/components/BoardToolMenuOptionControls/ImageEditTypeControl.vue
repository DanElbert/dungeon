<template>
  <div class="select is-small">
    <select v-model="option.value">
      <option v-for="t in types" :key="t.value" :value="t.value">{{t.name}}</option>
    </select>
  </div>
</template>

<script>

import BoardToolMenuOptionMixin from "../../lib/tool_menu/BoardToolMenuOptionMixin";

const availableTypes = [
  { name: "Move", value: "move" },
  { name: "Scale", value: "scale" },
  { name: "Rotate", value: "rotate" }
];

export default {
  mixins: [
    BoardToolMenuOptionMixin
  ],

  computed: {
    types() {
      return availableTypes;
    }
  }
}

</script>

<style lang="scss" scoped>
</style>