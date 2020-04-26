<template>
  <div class="select is-small">
    <select v-model="selectedValue">
      <option v-for="i in availableImages" :key="i.value" :value="i.value">{{i.name}}</option>
    </select>
  </div>
</template>

<script>
  import BoardToolMenuOptionMixin from "../../lib/tool_menu/BoardToolMenuOptionMixin";

  export default {
    mixins: [
      BoardToolMenuOptionMixin
    ],

    data() {
      return {};
    },

    computed: {
      selectedValue: {
        get() {
          if (this.option && this.option.value) {
            return this.option.value.id;
          } else {
            return null;
          }
        },

        set(val) {
          if (val) {
            this.option.value = this.option.images.find(i => i.id === val);
          } else {
            this.option.value = null;
          }
        }
      },

      availableImages() {
        let items = [];
        if (this.option && this.option.images) {
          items = this.option.images.map(i => ({ name: i.name, value: i.id }));
        }
        items.unshift({name: '== None ==', value: null});
        return items;
      }
    }
  }

</script>

<style ang="scss" scoped>

</style>