<template>
  <div>
    <div class="diceButtons">
      <div class="diceTray" v-if="trayOpen">
        <div class="dieButton" v-for="(count, sides) in dice" :key="sides" @click="onDieClick($event, sides)" @contextmenu.prevent="onDieRtClick($event, sides)">
          <component :is="'D' + sides.toString()" class="die"></component>
          <span v-if="count > 0" class="dieCount">{{ count }}</span>
        </div>
      </div>
      <div class="buttons has-addons">
        <button class="trayButton button is-rounded is-secondary" @click="toggleTray">
          <d20 v-if="!trayOpen"></d20>
          <span v-else>X</span>
        </button>
        <button class="rollButton button is-rounded is-primary" @click="rollDice" v-if="trayOpen && diceCount > 0">Roll Dice</button>
      </div>
    </div>
    <div v-if="rollHistoryToast.length > 0" class="diceToast notification">
      <dice-tray-roll v-for="roll in rollHistoryToast" :key="roll.id" :roll="roll"></dice-tray-roll>
    </div>
    <app-popup ref="diceHistory" title="Dice Rolls">
      <div class="rollScroller">
        <span v-if="rollHistory.length === 0">No Dice Rolls</span>
        <dice-tray-roll v-for="roll in reversedRollHistory" :key="roll.id" :roll="roll"></dice-tray-roll>
      </div>
    </app-popup>
  </div>
</template>

<script>

import D20 from "../dungeon_svg/d20.svg";
import D12 from "../dungeon_svg/d12.svg";
import D10 from "../dungeon_svg/d10.svg";
import D100 from "./D100";
import D8 from "../dungeon_svg/d8.svg";
import D6 from "../dungeon_svg/d6.svg";
import D4 from "../dungeon_svg/d4.svg";
import AppPopup from "./AppPopup";
import DiceTrayRoll from "./DiceTrayRoll";

import { rollDie } from "../lib/DiceRoller";
import { generateActionId } from "../lib/Actions";

export default {
  props: {
    campaignMessenger: {
      type: Object,
      required: true
    },

    currentUser: {
      type: Object,
      required: true
    }
  },

  data() {
    return {
      trayOpen: false,
      rollHistory: [],
      rollHistoryToast: [],
      dice: {
        4: 0,
        6: 0,
        8: 0,
        10: 0,
        100: 0,
        12: 0,
        20: 0
      }
    }
  },

  computed: {
    diceCount() {
      let count = 0;
      for (const d in this.dice) {
        count += this.dice[d];
      }
      return count;
    },

    reversedRollHistory() {
      return [...this.rollHistory].reverse();
    }
  },

  methods: {
    onDieClick(e, sides) {
      if (this.dice[sides] < 20) {
        this.dice[sides] += 1;
      }
    },

    onDieRtClick(e, sides) {
      if (this.dice[sides] > 0) {
        this.dice[sides] -= 1;
      }
    },

    toggleTray() {
      this.trayOpen = !this.trayOpen;
      if (this.trayOpen) {
        this.clearDice();
      }
    },

    toggleHistory() {
      this.$refs.diceHistory.toggle();
    },

    clearDice() {
      for (let d in this.dice) {
        this.dice[d] = 0;
      }
    },

    rollDice() {
      const rolls = [];

      for (let d in this.dice) {
        for (let x = 0; x < this.dice[d]; x++) {
          rolls.push({
            sides: parseInt(d),
            result: rollDie(d)
          });
        }
      }

      if (rolls.length > 0) {
        this.campaignMessenger.diceRoll({
          id: generateActionId(),
          user: this.currentUser.display_name || this.currentUser.name,
          rolls
        });
      }

      this.clearDice();
    }
  },

  mounted() {
    this.campaignMessenger.on("diceRoll", data => {
      this.rollHistory.push(data);

      if (this.rollHistory.length > 25) {
        this.rollHistory.splice(0, this.rollHistory.length - 25);
      }

      this.rollHistoryToast.push(data);
      setTimeout(() => {
        const idx = this.rollHistoryToast.findIndex(r => r.id === data.id);
        if (idx >= 0) {
          this.rollHistoryToast.splice(idx, 1);
        }
      }, 5000);
    })
  },

  components: {
    D20,
    D12,
    D10,
    D100,
    D8,
    D6,
    D4,
    AppPopup,
    DiceTrayRoll
  }
}

</script>

<style lang="scss" scoped>

  $badge-font-size: .8rem;
  $badge-height: 16px;
  $badge-padding: .15rem .2rem;

  .diceButtons {
    z-index: 8000;
    position: absolute;
    bottom: 2em;
    left: 3em;

    .diceTray {
      display: flex;
      flex-direction: column;
      align-items: start;
    }

    .die {
      width: 66px;
      height: 66px;

      .bg {
        fill: #000;
      }

      .fg {
        fill: #fff;
      }
    }

    .dieButton {
      position: relative;
      display: inline-block;
      .dieCount {
        position: absolute;
        display: block;
        top: 0;
        right: 0;
        transform: translate(50%, -25%);
        width: $badge-height;
        font-size: $badge-font-size;
        padding: $badge-padding;
        height: $badge-height;
        color: white;
        border-radius: $badge-height;
        line-height: calc(#{$badge-height * 0.5} + 1px);
        background-color: red;
      }
    }
  }

  .trayButton {
    width: 50px;
    height: 50px;
    padding: 5px 10px;
    font-weight: bold;
    font-size: 25px;
  }

  .rollButton {
    height: 50px;
    padding: 5px 10px;
  }

  .diceToast {
    z-index: 8000;
    position: absolute;
    bottom: 2em;
    left: 50%;
  }

  .rollScroller {
    max-height: 400px;
  }
</style>
