<template>
  <div>
    <input type="hidden" :name="inputName" :value="currentSelectedId" />
    <div class="select-box img-thumbnail" v-for="i in images" :key="i.id" :style="{backgroundColor: i.id === currentSelectedId ? 'blue' : 'white'}" @click="select(i)">
      <div class="img" :style="{backgroundImage: `url(${i.raw_url})`}"></div>
    </div>
  </div>
</template>

<script>

  export default {
    props: {
      inputName: {
        type: String,
        required: true
      },

      images: {
        type: Array,
        required: true
      },

      selectedId: {

      }
    },

    data() {
      return {
        currentSelectedId: this.selectedId
      }
    },

    methods: {
      select(image) {
        this.currentSelectedId = image.id;
      }
    }
  }

</script>

<style lang="scss" scoped>

  .select-box {
    display: inline-block;
    margin: 5px;
    padding: 0;
  }

  .img {
    display: inline-block;
    width: 150px;
    height: 150px;
    padding: 5px;
    background-origin: content-box;
    background-clip: content-box;
    background-repeat: no-repeat;
  }

</style>