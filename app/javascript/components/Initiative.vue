<template>
  <app-popup ref="popup" title="Initiative">
    <div>
      <table class="table table-sm">
        <tr>
          <th>Name</th>
          <th>Initiative</th>
          <th></th>
        </tr>
        <tr>
          <td>
            <input class="form-control" type="text" v-model="newInitiative.name" ref="nameInput" />
          </td>
          <td>
            <input class="form-control" type="number" v-model="newInitiative.value" />
          </td>
          <td>
            <button class="btn btn-primary" @click="addNewInitiative">Add</button>
          </td>
        </tr>
        <tr v-for="i in init.initiatives">
          <td>{{i.name}}</td>
          <td>{{i.value}}</td>
        </tr>
      </table>
      <button @click="sort" class="btn btn-secondary">Sort</button>
      <button @click="clear" class="btn btn-secondary">Clear</button>
      <button @click="toggleViewMode" class="btn btn-secondary">View Mode</button>
    </div>
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

</style>