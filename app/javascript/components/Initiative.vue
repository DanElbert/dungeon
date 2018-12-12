<template>
  <app-popup class="initiative" ref="popup" title="Initiative" id="initiative-popup" :floating="floating" :always-open="!floating">
    <div class="columns is-mobile is-variable is-1" v-if="!isViewMode">
      <div class="column is-half">
        <label>Name</label>
      </div>
      <div class="column is-one-quarter">
        <label>Initiative</label>
      </div>
    </div>

    <div class="columns is-mobile is-variable is-1" v-if="!isViewMode">
      <div class="column is-half">
        <app-auto-complete
            v-model="newInitiative.name"
            :searchOptions="typeaheadNames"
            ref="nameInput"
            input-class="is-small"
            @optionSelected="nameSelected"
        >
        </app-auto-complete>
      </div>
      <div class="column is-one-quarter">
        <input class="input is-small" type="number" ref="valueInput" v-model="newInitiative.value" @keyup.enter="addNewInitiative" />
      </div>
      <div class="column is-one-quarter">
        <button class="button is-secondary is-small" @click="addNewInitiative">Add</button>
      </div>
    </div>

    <initiative-list append-to="#initiative-popup" :initiative-data="initiativeData">
    </initiative-list>

    <template slot="footer">
      <button v-if="!isViewMode" @click="sort" class="button is-secondary is-small">Sort</button>
      <button v-if="!isViewMode" @click="clear" class="button is-secondary is-small">Clear</button>
      <button @click="toggleViewMode" class="button is-secondary is-small">
        <span v-if="!isViewMode">View Mode</span>
        <span v-else>Edit Mode</span>
      </button>
    </template>

  </app-popup>
</template>

<script>

  import AppAutoComplete from "./AppAutocomplete";
  import AppPopup from "./AppPopup";
  import InitiativeList from "./InitiativeList";
  import InitiativeListItem from "./InitiativeListItem";

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
      },

      floating: {
        required: false,
        type: Boolean,
        default: true
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

      nameSelected() {
        this.$refs.valueInput.focus();
      },

      updateNames(newNames) {
        this.names = newNames || [];
      },

      addNewInitiative() {
        if (this.newInitiative.name && this.newInitiative.value !== "") {
          this.init.add(this.newInitiative.name, this.newInitiative.value);
          this.newInitiative = initiativeFactory();
          this.$refs.nameInput.focus();
        }
      }
    },

    components: {
      AppAutoComplete,
      AppPopup,
      InitiativeList,
      InitiativeListItem
    }
  }

</script>

<style lang="scss" scoped>

  .initiative {
    width: 18rem;

    .column {
      padding-top: 0.1em;
      padding-bottom: 0.1em;
    }
  }

  .initiative /deep/ .modal-card {
      width: 18rem;
  }

  /deep/ .init-drag-helper {
    z-index: 8010;
  }


</style>