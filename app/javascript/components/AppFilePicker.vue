<template>
  <div class="file">
    <label class="file-label">
      <input type="file" class="file-input" :name="name" @change="fileInputChanged" ref="fileInput" />
      <span class="file-cta">
        <span class="file-icon">
          <font-awesome-icon :icon="['fas', 'upload']"></font-awesome-icon>
        </span>
        <span class="file-label">
          Choose a file…
        </span>
      </span>
      <span class="file-name">{{filename}}</span>
    </label>
  </div>
</template>

<script>
  export default {
    props: {
      name: {
        type: String
      },

      initialFilename: {
        type: String
      }
    },

    data() {
      return {
        filename: ''
      }
    },

    methods: {
      fileInputChanged() {
        const el = this.$refs.fileInput;
        if (el.files.length > 0) {
          this.filename = el.files[0].name;
        } else {
          this.filename = "";
        }
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>