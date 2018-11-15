<template>
  <div class="initiative-item btn-group">
    <span class="btn flex-grow-1">{{item.name}}</span>
    <span class="btn value">{{item.value}}</span>
  </div>
</template>

<script>

  import { ElementMixin } from 'vue-slicksort';

  export default {
    mixins: [ElementMixin],

    props: {
      item: {
        type: Object,
        required: true
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