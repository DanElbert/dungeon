<template>

  <div>

    <div v-for="i in displayList" :key="i.value" @click="itemClick(i.value)">
      <slot :item="i">
        {{ i.name }}
      </slot>
    </div>

  </div>

</template>

<script>

  export default {
    props: {
      list: {
        required: true,
        type: Array
      },

      value: {
      }
    },

    data() {
      return {
        isOpen: false
      };
    },

    computed: {
      selectedItem() {
        return this.list.find(i => i.value === this.value) || null;
      },

      displayList() {
        if (this.isOpen) {
          return this.list;
        } else if (this.selectedItem !== null) {
          return [this.selectedItem];
        } else {
          return [this.list[0]];
        }
      }
    },

    methods: {
      itemClick(v) {
        if (this.isOpen) {
          this.$emit("input", v);
          this.isOpen = false;
        } else {
          this.isOpen = true;
        }
      }
    }
  }

</script>

<style lang="scss" scoped>

</style>