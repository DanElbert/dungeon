<template>
  <div>

    <input
        ref="textInput"
        type="text"
        autocomplete="off"

        :id="id"
        :name="name"
        :placeholder="placeholder"
        :value="rawValue"
        :class="finalInputClass"

        @blur="blurHandler"
        @input="inputHandler"
        @keydown="keydownHandler"
    />
    <div v-show="isListOpen">
      <div class="panel">
        <a href="#" v-for="(opt, idx) in options" :key="optionKey(opt)" class="panel-block" :class="optionClass(idx)" @mousemove="optionMousemove(idx)" @click.prevent="optionClick(opt)">
          <span class="panel-icon">
            <i class="fas fa-angle-double-right"></i>
          </span>
          <span class="opt_value">{{ optionValue(opt) }}</span>
        </a>
      </div>
    </div>
  </div>
</template>

<script>

  import _ from "underscore";
  import Vue from 'vue';

  export default {
    props: {
      value: String,
      id: String,
      placeholder: String,
      name: String,
      inputClass: {
        type: [String, Object, Array],
        required: false,
        default: null
      },
      minLength: {
        type: Number,
        default: 0
      },
      debounce: {
        type: Number,
        required: false,
        default: 250
      },

      valueAttribute: String,
      labelAttribute: String,

      onGetOptions: Function,
      searchOptions: Array
    },

    data() {
      return {
        options: [],
        rawValue: "",
        isListOpen: false,
        activeListIndex: 0
      }
    },

    created() {
      this.rawValue = this.value;

    },

    watch: {
      value(newValue) {
        this.rawValue = newValue;
      }
    },

    computed: {
      finalInputClass() {
        let cls = ['input'];
        if (this.inputClass === null) {
          return cls;
        } else if (Array.isArray(this.inputClass)) {
          return cls.concat(this.inputClass);
        } else {
          cls.push(this.inputClass);
          return cls;
        }
      },

      debouncedUpdateOptions() {
        return _.debounce(this.updateOptions, this.debounce);
      }
    },

    methods: {
      focus() {
        this.$refs.textInput.focus();
      },

      optionClass(idx) {
        return this.activeListIndex === idx ? 'is-active' : '';
      },

      optionClick(opt) {
        this.selectOption(opt);
      },

      optionKey(opt) {
        if (this.valueAttribute) {
          return opt[this.valueAttribute];
        } else {
          return opt.toString();
        }
      },

      optionValue(opt) {
        return this.optionKey(opt);
      },

      optionLabel(opt) {
        if (this.labelAttribute) {
          return opt[this.labelAttribute];
        } else {
          return null;
        }
      },

      optionMousemove(idx) {
        this.activeListIndex = idx;
      },

      blurHandler(evt) {
        // blur fires before click.  If the blur was fired because the user clicked a list item, immediately hiding the list here
        // would prevent the click event from firing
        setTimeout(() => {
          this.isListOpen = false;
        },250);
      },

      inputHandler(evt) {
        const newValue = evt.target.value;

        if (this.rawValue !== newValue) {

          this.rawValue = newValue;

          this.$emit("input", newValue);

          if (newValue.length >= Math.max(1, this.minLength)) {
            this.debouncedUpdateOptions(newValue);
          } else {
            this.isListOpen = false;
          }
        }
      },

      keydownHandler(evt) {
        if (this.isListOpen === false)
          return;

        switch (evt.key) {
          case "ArrowUp":
            evt.preventDefault();
            this.activeListIndex = Math.max(0, this.activeListIndex - 1);
            break;
          case "ArrowDown":
            evt.preventDefault();
            this.activeListIndex = Math.min(this.options.length - 1, this.activeListIndex + 1);
            break;
          case "Enter":
            evt.preventDefault();
            this.selectOption(this.options[this.activeListIndex]);
            break;
          case "Escape":
            evt.preventDefault();
            evt.stopPropagation();
            this.isListOpen = false;
            break;
        }
      },

      selectOption(opt) {
        this.rawValue = this.optionValue(opt);
        this.$emit("input", this.rawValue);
        this.$emit("optionSelected", opt);
        this.isListOpen = false;
      },

      updateOptions(value) {
        let p = null;
        if (this.searchOptions) {
          const reg = new RegExp("^" + value, "i");
          const matcher = o => reg.test(this.optionValue(o));
          p = Promise.resolve(this.searchOptions.filter(matcher));
        } else {
          p = this.onGetOptions(value)
        }

        p.then(opts => {
          this.options = opts;
          this.isListOpen = opts.length > 0;
          this.activeListIndex = 0;
        })
      }
    }
  }

</script>

<style lang="scss" scoped>

  @import "../styles/variables";

  .panel {
    position: absolute;
    z-index: 8005;
    background-color: $white;
    width: 60%;
  }

  .option-list {
    display: block;
    position: absolute;
    width: 100%;
    z-index: 8010;
    background-color: $grey-light;
  }

  .option-item {

  }

</style>