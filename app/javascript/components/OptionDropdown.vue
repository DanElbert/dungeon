<template>

  <div class="option-dropdown">
    <div v-if="selectedItem" class="item-wrapper" @click="itemClick(selectedItem.value)">
      <slot :item="selectedItem">
        {{ selectedItem.name }}
      </slot>
    </div>

    <div class="popup" v-if="isOpen" v-catch-external-click="externalClick">
      <div class="item-wrapper" v-for="i in list" :key="i.value" @click="itemClick(i.value)">
        <slot :item="i">
          {{ i.name }}
        </slot>
      </div>
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

      // externalClickHandler() {
      //   if (this.isOpen) {
      //     return () => { return this.externalClick(); }
      //   } else {
      //     return null;
      //   }
      // }
    },

    methods: {
      itemClick(v) {
        if (this.isOpen) {
          this.$emit("input", v);
          this.isOpen = false;
        } else {
          this.isOpen = true;
        }
      },

      externalClick() {
        this.isOpen = false;
        return false;
      }
    }
  }

</script>

<style lang="scss" scoped>

  @import "../styles/variables";

  .option-dropdown {
    position: relative;
  }

  .popup {
    position: absolute;
    top: 0;
    left: 0;
    background-color: $white;
  }

  .item-wrapper {
    width: 4rem;
    height: 4rem;
  }

</style>