<template>
  <div class="color-wrapper">
    <input type="hidden" :name="inputName" :value="currentValue">
    <sketch v-model="colorObject"></sketch>
  </div>
</template>

<script>

  import { Sketch } from 'vue-color'


  export default {
    props: {
      selectedValue: {
      },

      inputName: {
        type: String,
        required: true
      }
    },

    data() {
      return {
        colorObject: this.buildColorObject(this.selectedValue)
      }
    },

    computed: {
      currentValue() {
        if (this.colorObject) {
          return `rgba(${this.colorObject.rgba.r}, ${this.colorObject.rgba.g}, ${this.colorObject.rgba.b}, ${this.colorObject.rgba.a})`;
        } else {
          return null;
        }
      }
    },

    methods: {
      buildColorObject(colorStr) {
        console.log(colorStr);

        let r = 0, g = 0, b = 0, a = 1;

        if (colorStr) {
          let match = colorStr.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
          if (match) {
            r = match[1];
            g = match[2];
            b = match[3];
          }

          match = colorStr.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([0-9.]+)\)$/);
          if (match) {
            r = match[1];
            g = match[2];
            b = match[3];
            a = match[4];
          }
        }

        r = parseInt(r);
        g = parseInt(g);
        b = parseInt(b);
        a = parseFloat(a);

        return {
          rgba: {
            r: r,
            g: g,
            b: b,
            a: a
          },
          r: r,
          g: g,
          b: b,
          a: a
        }
      }
    },

    components: {
      Sketch
    }
  }

</script>

<style lang="scss" scoped>


</style>