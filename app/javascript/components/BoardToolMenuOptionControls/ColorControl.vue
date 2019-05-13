<template>
  <option-dropdown v-model="option.value" :list="colors">
    <div slot-scope="{ item }" :style="{ backgroundColor: item.value, height: '100%' }">
    </div>
  </option-dropdown>
</template>

<script>

  import BoardToolMenuOptionMixin from "../../lib/tool_menu/BoardToolMenuOptionMixin";

  var crayolaColors8 = [
    {name: "Black", value: "#000000"},
    {name: "Blue", value: "#1F75FE"},
    {name: "Brown", value: "#B4674D"},
    {name: "Green", value: "#1CAC78"},
    {name: "Orange", value: "#FF7538"},
    {name: "Red", value: "#EE204D"},
    {name: "Purple", value: "#926EAE"},
    {name: "Yellow", value: "#FCE883"},
    {name: "White", value: "#FFFFFF"}
  ];

  var clear = {name: "Clear", value: null};


  export default {
    mixins: [
      BoardToolMenuOptionMixin
    ],

    computed: {

      colors() {
        const colors = [...crayolaColors8];
        if (this.option.includeClear) {
          colors.push(clear);
        }
        return colors;
      }
    }
  }

</script>

<style lang="scss" scoped>



</style>