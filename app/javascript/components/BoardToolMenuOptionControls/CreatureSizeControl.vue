<template>
  <div class="select is-small">
    <select v-model="option.value">
      <option v-for="s in availableSizes" :key="s.value" :value="s.value">
        {{ s.name }}
      </option>
    </select>
  </div>
</template>

<script>

  import BoardToolMenuOptionMixin from "../../lib/tool_menu/BoardToolMenuOptionMixin";

  var creatureSizes = [
    {name: "Small", value: "small"},
    {name: "Medium", value: "medium"},
    {name: "Large", value: "large_tall"},
    {name: "Large Long", value: "large_long"},
    {name: "Huge", value: "huge_tall"},
    {name: "Huge Long", value: "huge_long"},
    {name: "Gargantuan", value: "gargantuan_tall"},
    {name: "Gargantuan Long", value: "gargantuan_long"},
    {name: "Colossal", value: "colossal_tall"},
    {name: "Colossal Long", value: "colossal_long"}
  ];

  export default {
    mixins: [
      BoardToolMenuOptionMixin
    ],

    computed: {
      availableSizes() {
        return creatureSizes;
      }
    }
  }

</script>

<style lang="scss" scoped>



</style>