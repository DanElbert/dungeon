<template>
  <div class="app-floater" :style="floaterStyle" @mousedown="handleMousedown" @touchstart="handleTouchstart">
    <resize-observer @notify="handleResize" />
    <slot></slot>
  </div>
</template>

<script>

  import { Rectangle, Vector2 } from "../lib/geometry";

  const dragEventMap = {
    mousemove: "handleMousemove",
    mouseup: "handleMouseup",
    mouseleave: "handleMouseleave",
    touchmove: "handleTouchmove",
    touchend: "handleTouchend",
    touchcancel: "handleTouchend"
  };

  export default {
    props: {
      floating: {
        type: Boolean,
        required: false,
        default: true
      },

      appendTo: {
        type: String,
        required: false,
        default: null
      },

      startPosition: {
        type: Object,
        required: false,
        default: null
      },

      margin: {
        type: Number,
        required: false,
        default: 5
      },

      dragSelector: {
        type: String,
        required: false,
        default: null
      },

      dragSelectorNegation: {
        type: String,
        required: false,
        default: null
      },

      hideOverlay: {
        type: Boolean,
        required: false,
        default: false
      }
    },

    data() {
      return {
        initialized: false,
        originalPosition: null,
        originalSize: null,
        originalParent: null,
        emptyPlaceholder: null,
        position: new Vector2(0, 0),
        dragData: {
          dragging: false,
          startCursor: null,
          startPosition: null
        }
      };
    },

    computed: {

      floaterStyle() {
        const p = this.position;
        const style = {};
        if (this.floating) {
          style.position = "fixed";
          style.right = "auto";
          style.bottom = "auto";
          style.left = `${p.x}px`;
          style.top = `${p.y}px`;
          style.zIndex = 8200;

          if (this.originalSize !== null) {
            style.width = `${this.originalSize.x}px`;
            style.height = `${this.originalSize.y}px`;
          }
        } else {
          style.position = "relative";
        }

        if (this.hideOverlay) {
          style.opacity = "25%";
          style["pointer-events"] = "none";
        }

        return style;
      }
    },

    methods: {
      setPosition(value) {
        const floaterRect = this.$el.getBoundingClientRect();
        const modalWidth = Math.ceil(floaterRect.width);
        const modalHeight = Math.ceil(floaterRect.height);
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        const tlAllowedRect = new Rectangle(new Vector2(0, 0), windowWidth - modalWidth, windowHeight - modalHeight).shrink(this.margin);

        //console.log(floaterRect, tlAllowedRect);
        this.position = value.confineTo(tlAllowedRect);
      },

      setupInitialPosition() {
        if (this.initialized === false && this.floating === true) {
          const elRect = this.$el.getBoundingClientRect();
          if (elRect.width > 0) {
            this.originalPosition = new Vector2(elRect.left, elRect.top);

            this.detachFromParent();
            this.$nextTick(() =>{
              if (this.startPosition) {
                this.setPosition(new Vector2(
                  this.startPosition.x < 0 ? window.innerWidth - Math.ceil(elRect.width) + this.startPosition.x : this.startPosition.x,
                  this.startPosition.y < 0 ? window.innerHeight - Math.ceil(elRect.height) + this.startPosition.y : this.startPosition.y
                ));
              } else {
                this.setPosition(this.originalPosition);
              }

              if (this.dragData.dragging) {
                this.dragData.startPosition = this.position;
              }

              this.initialized = true;
            });
          }
        }
      },

      returnToParent() {
        if (this.originalParent !== null && this.emptyPlaceholder !== null) {
          this.originalParent.replaceChild(this.$el, this.emptyPlaceholder);
          this.originalParent = null;
          this.emptyPlaceholder = null;
          this.originalSize = null;
        }
      },

      detachFromParent() {
        if (this.appendTo !== null) {
          const p = document.querySelector(this.appendTo);
          if (p !== null) {
            const elRect = this.$el.getBoundingClientRect();
            this.originalSize = new Vector2(elRect.width, elRect.height);
            this.originalParent = this.$el.parentElement;
            this.emptyPlaceholder = document.createElement("div");
            this.emptyPlaceholder.style.display = "none";
            this.originalParent.replaceChild(this.emptyPlaceholder, this.$el);
            p.appendChild(this.$el);
          }
        }
      },

      performDragStart(mousePos) {
        this.dragData.dragging = true;
        this.dragData.startCursor = mousePos;
        this.dragData.startPosition = this.position;
        this.attachDragEvents(mousePos);
        this.$emit("drag-start", mousePos);
      },

      performDragMove(mousePos) {
        const mouseDelta = mousePos.subtract(this.dragData.startCursor);
        const newPosition = this.dragData.startPosition.add(mouseDelta);

        this.setPosition(newPosition);
        this.$emit("drag-move", mousePos);
      },

      performDragEnd() {
        this.dragData.dragging = false;
        this.dragData.startCursor = null;
        this.dragData.startPosition = null;
        this.detachDragEvents();
        this.$emit("drag-end", this.position);
      },

      attachDragEvents(mousePos) {
        for (let eventName in dragEventMap) {
          let handlerName = dragEventMap[eventName];
          document.addEventListener(eventName, this[handlerName], {passive: false});
        }
      },

      detachDragEvents() {
        for (let eventName in dragEventMap) {
          let handlerName = dragEventMap[eventName];
          document.removeEventListener(eventName, this[handlerName]);
        }
      },

      handleResize() {
        this.setupInitialPosition();
      },

      handleTouchstart(e) {
        if (!e.targetTouches || e.targetTouches.length !== 1) {
          return;
        }

        if (!this.matchesDragSelector(e.target)) {
          return;
        }

        e.preventDefault();
        this.performDragStart(new Vector2(e.targetTouches[0].pageX, e.targetTouches[0].pageY));
      },

      handleTouchmove(e) {
        if (!e.targetTouches || e.targetTouches.length < 1) {
          return;
        }

        e.preventDefault();
        this.performDragMove(new Vector2(e.targetTouches[0].pageX, e.targetTouches[0].pageY));
      },

      handleTouchend() {
        this.performDragEnd();
      },

      handleMousedown(e) {
        if (e.button !== 0) {
          return;
        }

        if (!this.matchesDragSelector(e.target)) {
          return;
        }

        this.performDragStart(new Vector2(e.clientX, e.clientY));
      },

      handleMousemove(e) {
        e.preventDefault();
        const mousePoint = new Vector2(e.clientX, e.clientY);
        this.performDragMove(mousePoint);
      },

      handleMouseup(e) {
        this.performDragEnd();
      },

      handleMouseleave(e) {
        this.performDragEnd();
      },

      matchesDragSelector(el) {
        if (this.dragSelector !== null) {
          return el.matches(this.dragSelector);
          // let matches = false;
          // do {
          //   matches = el.matches(this.dragSelector);
          //
          //   if (matches) {
          //     if (this.dragSelectorNegation !== null && el.matches(this.dragSelectorNegation)) {
          //       console.log("break");
          //       matches = false;
          //       break;
          //     }
          //   }
          //
          //   el = el.parentElement;
          //
          // } while (!matches && this.$el.contains(el));
          //
          // return matches;
        } else {
          return true;
        }
      },
    },

    watch: {
      floating(val) {
        this.initialized = false;
        this.returnToParent();
        this.setupInitialPosition();
      }
    },

    mounted() {
      this.setupInitialPosition();
    },

    beforeDestroy() {
      this.detachDragEvents();
      this.returnToParent();
    }
  }

</script>

<style type="scss" scoped>

  .app-floater {
    transition: opacity 0.25s;
  }

</style>
