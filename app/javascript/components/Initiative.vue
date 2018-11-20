<template>
  <app-popup class="initiative" ref="popup" title="Initiative" id="initiative-popup">
    <div class="form-row" v-if="!isViewMode">
      <div class="col-6">
        <label>Name</label>
      </div>
      <div class="col-3">
        <label>Initiative</label>
      </div>
    </div>

    <div class="form-row" v-if="!isViewMode">
      <div class="col-6">
        <vue-bootstrap-typeahead
            size="sm"
            v-model="newInitiative.name"
            :data="typeaheadNames"
            ref="nameInput"
            @keyup.enter="addNewInitiative"
        />
      </div>
      <div class="col-3">
        <input class="form-control form-control-sm" type="number" v-model="newInitiative.value" @keyup.enter="addNewInitiative" />
      </div>
      <div class="col-3">
        <button class="btn btn-primary btn-sm" @click="addNewInitiative">Add</button>
      </div>
    </div>

    <initiative-list class="mt-3 mb-2" append-to="#initiative-popup" :initiative-data="initiativeData">
    </initiative-list>


    <button v-if="!isViewMode" @click="sort" class="btn btn-secondary btn-sm">Sort</button>
    <button v-if="!isViewMode" @click="clear" class="btn btn-secondary btn-sm">Clear</button>
    <button @click="toggleViewMode" class="btn btn-secondary btn-sm">
      <span v-if="!isViewMode">View Mode</span>
      <span v-else>Edit Mode</span>
    </button>

  </app-popup>
</template>

<script>

  import AppPopup from "./AppPopup";
  import InitiativeList from "./InitiativeList";
  import InitiativeListItem from "./InitiativeListItem";
  import VueBootstrapTypeahead from 'vue-bootstrap-typeahead'

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
        newInitiative: initiativeFactory(),
        isViewMode: false,
        names: []
      };
    },

    computed: {
      typeaheadNames() {
        const usedNames = this.init.initiatives.map(i => i.name);
        return this.names.filter(n => usedNames.indexOf(n) === -1);
      },
    },

    methods: {
      debugEvt() {
        console.log(arguments);
      },

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

      updateNames(newNames) {
        this.names = newNames || [];
      },

      addNewInitiative() {
        if (this.newInitiative.name && this.newInitiative.value !== "") {
          this.init.add(this.newInitiative.name, this.newInitiative.value);
          this.newInitiative = initiativeFactory();
          this.$nextTick(() => {
            //this.$refs.nameInput.focus();
          });
        }
      }
    },

    components: {
      AppPopup,
      InitiativeList,
      InitiativeListItem,
      VueBootstrapTypeahead
    }
  }

</script>

<style lang="scss" scoped>

  .initiative {
    width: 18rem;
  }

  >>> .init-drag-helper {
    z-index: 8010;
  }


</style>