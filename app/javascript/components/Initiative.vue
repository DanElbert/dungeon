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

    <initiative-list append-to="#initiative-popup">
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

  import {Vector2} from "../lib/geometry";
  import { mapActions, mapGetters, mapState } from "vuex";

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
        initiativeActionManager: null,
        newInitiative: initiativeFactory(),
        isViewMode: false,
        names: []
      };
    },

    computed: {
      ...mapGetters({
        typeaheadNames: "initiative/unusedNames"
      }),
      ...mapState({
        initiatives: "initiative/items"
      })
    },

    methods: {
      ...mapActions({
        ensureInitiativeMessenger: "initiative/ensureMessenger",
        sort: "initiative/sort",
        clear: "initiative/clear",
        roll: "initiative/roll",
        addInitiativeItem: "initiative/addItem"
      }),

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

      toggleViewMode() {
        this.isViewMode = !this.isViewMode;
      },

      nameSelected() {
        this.$refs.valueInput.focus();
      },

      addNewInitiative() {
        let name = this.newInitiative.name;
        let value = this.newInitiative.value;

        name = (name || "").trim();
        value = (value === null || value === undefined || value === "") ? null : parseInt(value);
        if (name === "") {
          return;
        }

        const { parsedName, parsedBonus } = this.parseName(name);

        if (value === null && !parsedBonus) {
          return;
        }

        this.addInitiativeItem({
          name: parsedName,
          bonus: parsedBonus,
          value: value
        })

        this.newInitiative = initiativeFactory();
        this.$refs.nameInput.focus();
      },

      parseName(name) {
        const match = name.match(/^(.*?)\s+([+-]\d+[+-]?)$/);
        if (match) {
          return {
            parsedName: match[1],
            parsedBonus: match[2]
          }
        } else {
          return {
            parsedName: name,
            parsedBonus: null
          }
        }
      }
    },

    created() {
      this.ensureInitiativeMessenger();
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

  .initiative::v-deep .modal-card {
      width: 18rem;
  }

  .init-drag-helper::v-deep {
    z-index: 8010;
  }


</style>