<template>
  <div class="wrapper">
    <D10></D10>
    <D10></D10>
  </div>
</template>

<script>

import D10 from "../dungeon_svg/d10.svg";

export default {
  components: {
    D10
  }
}

</script>

<style lang="scss" scoped>
.wrapper {
  display: flex;
  align-items: center;
}

svg {
  width: 50%;
  height: 50%;
}
</style>
