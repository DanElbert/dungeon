<template>
  <svg class="svg-icon" v-html="svgContent" v-bind="svgAttributes"></svg>
</template>

<script>

  // import Rose1 from "../dungeon_svg/Compass-Rose-BW.svg";
  // import Rose2 from "../dungeon_svg/CompassRose.svg";

  //console.log(Rose1);

  // const nameMap = {
  //   rose1: Rose1,
  //   rose2: Rose2
  // };

  export default {
    props: {
      icon: {
        validator: (v) => nameMap[v] !== undefined
      }
    },

    computed: {
      svgObj() {
        return nameMap[this.icon];
      },
      svgAttributes() {
        const attrs = {};
        for (let a of ['viewBox', 'xmlns']) {
          if (this.svgObj.attributes[a]) {
            attrs[a] = this.svgObj.attributes[a];
          }
        }

        return attrs;
      },
      svgContent() {
        return this.svgObj.content;
      }
    }
  }

</script>

<style lang="scss">

  .svg-icon {
    path {
      fill: currentColor;
    }
  }

</style>
