<template>
  <div>
    <option-dropdown v-model="option.value" :list="availableSizes"></option-dropdown>
  </div>
</template>

<script>

  import BoardToolMenuOptionMixin from "../../lib/BoardToolMenuOptionMixin";

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