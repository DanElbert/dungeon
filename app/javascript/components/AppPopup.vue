<template>
  <div ref="modal" :style="modalStyle" class="modal modeless" role="dialog">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header" @mousedown="handleMousedown">
          <h4 class="modal-title">{{ title }}</h4>
          <button type="button" class="close" data-dismiss="modal">&times;</button>
        </div>
        <div class="modal-body">
          <slot></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

  import bsn from "bootstrap.native/dist/bootstrap-native-v4";
  import { Rectangle, Vector2 } from "../lib/geometry";

  const dragEventMap = {
    mousemove: "handleMousemove",
    mouseup: "handleMouseup",
    mouseleave: "handleMouseleave"
  };

  export default {
    props: {
      title: {
        required: true,
        type: String
      }
    },

    data() {
      return {
        modal: null,
        isOpen: false,
        position: null,
        mouseDownCursorPosition: null,
        mouseDownModalPosition: null
      };
    },

    computed: {
      modalStyle() {
        if (this.position === null ) {
          return {
            top: "auto",
            left: "auto"
          };
        } else {
          return {
            top: this.position.y + "px",
            left: this.position.x + "px"
          };
        }
      }
    },

    methods: {
      open() {
        this.modal.open();
      },

      close() {
        this.modal.close();
      },

      toggle() {
        this.modal.toggle();
      },

      handleMousedown(e) {
        this.attachDragEvents(new Vector2(e.clientX, e.clientY));
      },

      handleMousemove(e) {
        const mousePoint = new Vector2(e.clientX, e.clientY);
        const mouseDelta = mousePoint.subtract(this.mouseDownCursorPosition);
        const newPosition = this.mouseDownModalPosition.add(mouseDelta);

        const modalRect = this.$el.getBoundingClientRect();
        const modalWidth = modalRect.width;
        const modalHeight = modalRect.height;
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        const tlAllowedRect = new Rectangle(new Vector2(0, 0), windowWidth - modalWidth, windowHeight - modalHeight).shrink(5);

        this.position = newPosition.confineTo(tlAllowedRect);
      },

      handleMouseup(e) {
        this.detachDragEvents();
      },

      handleMouseleave(e) {
        this.detachDragEvents();
      },

      attachDragEvents(mousePos) {
        this.mouseDownCursorPosition = mousePos;
        this.mouseDownModalPosition = this.position;
        for (let eventName in dragEventMap) {
          let handlerName = dragEventMap[eventName];
          document.addEventListener(eventName, this[handlerName]);
        }
      },

      detachDragEvents() {
        this.mouseDownCursorPosition = null;
        this.mouseDownModalPosition = null;
        for (let eventName in dragEventMap) {
          let handlerName = dragEventMap[eventName];
          document.removeEventListener(eventName, this[handlerName]);
        }
      }

    },

    mounted() {
      this.modal = new bsn.Modal(this.$el, {
        backdrop: false
      });

      this.$el.addEventListener('shown.bs.modal', () => {
        if (this.position === null) {
          const modalRect = this.$el.getBoundingClientRect();
          this.position = new Vector2(window.innerWidth - modalRect.width - 15, 15);
        }
        this.isOpen = true;
        this.$emit("opened");
      });

      this.$el.addEventListener('hidden.bs.modal', () => {
        this.isOpen = false;
        this.$emit("closed");
      });
    },

    beforeDestroy() {
      this.detachDragEvents();
    }
  }

</script>

<style lang="scss" scoped>

  .modal {
    overflow: hidden;
    right: auto;
    bottom: auto;
    z-index: 8000;

    .modal-header {
      cursor: move;
    }

    .modal-dialog {
      margin: 0;
    }
  }

</style>