<template>
  <v-md-editor v-model="text" @change="textChange" mode="edit" height="390px" :leftToolbar="leftToolbar" right-toolbar="" class="markdownEditor" :autofocus="autofocus"></v-md-editor>
</template>

<script>
import enUS from '@kangc/v-md-editor/lib/lang/en-US'
import zhEn from '@kangc/v-md-editor/lib/lang/zh-CN'
import VueMarkdownEditor from '@kangc/v-md-editor'
export default {
  name: 'markdownEditor',
  props: {
    editData: String,
    autofocus: Boolean
  },
  computed: {
    language () {
      return this.$store.getters.getLanguage
    }
  },
  data () {
    return {
      text: undefined,
      leftToolbar: 'h bold italic strikethrough quote ul ol table hr link code'
    }
  },
  mounted () {
    if (this.editData) {
      this.text = this.editData
    }
    if (this.language == 'en') {
      VueMarkdownEditor.lang.use('en-US', enUS)
    } else {
      VueMarkdownEditor.lang.use('zh-US', zhEn)
    }
  },
  methods: {
    textChange (val) {
      if (this.text !== undefined) {
        this.$emit('textChange', val)
      }
    }
  }
}
</script>
