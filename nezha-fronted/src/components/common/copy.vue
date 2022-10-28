<template>
  <div class="document-copy-block">
    <span class="document-copy-text">
        <slot name="copy-text"></slot>
    </span>
    <i v-if="showInfo" class="nz-icon nz-icon-override" style="visibility: hidden" @click="onCopy(copyData)" :title="$t('overall.copyText')"></i>
  </div>
</template>

<script>
export default {
  name: 'copy',
  props: {
    copyData: String,
    showInfo: {}
  },
  data () {
    return {
    }
  },
  methods: {
    onCopy (txt) {
      this.$copyText(txt).then(() => {
        this.$message.success({ message: this.$t('overall.copySuccess') })
      })
    }
  }
}
</script>

<style>

</style>
