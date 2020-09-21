<template>
  <app-popup ref="popup" title="Edit Token">
    <div v-if="isOpen">
      <div v-if="currentToken.totalHp > 0">
        <button class="button is-success is-outlined is-small" @click="healDamage">Heal</button>
        <input type="number" v-model="hpDelta" />
        <button class="button is-danger is-outlined is-small" @click="dealDamage">Damage</button>
        {{ currentToken.currentHp }} / {{ currentToken.totalHp }}
      </div>
    </div>
  </app-popup>
</template>

<script>

import AppFloater from "./AppFloater";
import AppPopup from "./AppPopup";

import { TokenDrawing } from "../lib/drawing_objects";

export default {
  props: {
    selectedItem: {
      type: Object,
      required: false,
      default: null
    }
  },

  data() {
    return {
      hpDelta: 0
    };
  },

  computed: {
    currentToken() {
      if (this.selectedItem && this.selectedItem instanceof TokenDrawing) {
        return this.selectedItem;
      } else {
        return null;
      }
    },

    isOpen() {
      return this.currentToken !== null;
    }
  },

  watch: {
    isOpen(newVal) {
      if (newVal) {
        this.$refs.popup.open();
      } else {
        this.$refs.popup.close();
      }
    }
  },

  methods: {
    dealDamage() {
      const newHp = Math.max(0, this.selectedItem.currentHp - (parseInt(this.hpDelta) | 0));
      this.$emit("updateSelectedHp", newHp);
    },

    healDamage() {
      const newHp = Math.min(this.selectedItem.totalHp, this.selectedItem.currentHp + (parseInt(this.hpDelta) | 0));
      this.$emit("updateSelectedHp", newHp);
    }
  },

  components: {
    AppFloater,
    AppPopup
  }
}

</script>

<style lang="scss" scoped>

</style>