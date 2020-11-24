<template>
  <app-popup class="initiative" ref="popup" title="Initiative" id="initiative-popup" :floating="floating" :always-open="!floating || alwaysOpen" :start-position="startPosition" :hide-overlay="hideOverlay">
    <div class="columns is-mobile is-variable is-1" v-if="!isViewMode">
      <div class="column is-half">
        <label>
          Name
          <sup class="name-info has-tooltip-right" data-tooltip="<name> [+|-]<bonus>">
            <font-awesome-layers class="fa-lg">
              <font-awesome-icon icon="circle" />
              <font-awesome-icon icon="question" transform="shrink-6" :style="{ color: 'white' }" />
            </font-awesome-layers>
          </sup>
        </label>
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
      <button v-if="!isViewMode" @click="roll" class="button is-secondary is-small">Roll</button>
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

  import InitiativeData from "../lib/InitiativeData";
  import { ActionMessenger } from "../lib/ActionMessenger";
  import { generateActionId } from "../lib/Actions";
  import {Vector2} from "../lib/geometry";

  function initiativeFactory() {
    return {
      name: "",
      value: ""
    };
  }

  export default {
    props: {
      floating: {
        required: false,
        type: Boolean,
        default: true
      },

      campaignId: {
        required: true,
        type: Number
      },

      alwaysOpen: {
        type: Boolean,
        required: false,
        default: false
      },

      startPosition: {
        required: false,
        type: Object,
        default: () => new Vector2(-15, 15)
      },

      hideOverlay: {
        type: Boolean,
        required: false,
        default: false
      }
    },

    data() {
      return {
        initiativeData: null,
        initiativeActionManager: null,
        newInitiative: initiativeFactory(),
        isViewMode: false,
        names: []
      };
    },

    computed: {
      typeaheadNames() {
        const usedNames = this.initiativeData.initiatives.map(i => i.name);
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
        this.initiativeData.sort();
      },

      clear() {
        this.initiativeData.clear();
      },

      roll() {
        this.initiativeData.roll();
      },

      toggleViewMode() {
        this.isViewMode = !this.isViewMode;
      },

      nameSelected() {
        this.$refs.valueInput.focus();
      },

      addNewInitiative() {
        if (this.initiativeData.add(this.newInitiative.name, this.newInitiative.value)) {
          this.newInitiative = initiativeFactory();
          this.$refs.nameInput.focus();
        }
      },

      handleAddActionMessage(message) {
        switch (message.actionType) {
          case "updateInitiativeAction":
            this.update(message.initiative, message.initiative_names);
            break;
        }
      },

      handleDataChanged() {
        // send new action
        const action = {actionType: "updateInitiativeAction", initiative: this.initiativeData.initiatives, uid: generateActionId()};
        this.initiativeActionManager.sendActionMessage(action);
      },

      update(initiatives, names) {
        if (initiatives !== null) {
          this.initiativeData.update(initiatives);
        }
        if (names !== null) {
          this.names = names || [];
        }
      }
    },

    mounted() {
      if (this.initiativeActionManager.connected) {
        this.initiativeActionManager.channel.perform("get_data");
      } else {
        this.initiativeActionManager.onConnected = () => { this.initiativeActionManager.channel.perform("get_data"); this.initiativeActionManager.onConnected = null; }
      }
    },

    created() {
      this.initiativeData = new InitiativeData();
      this.initiativeData.on("changed", () => this.handleDataChanged());

      this.initiativeActionManager = new ActionMessenger("InitiativeChannel", { campaign_id: this.campaignId }, message => {
        this.handleAddActionMessage(message);
      });
      this.initiativeActionManager.ignoreReflections = false;
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

  .name-info {
    font-size: 0.4em;
  }

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