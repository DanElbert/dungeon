<template>
  <div class="roll">
    <div class="rollInfo">
      <span class="user">{{ roll.user }}</span>
      <span>{{ individualRolls }}</span>
      <span>{{ rollDescription }}</span>
    </div>
    <div class="separator">
      =
    </div>
    <div class="rollTotal">
      {{ sum }}
    </div>
  </div>
</template>

<script>

export default {
  props: {
    roll: {
      type: Object,
      required: true
    }
  },

  computed: {
    sum() {
      let total = 0;

      for (const r of this.roll.rolls) {
        total += r.result;
      }

      return total;
    },

    orderedRolls() {
      const rolls = [...this.roll.rolls];
      return rolls.sort((a, b) => { a.sides - b.sides });
    },

    individualRolls() {
      return this.orderedRolls.map(r => r.result).join(' + ');
    },

    rollDescription() {
      const diceGroups = new Map();

      for (const roll of this.orderedRolls) {
        if (!diceGroups.has(roll.sides)) {
          diceGroups.set(roll.sides, 0);
        }
        diceGroups.set(roll.sides, diceGroups.get(roll.sides) + 1);
      }

      return [...diceGroups].map(e => `${e[1]}d${e[0]}`).join(" + ");
    }
  },

  components: {
  }
}

</script>

<style lang="scss" scoped>

.roll {
  display: flex;
  align-items: center;
}

.rollInfo {
  display: flex;
  flex-direction: column;
  padding: 0 1rem;

  .user {
    font-weight: bold;
  }
}

.rollTotal {
  padding: 1rem;
  font-size: 150%;
  font-weight: bold;
}

</style>
