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

    <div class="columns">
      <div class="column">
        <div class="field">
          <div class="control">
            <div class="select is-fullwidth">
              <select v-model="editUser.user_id">
                <option :value="null">-- Add User --</option>
                <option v-for="u in usersForDropdown" :value="u.id" :key="u.id">{{ userNameByUser(u) }}</option>
              </select>
            </div>
          </div>
        </div>
      </div>


      <div class="column is-2">
        <div class="field">
          <div class="control">
            <input type="checkbox" v-model="editUser.is_gm">
          </div>
        </div>
      </div>

      <div class="column is-2">
        <button @click="addUser" type="button" class="button is-primary">Add</button>
      </div>
    </div>

    <div v-for="cu in visibleUserList" :key="cu.id || cu.key">


      <div class="columns">
        <div class="column">
          {{userNameById(cu.user_id) }}
        </div>

        <div class="column is-2">
          {{ cu.is_gm }}
        </div>


        <div class="column is-2">
          <button @click="removeUser(cu)" type="button" class="button is-danger">Remove</button>
        </div>

      </div>

    </div>


    <div class="is-hidden">
      <template v-for="cu in formUserList">
        <input type="hidden" :name="`${inputName}[${cu.id || cu.key}][id]`" :value="cu.id" v-if="cu.id !== null" />
        <input type="hidden" :name="`${inputName}[${cu.id || cu.key}][is_gm]`" :value="cu.is_gm" />
        <input type="hidden" :name="`${inputName}[${cu.id || cu.key}][user_id]`" :value="cu.user_id" />
        <input type="hidden" :name="`${inputName}[${cu.id || cu.key}][_destroy]`" :value="cu._destroy === true" />
      </template>
    </div>
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
        userList: [],
        editUser: campaignUserFactory()
      };
    },

    computed: {
      usersForDropdown() {
        return this.availableUsers.filter(user => {
          return !this.visibleUserList.map(u => u.user_id).includes(user.id);
        });
      },

      visibleUserList() {
        return this.userList.filter(cu => cu._destroy !== true);
      },

      formUserList() {
        return this.userList.filter(cu => cu.id !== null || cu._destroy !== true);
      }
    },

    methods: {
      addUser() {
        if (this.editUser.user_id !== null) {
          this.userList.push(this.editUser);
          this.editUser = campaignUserFactory();
        }
      },

      removeUser(cu) {
        cu._destroy = true;
      },

      userNameById(id) {
        const user = this.availableUsers.find(u => u.id === id) || null
        if (user !== null) {
          return this.userNameByUser(user);
        }
      },

      userNameByUser(user) {
        return `${user.name} (${user.id})`;
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