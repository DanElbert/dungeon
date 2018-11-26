<template>
  <div class="initiative-item btn-group" :class="{'initiative-item-delete': deleting}">
    <span class="name btn flex-grow-1">{{value.name}}</span>
    <span @click="startEdit" v-if="!editMode" class="btn value">{{value.value}}</span>
    <span v-else>
      <input v-model="editValue" v-catch-external-click="saveEdit" @keyup.enter="saveEdit">
    </span>
  </div>
</template>

<script>

  export default {
    props: {
      value: {
        type: Object,
        required: true
      },

      deleting: {
        type: Boolean,
        required: false,
        default: false
      }
    },

    data() {
      return {
        editMode: false,
        editValue: null
      }
    },

    methods: {
      startEdit() {
        this.editValue = this.value.value;
        this.editMode = true;
      },

      saveEdit() {
        if (this.editValue !== this.value) {
          this.$emit("input", {id: this.value.id, name: this.value.name, value: this.editValue});
        }
        this.editMode = false;
        this.editValue = null;
      },

      attachEventHandlers() {

      },

      detachEventHandlers() {

      }
    },

    beforeDestroy() {
      this.detachEventHandlers();
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