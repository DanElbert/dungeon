<template>
  <div class="select is-small">
    <select v-model="option.value">
      <option v-for="s in shapes" :key="s.value" :value="s.value">{{s.name}}</option>
    </select>
  </div>
</template>

<script>

  import BoardToolMenuOptionMixin from "../../lib/tool_menu/BoardToolMenuOptionMixin";

  const availableShapes = [
    { name: 'Rectangle', value: 'rectangle'},
    { name: "Circle", value: "circle" },
    { name: "Line", value: "line" }
  ];

  export default {
    mixins: [
      BoardToolMenuOptionMixin
    ],

    computed: {
      shapes() {
        return availableShapes;
      }
    }
  }

</script>

<style lang="scss" scoped>



</style>