<template>
<div>
  <div v-if="games.length === 0">
    <h4 class="title is-5">No {{ title }}</h4>
  </div>
  <div v-else>
    <h4 class="title is-5">{{ title }}</h4>

    <ul class="game-list">
      <li v-for="game in games" class="box">
        <div class="game-label">
          <a :href="`/games/${game.id}`" class="name">{{ game.name }}</a>
          <br />
          <span class="timestamp">
            <span class="far fa-clock"></span> {{ formatTime(game.created_at) }}
          </span>
        </div>

        <div class="controls">
          <span v-if="isOwner">
            <a :href="`/games/${game.id}/edit`" class="button is-secondary"><span class="far fa-edit fa-fw"></span></a>
            <a :href="`/games/${game.id}`" class="button is-danger" data-confirm="Are you sure?" data-method="DELETE" title="Delete"><span class="fas fa-times fa-fw"></span></a>
          </span>

        </div>
      </li>
    </ul>

  </div>

</div>
</template>

<script>

export default {
  props: {
    games: {
      type: Array,
      required: true
    },

    title: {
      type: String,
      required: true
    },

    isOwner: {
      type: Boolean,
      required: true
    }
  },

  methods: {
    formatTime(str) {
      const pad = n => n.toString().padStart(2, "0");
      const d = new Date(str);
      const ds = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} `;
      const ts = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
      return ds + ts;
    }
  }
}

</script>