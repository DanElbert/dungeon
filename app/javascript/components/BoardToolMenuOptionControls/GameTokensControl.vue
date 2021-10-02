<template>
  <div class="select is-small">
    <select v-model="selectedValue">
      <option :value="null">-- select game --</option>
      <optgroup v-for="group in groupedGames.keys()" :key="group" :label="group">
        <option v-for="g in groupedGames.get(group)" :key="g.id" :value="g.id">{{g.name}}</option>
      </optgroup>
    </select>
  </div>
</template>

<script>

import Api from "../../lib/Api";
import BoardToolMenuOptionMixin from "../../lib/tool_menu/BoardToolMenuOptionMixin";

export default {
  mixins: [
    BoardToolMenuOptionMixin
  ],
  
  data() {
    return {
      availableGames: []
    }
  },

  computed: {
    groupedGames() {
      const groups = new Map();
      for (let g of this.availableGames) {
        if (!groups.has(g.status)) {
          groups.set(g.status, []);
        }
        groups.get(g.status).push(g);
      }
      
      return groups;
    },
    
    selectedValue: {
      get() {
        if (this.option.value) {
          return this.option.value.id;
        }
        return null;
      },
      set(val) {
        if (val) {
          const game = this.availableGames.find(g => g.id === val);
          Api.getJson(`/games/${this.option.gameId}/game_tokens/${game.id}`).then(tokens => {
            game.tokens = tokens;
            this.option.value = game;
          });
        } else {
          this.option.value = null;
        }
      }
    }
  },
  
  mounted() {
    Api.getJson(`/games/${this.option.gameId}/game_tokens`).then(games => {
      this.availableGames = games;
    });
  }
}

</script>

<style lang="scss" scoped>



</style>