<template>
  <div>
    <div class="select is-small">
      <select v-model="selectedValue">
        <option v-for="i in availableImages" :key="i.value" :value="i.value" :class="i.class">{{i.name}}</option>
      </select>
    </div>

    <app-popup ref="popup" title="Add Token Image" :start-position="popupStartPosition" @close="cancelImage">

      <form ref="imageForm">
        <input type="hidden" name="image[visible]" value="true" />
        <div class="field">
          <label for="token_image_name" class="label">Name</label>
          <input id="token_image_name" type="text" class="input" name="image[name]" ref="nameInput" v-model="editName" />
        </div>

        <div class="field">
          <div class="file">
            <label class="file-label">
              <input type="file" class="file-input" name="image[filename]" ref="fileInput" @change="updateEditFile" />
              <span class="file-cta">
              <span class="file-icon">
                <font-awesome-icon :icon="['fas', 'upload']"></font-awesome-icon>
              </span>
              <span class="file-label">
                Choose a file…
              </span>
            </span>
              <span class="file-name"></span>
            </label>
          </div>
        </div>
      </form>

      <template v-slot:footer>
        <button type="button" class="button is-primary" @click="saveImage" v-if="canSave">Save</button>
        <button type="button" class="button is-danger" @click="cancelImage">Cancel</button>
      </template>
    </app-popup>

  </div>
</template>

<script>
  import Api from "../../lib/Api";
  import BoardToolMenuOptionMixin from "../../lib/tool_menu/BoardToolMenuOptionMixin";
  import { flashMessage } from "../../lib/FlashMessages";
  import { Vector2 } from "../../lib/geometry";

  import AppPopup from "../AppPopup";

  export default {
    mixins: [
      BoardToolMenuOptionMixin
    ],

    data() {
      return {
        popupStartPosition: new Vector2(100, 100),
        isEditing: false,
        editName: '',
        editFile: null
      };
    },

    computed: {
      selectedValue: {
        get() {
          if (this.isEditing) {
            return -1;
          } else if (this.option && this.option.value) {
            return this.option.value.id;
          } else {
            return null;
          }
        },

        set(val) {
          if (val === -1) {
            this.isEditing = true;
            this.$refs.popup.open();
          } else if (val) {
            this.option.value = this.option.images.find(i => i.id === val);
          } else {
            this.option.value = null;
          }
        }
      },

      isOwner() {
        return this.drawingSettings.isOwner;
      },

      availableImages() {
        let items = [];
        if (this.option && this.option.images) {
          if (this.isOwner) {
            items = this.option.images.map(i => ({ name: i.name, value: i.id }));
          } else {
            items = this.option.images.filter(i => i.visible === true).map(i => ({ name: i.name, value: i.id }));
          }

        }
        items.unshift({name: 'Add new token...', value: -1, class: 'add_new'});
        items.unshift({name: '== None ==', value: null, class: 'none'});
        return items;
      },

      canSave() {
        return this.editName !== null && this.editName.length > 2 && this.editFile !== null;
      }
    },

    methods: {
      clearForm() {
        this.editName = "";
        this.$refs.fileInput.value = ""
        this.$refs.fileInput.dispatchEvent(new Event("change"));
      },

      saveImage() {
        const data = new FormData(this.$refs.imageForm);
        const campaign_id = this.option.campaign_id;
        Api.postFormData(`/campaigns/${campaign_id}/token_images`, data)
          .then(json => {
            flashMessage("success", "Token image created.");
          })
          .catch(err => {
            flashMessage("danger", `Token image not created. Error: ${err.toString()}`)
          });

        this.isEditing = false;
        this.clearForm();
        this.$refs.popup.close();
      },

      cancelImage() {
        this.isEditing = false;
        this.clearForm();
        this.$refs.popup.close();
      },

      updateEditFile() {
        this.editFile = this.$refs.fileInput.value;
      }
    },

    mounted() {
      //setupFileInput(this.$refs.fileInput);
    },

    components: {
      AppPopup
    }
  }

</script>

<style lang="scss" scoped>

  select option.add_new {
    font-weight: bold;
  }

  select option.none {
  }

</style>