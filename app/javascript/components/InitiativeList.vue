<template>
  <div>
    <transition-group name="init-list" tag="div">
      <div ref="children" v-for="(item, idx) in internalValue" :key="item.id" :data-index="idx">
        <app-floater :floating="item.id === floatingId" append-to="body" drag-selector=".initiative-item .name" @drag-start="dragStart(item.id, $event)" @drag-end="dragEnd(item.id, $event)" @drag-move="dragMove(item.id, $event)">
          <initiative-list-item :deleting="item.id === floatingId && hoverIdx === null" :value="item" @input="updateItem"></initiative-list-item>
        </app-floater>
        <initiative-list-item class="placeholder" v-if="item.id === floatingId" :value="item"></initiative-list-item>
      </div>
    </transition-group>
  </div>
</template>

<script>

  import AppFloater from "./AppFloater";
  import InitiativeListItem from "./InitiativeListItem";
  import { Rectangle, Vector2 } from "../lib/geometry";
  import { mapActions, mapState } from "vuex";

  export default {
    props: {
      appendTo: {
        required: false,
        type: String,
        default: 'body'
      }
    },

    data() {
      return {
        internalValue: [],
        floatingId: null,
        hoverIdx: null,
        centerPointCache: null
      }
    },

    methods: {
      ...mapActions({
        moveItem: "initiative/moveItem",
        removeItem: "initiative/removeItem",
        updateItem: "initiative/updateItem"
      }),

      test() {
        console.log(arguments);
      },

      dragStart(id, position) {
        this.floatingId = id;
        this.hoverIdx = this.internalValue.findIndex(i => i.id === id);
        this.centerPointCache = [];

        this.$refs.children.forEach(el => {
          const elBounds = Rectangle.fromElement(el);
          this.centerPointCache[parseInt(el.dataset.index)] = elBounds.center();
        });
      },

      dragMove(id, position) {
        this.hoverIdx = null;
        let dragItemIdx = this.internalValue.findIndex(i => i.id === this.floatingId);

        const listBounds = Rectangle.fromElement(this.$el);
        if (listBounds.containsPoint(position)) {

          let closest = { dist: null, index: null };
          for (let i = 0; i < this.centerPointCache.length; i++) {
            const distance = this.centerPointCache[i].distance(position);
            if (closest.dist === null || distance < closest.dist) {
              closest = { dist: distance, index: i };
            }
          }
          this.hoverIdx = closest.index;
        }

        if (this.hoverIdx !== null) {
          if (dragItemIdx !== this.hoverIdx) {
            const old = this.internalValue.splice(dragItemIdx, 1);
            this.internalValue.splice(this.hoverIdx, 0, ...old);
          }
        }
      },

      dragEnd(id, position) {
        if (this.hoverIdx === null) {
          this.removeItem({id: id});
        } else {
          this.moveItem({id: id, newIdx: this.hoverIdx});
        }

        this.floatingId = null;
        this.hoverIdx = null;
        this.centerPointCache = null;
      }
    },

    created() {
      this.$watch(() => this.$store.state.initiative.items,
          () => { this.internalValue = [...this.$store.state.initiative.items] },
          {
            immediate: true,
            deep: true
          });
    },

    components: {
      AppFloater,
      InitiativeListItem
    }
  }

</script>

<style lang="scss">

  .placeholder {
    position: relative;
    opacity: 0;
  }

  .init-list-move {
    transition: transform 0.25s;
  }

  .init-list-enter-active, .init-list-leave-active {
    transition: all 0.5s;
  }
  .init-list-enter, .init-list-leave-to /* .list-leave-active below version 2.1.8 */ {
    opacity: 0;
    transform: scaleY(0.1);
  }

  .init-list-item {
    //display: block;
    //transition: all 1s;
  }

</style>