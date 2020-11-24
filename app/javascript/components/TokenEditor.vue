<template>
  <app-floater ref="popup" :start-position="startPosition" :hide-overlay="hideOverlay">
    <div v-if="isOpen" class="editor-container box">
      <div class="columns">

        <div class="column">
          <div>
            <app-dropdown-select :options="availableIcons" value-attribute="name" :value="null" @input="addIcon" placeholder-text="Add Icon" always-show-placeholder>
              <template v-slot:default="{ option }">
                <app-token-icon :token-icon="option"></app-token-icon>
              </template>
            </app-dropdown-select>
          </div>
          <div>
            <button class="button is-small" v-for="ti in selectedIcons" :key="ti.name" @click="removeIcon(ti.name)">
              <app-token-icon :token-icon="ti"></app-token-icon>
            </button>
          </div>
        </div>
        <div class="column hp-stack" v-if="currentToken.totalHp > 0 && isOwner">
          <div class="hp-display" :class="{fat: fatHpDisplay}">{{ parseInt(currentHpDisplay) }} / {{ currentToken.totalHp }}</div>
          <button class="button is-success is-outlined is-small" @click="healDamage">Heal</button>
          <input type="number" @focus="$event.target.select()" @keyup.enter="dealDamage" v-model="hpDelta" ref="hpDeltaInput" />
          <button class="button is-danger is-outlined is-small" @click="dealDamage">Damage</button>

        </div>

      </div>
    </div>
  </app-floater>
</template>

<script>

import AppDropdownSelect from "./AppDropdownSelect";
import AppFloater from "./AppFloater";
import AppPopup from "./AppPopup";
import AppTokenIcon from "./AppTokenIcon";

import TWEEN from "@tweenjs/tween.js";
import { TokenDrawing } from "../lib/drawing_objects";
import { Vector2 } from "../lib/geometry";
import TokenIcons from "../lib/TokenIcons";

export default {
  props: {
    selectedItem: {
      type: Object,
      required: false,
      default: null
    },

    isOwner: {
      type: Boolean,
      required: false,
      default: false
    },

    hideOverlay: {
      type: Boolean,
      required: false,
      default: false
    }
  },

  data() {
    return {
      curIcon: null,
      startPosition: new Vector2(250, 100),
      hpDelta: 0,
      currentHpDisplay: 0,
      currentHpAnimation: null,
      fatHpDisplay: false
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

    availableIcons() {
      const s = this.selectedIcons.map(i => i.name);
      return TokenIcons.available.filter(i => !s.includes(i.name));
    },

    selectedIcons() {
      if (this.currentToken !== null) {
        return this.currentToken.icons.map(i => TokenIcons.getIcon(i));
      } else {
        return [];
      }
    },

    isOpen() {
      return this.currentToken !== null;
    }
  },

  methods: {
    dealDamage() {
      const delta = parseInt(this.hpDelta) | 0
      if (delta === 0) {
        return;
      }
      this.updateHp(Math.max(0, this.selectedItem.currentHp - delta))
    },

    healDamage() {
      const delta = parseInt(this.hpDelta) | 0
      if (delta === 0) {
        return;
      }
      this.updateHp(Math.min(this.selectedItem.totalHp, this.selectedItem.currentHp + delta))
    },

    updateHp(newHp) {
      this.$emit("updateSelectedHp", newHp);
      this.fatHpDisplay = true;
      setTimeout(() => { this.fatHpDisplay = false}, 500);
      this.$refs.hpDeltaInput.select();
    },

    addIcon(i) {
      const set = new Set(this.currentToken.icons);
      set.add(i);
      this.$emit("updateSelectedIcons", [...set.values()]);
    },

    removeIcon(i) {
      const set = new Set(this.currentToken.icons);
      set.delete(i);
      this.$emit("updateSelectedIcons", [...set.values()]);
    }
  },

  created() {
    this.$watch("currentToken.currentHp", function(newVal, oldVal) {
      if (this.currentHpAnimation !== null) {
        this.currentHpAnimation.stop();
      }

      this.currentHpAnimation = new TWEEN.Tween(this, this.$tween)
        .to({ currentHpDisplay: newVal }, 250)
        .onComplete(() => { this.currentHpAnimation = null; })
        .start();

    }, { immediate: true });
  },

  components: {
    AppDropdownSelect,
    AppFloater,
    AppPopup,
    AppTokenIcon
  }
}

</script>

<style lang="scss" scoped>

  .editor-container {
    width: 350px;
  }

  .hp-stack {
    & > * {
      display: block;
      width: 100%;
    }
  }

  .hp-display {
    height: 2rem;
    transition: font-size 333ms;
    &.fat {
      font-size: 125%;
    }
  }

</style>