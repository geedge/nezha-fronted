<template>
  <div class="integration-configuration">
    <div class="integration-configuration-scroll">
      <v-md-preview :text="configuration" @copy-code-success="handleCopyCodeSuccess"></v-md-preview>
    </div>
  </div>
</template>

<script>
export default {
  name: 'integration-configuration',
  props: {
    configuration: String
  },
  data () {
    return {
    }
  },
  methods: {
    handleCopyCodeSuccess (code) {
      this.$message.success({ message: this.$t('overall.copySuccess') })
    }
  }
}
</script>
