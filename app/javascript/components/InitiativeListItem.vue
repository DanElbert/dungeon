<template>
  <div class="initiative-item field has-addons" :class="{'initiative-item-delete': deleting}">
    <p class="control name">
      <span class="button">{{value.name}}</span>
    </p>
    <p class="control" v-if="!editMode">
      <span @click="startEdit" class="button value">{{value.value}}</span>
    </p>
    <p class="control" v-else>
      <input class="input value" type="number" v-model="editValue" ref="editInput" v-catch-external-click="saveEdit" @keyup.enter="saveEdit">
    </p>
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
        requestAnimationFrame(() => {
          this.editMode = true;

          this.$nextTick(() => {
            this.$refs.editInput.focus();
            this.$refs.editInput.select();
          });
        });
      },

      saveEdit() {
        if (this.editValue !== this.value.value) {
          this.$emit("input", {id: this.value.id, name: this.value.name, value: this.editValue});
        }
        this.editMode = false;
        this.editValue = null;
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

    .name {
      flex-grow: 1;
      .button {
        width: 100%;
      }
    }
  }


</style>