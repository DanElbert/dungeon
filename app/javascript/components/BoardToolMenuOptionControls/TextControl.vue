<template>
  <div class="field has-addons">
    <div class="control">
      <input type="text" class="input is-small" :value="currentValue" @input="valueChanged" :placeholder="placeholderText" />
    </div>
    <div class="control" v-if="showSave">
      <a class="button is-primary is-small" @click="confirmChange">
        Update
      </a>
    </div>
  </div>
</template>

<script>

  import BoardToolMenuOptionMixin from "../../lib/tool_menu/BoardToolMenuOptionMixin";

  export default {
    mixins: [
      BoardToolMenuOptionMixin
    ],

    data() {
      return {
        tempValue: null
      }
    },

    computed: {
      confirmMode() {
        return this.option.confirmMode === true;
      },

      placeholderText() {
        return this.option.placeholder || "";
      },

      currentValue() {
        if (this.confirmMode) {
          return this.tempValue;
        } else {
          return this.option.value;
        }
      },

      showSave() {
        return this.confirmMode && this.tempValue !== this.option.value;
      }
    },

    methods: {
      valueChanged(e) {
        if (this.confirmMode) {
          this.tempValue = e.target.value;
        } else {
          this.option.value = e.target.value;
        }
      },

      confirmChange() {
        this.option.value = this.tempValue;
      }
    },

    created() {
      this.$watch("option.value", function(newVal, oldVal) {
          this.tempValue = newVal;
        },
        {immediate: true});
    }
  }

</script>

<style lang="scss" scoped>



</style>