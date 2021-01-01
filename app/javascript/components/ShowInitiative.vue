<template>
  <div style="height: 100%; position: relative">
    <initiative :floating="true" :always-open="true" :start-position="{x: 100, y: 75}"></initiative>
  </div>
</template>

<script>

import Initiative from "./Initiative";
import { mapMutations } from "vuex";

export default {
  props: {
    campaignId: {
      type: Number,
      required: true
    },

    currentUser: {
      type: Object,
      required: true
    }
  },

  methods: {
    ...mapMutations([
      "setCampaignId",
      "setUser"
    ])
  },

  created() {
    this.setCampaignId(this.campaignId);
    this.setUser(this.currentUser);
  },

  components: {
    Initiative
  }
}

</script>

<style lang="scss" scoped>
</style>