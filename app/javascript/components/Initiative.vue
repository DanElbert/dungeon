<template>
  <app-popup class="initiative" ref="popup" title="Initiative">
    <div class="form-row">
      <div class="col-6">
        <label>Name</label>
      </div>
      <div class="col-3">
        <label>Initiative</label>
      </div>
    </div>

    <div class="form-row">
      <div class="col-6">
        <input class="form-control form-control-sm" type="text" v-model="newInitiative.name" ref="nameInput" />
      </div>
      <div class="col-3">
        <input class="form-control form-control-sm" type="number" v-model="newInitiative.value" />
      </div>
      <div class="col-3">
        <button class="btn btn-primary btn-sm" @click="addNewInitiative">Add</button>
      </div>
    </div>

    <draggable class="mt-3 mb-3" v-model="init.initiatives">
      <div class="initiative-item form-row" v-for="i in init.initiatives">
        <div class="col-9">
          <span class="btn btn-primary">{{i.name}}</span>
        </div>
        <div class="col-3">
          <span class="btn btn-primary">{{i.value}}</span>
        </div>
      </div>
    </draggable>


    <button @click="sort" class="btn btn-secondary btn-sm">Sort</button>
    <button @click="clear" class="btn btn-secondary btn-sm">Clear</button>
    <button @click="toggleViewMode" class="btn btn-secondary btn-sm">View Mode</button>

  </app-popup>
</template>

<script>

  import AppPopup from "./AppPopup";

  function initiativeFactory() {
    return {
      name: "",
      value: ""
    };
  }

  export default {
    props: {
      initiativeData: {
        required: true,
        type: Object
      }
    },

    data() {
      return {
        init: this.initiativeData,
        wasExternalInitUpdate: false,
        newInitiative: initiativeFactory(),
        isViewMode: false
      };
    },

    methods: {
      show() {
        this.$refs.popup.open();
      },

      hide() {
        this.$refs.popup.close();
      },

      toggle() {
        this.$refs.popup.toggle();
      },

      sort() {
        this.init.sort();
      },

      clear() {
        this.init.clear();
      },

      toggleViewMode() {
        this.isViewMode = !this.isViewMode;
      },

      updateInitiative(newData) {
        this.wasExternalInitUpdate = true;
        this.init.update(newData);
      },

      addNewInitiative() {
        if (this.newInitiative.name && this.newInitiative.value !== "") {
          this.init.add(this.newInitiative);
          this.newInitiative = initiativeFactory();
          this.$nextTick(() => {
            this.$refs.nameInput.focus();
          });
        }
      }
    },

    mounted() {
      this.$watch("init",
        function() {
          if (this.wasExternalInitUpdate) {
            this.wasExternalInitUpdate = false;
          } else {
            this.init.trigger("changed");
          }
        },
        {deep: true});
    },

    components: {
      AppPopup
    }
  }

</script>

<style lang="scss" scoped>

  .initiative {
    width: 18rem;
  }

  .initiative-item {
    .btn {
      width: 100%;
    }
  }

</style>