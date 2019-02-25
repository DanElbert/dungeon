<template>
  <div class="img">
    <img ref="img" @load="calcAspect" @error="retry" v-if="internalUrl !== null" :src="internalUrl" alt="copied image" :class="aspect" />
  </div>
</template>

<script>

  import BoardToolMenuOptionMixin from "../../lib/BoardToolMenuOptionMixin";

  export default {
    mixins: [
      BoardToolMenuOptionMixin
    ],

    data() {
      return {
        retryHandle: null,
        internalUrl: null,
        aspect: 'wide'
      };
    },

    computed: {
    },

    methods: {

      calcAspect() {
        if (this.$refs.img.height > this.$refs.img.width) {
          this.aspect = "tall";
        } else {
          this.aspect = "wide";
        }
      },

      retry() {
        this.cancelRetries();
        const url = this.internalUrl;
        this.internalUrl = null;
        this.retryHandle = setTimeout(() => {
          this.internalUrl = url;
          this.retryHandle = null;
        }, 1500);
      },

      cancelRetries() {
        if (this.retryHandle !== null) {
          clearTimeout(this.retryHandle);
          this.retryHandle = null;
        }
      }

    },

    created() {
      this.$watch("option.url", (newVal, oldVal) => {
        this.cancelRetries();
        this.internalUrl = newVal || null;
      }, {
        immediate: true
      });
    }
  }

</script>

<style lang="scss" scoped>

  .img {
    width: 50px;
    background-color: white;

    img.wide {
      width: 100%;
    }

    img.tall {
      width: auto;
      height: 100%;
    }
  }

</style>