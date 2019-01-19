<template>
  <div>

    <div class="columns">
      <div class="column">
        <label class="label">User</label>
      </div>
      <div class="column is-2">
        <label class="label">GM?</label>
      </div>
      <div class="column is-2 ">

      </div>
    </div>

    <div v-for="cu in userList" :key="cu.id || cu.key">
      <template v-if="cu.id !== null || cu._destroy !== true">
        <input type="hidden" :name="`${inputName}[${cu.id || cu.key}][id]`" :value="cu.id" v-if="cu.id !== null" />
        <input type="hidden" :name="`${inputName}[${cu.id || cu.key}][is_gm]`" :value="cu.is_gm" />
        <input type="hidden" :name="`${inputName}[${cu.id || cu.key}][user_id]`" :value="cu.user_id" />
        <input type="hidden" :name="`${inputName}[${cu.id || cu.key}][_destroy]`" :value="cu._destroy === true" />
      </template>

      <div class="columns" v-if="cu._destroy !== true">

        <div class="column">
          <div class="field">
            <div class="control">
              <div class="select is-fullwidth">
                <select v-model="cu.user_id">
                  <option v-for="u in availableUsers" :value="u.id" :key="u.id">{{ u.name }}</option>
                </select>
              </div>
            </div>
          </div>
        </div>


        <div class="column is-2">
          <div class="field">
            <div class="control">
              <input type="checkbox" v-model="cu.is_gm">
            </div>
          </div>
        </div>

        <div class="column is-2">
          <button @click="removeUser(cu)" type="button" class="button is-danger">Remove</button>
        </div>

      </div>

    </div>

    <button @click="addRow" type="button" class="button is-primary">Add User</button>
  </div>
</template>

<script>

  function campaignUserFactory() {
    return {
      id: null,
      key: Date.now(),
      user_id: null,
      is_gm: false,
      _destroy: false
    };
  }

  export default {

    props: {
      inputName: {
        type: String,
        required: true
      },

      availableUsers: {
        type: Array,
        required: true
      },

      campaignUsers: {
        type: Array,
        required: true
      }
    },

    data() {
      return {
        userList: []
      };
    },

    computed: {

    },

    methods: {
      addRow() {
        this.userList.push(campaignUserFactory());
      },

      removeUser(cu) {
        cu._destroy = true;
      }
    },

    created() {
      this.$watch("campaignUsers",
        function(newVal) {
          this.userList = newVal.map(cu => Object.assign(campaignUserFactory(), cu));
        },
        {immediate: true}
      );
    }
  }

</script>

<style lang="scss" scoped>

</style>