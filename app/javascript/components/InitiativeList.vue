<template>
  <slick-list :helper-class="helperClass" :append-to="appendTo" ref="container" :value="value" @input="handleInput" @sort-move="updateHelperClasses" @sort-end="checkForRemoval">
    <initiative-list-item v-for="(item, idx) in value" :item="item" :index="idx"></initiative-list-item>
  </slick-list>
</template>

<script>

  import { ContainerMixin, SlickList } from 'vue-slicksort';
  import InitiativeListItem from "./InitiativeListItem";
  import { Rectangle, Vector2 } from "../lib/geometry";

  export default {
    //mixins: [ContainerMixin],

    props: {
      value: {
        type: Array,
        required: true
      },

      helperClass: {
        required: false,
        type: String,
        default: ''
      },

      appendTo: {
        required: false,
        type: String,
        default: 'body'
      }
    },

    data() {
      return {
        deleteIndex: null
      }
    },

    computed: {
    },

    methods: {
      handleInput(val) {
        if (this.deleteIndex !== null) {
          val.splice(this.deleteIndex, 1);
          this.deleteIndex = null;
        }

        this.$emit("input", val);
      },

      updateHelperClasses({event}) {
        const helper = this.$refs.container.helper;
        if (!this.helper) {
          return;
        }

        if (this.isPointInsideElement(event)) {
          this.helper.classList.remove("initiative-item-delete");
        } else {
          this.helper.classList.add("initiative-item-delete");
        }
      },

      checkForRemoval({event, oldIndex, newIndex, collection}) {
        if (!this.isPointInsideElement(event)) {
          this.deleteIndex = newIndex;
        }
      },

      isPointInsideElement(event) {
        const mousePoint = new Vector2(event.clientX, event.clientY);
        const containerBounds = this.$el.getBoundingClientRect();
        const containerRect = new Rectangle(new Vector2(containerBounds.x, containerBounds.y), containerBounds.height, containerBounds.width);
        return containerRect.containsPoint(mousePoint);
      }
    },

    created() {
    },

    components: {
      InitiativeListItem,
      SlickList
    }
  }

</script>

<style lang="scss">



</style>