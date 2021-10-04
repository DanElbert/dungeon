<template>
  <div class="initiative-item field has-addons has-tooltip-top" :class="{'initiative-item-delete': deleting}" :data-tooltip="value.source">
    <p class="control name">
      <span class="button">
        {{value.name}}<sup v-if="!!value.bonus">{{value.bonus}}</sup>
      </span>
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

  sup {
    font-size: 60%;
    padding-left: 0.33em;
  }

  .initiative-item {
    width: 100%;
    position: relative;

    .value {
      width: 3.5em;
    }

    .name {
      flex-grow: 1;
      overflow: hidden;
      .button {
        width: 100%;
      }
    }
  }


</style>