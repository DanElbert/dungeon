<template>
  <font-awesome-icon :icon="tokenIcon.fontAwesomeId" :style="{color: tokenIcon.color}"></font-awesome-icon>
</template>

<script>

export default {
  props: {
    tokenIcon: {
      type: Object,
      required: true
    }
  }
}

</script>