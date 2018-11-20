<template>
  <div class="initiative-item btn-group" :class="{'initiative-item-delete': deleting}">
    <span class="btn flex-grow-1">{{item.name}}</span>
    <span class="btn value">{{item.value}}</span>
  </div>
</template>

<script>

  export default {
    props: {
      item: {
        type: Object,
        required: true
      },

      deleting: {
        type: Boolean,
        required: false,
        default: false
      }
    }
  }

</script>

<style lang="scss">

  .initiative-item {
    width: 100%;
    position: relative;

    .value {
      width: 3.5em;
    }
  }


</style>