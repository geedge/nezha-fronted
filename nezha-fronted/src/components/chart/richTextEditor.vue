<template>
  <div style="position: relative" class="rich-text-editor" :class="{'rich-text-editor-error':tooLong}">
    <div :id="id" class="editor-core" ref="editor" style="height:350px;"></div>
    <slot></slot>
    <div class="text-too-long" v-if="tooLong">{{$t('validate.tooLong')}}</div>
    <el-upload
      action=""
      :auto-upload="false"
      accept=".jpg,.png"
      :on-change="uploadChange"
      style="display: none"
      ref="upload"
      >
    </el-upload>
  </div>
</template>

<script>
import 'quill/dist/quill.snow.css'
import Quill from 'quill'
export default {
  name: 'richTextEditor',
  props: {
    editData: String,
    placeholder: {
      default: '',
      type: String
    }
  },
  data () {
    return {
      id: 'editor-' + this.guid(),
      quill: null,
      options: {
        theme: 'snow',
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            ['link', 'code-block'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ color: [] }, { background: [] }],
            [{ align: [] }],
            ['image'] // 上传图片
          ]
        },
        placeholder: this.placeholder
      },
      maxLength: 0, // 记录最大长度
      tooLong: false
    }
  },
  created () {
  },
  methods: {
    initEditor: function () {
      const $self = this
      if (!this.quill) {
        this.quill = new Quill(this.$refs.editor, this.options)
        // 覆盖默认上传图片
        const toolbar = this.quill.getModule('toolbar')
        toolbar.addHandler('image', (value) => {
          if (value) {
            this.$refs.upload.$children[0].$refs.input.click()
          } else {
            this.quill.format('image', false)
          }
        })
        this.quill.on('selection-change', function (range, oldRange, source) {
          const tooltip = $self.$el.querySelector('.ql-tooltip')
          if (tooltip) {
            const left = tooltip.style.left
            if (left && /\-\d+\.?\d+?px/.test(left)) {
              tooltip.style.left = '10px'
            }
          }
        })
        this.quill.on('text-change', function (delta, oldDelta, source) {
          const length = $self.getHtml().length
          if (length > 60000) {
            const start = $self.maxLength > 0 ? $self.maxLength - 1 : 0
            const end = $self.quill.getText().length > 1 ? $self.quill.getText().length - 1 : 1
            $self.quill.deleteText(start, end, 'api')
            $self.tooLong = true
          } else {
            $self.maxLength = $self.quill.getText().length
            $self.tooLong = false
          }
          $self.$emit('textChange', $self.quill.root.innerHTML, $self.quill.getText())
        })
        this.$nextTick(() => {
          this.$emit('after-init')
          // this.$emit('textChange')
        })
      }
    },
    getHtml: function () {
      const html = `<div  class="editor-core ql-container ql-snow"><div class="ql-editor">${this.quill.root.innerHTML}</div></div>`
      return html
    },
    getContent: function () {
      if (this.tooLong) {
        return false
      } else {
        return this.getHtml()
      }
    },
    guid () {
      function S4 () {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
      }
      return (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4())
    },
    // 上传图片
    async uploadChange (file) {
      // 图片小于4M
      const isLt4M = (file.size / 1024 / 1024) < 4
      if (isLt4M) {
        const form = new FormData()
        form.append('file', file.raw)
        const res = await this.$post('/file/upload', form, { 'Content-Type': 'multipart/form-data' })
        if (res.code === 200) {
          // 获取光标所在位置
          const currentIndex = this.quill.getSelection().index
          // 插入图片
          const uploadUrl = this.$axios.defaults.baseURL + 'file/download/'
          this.quill.insertEmbed(currentIndex, 'image', `${uploadUrl}${res.data.uuid}`)
          // 调整光标到最后
          this.quill.setSelection(currentIndex + 1)
        } else {
          this.$message.error(res.msg)
        }
      } else {
        this.$message.error(this.$t('tip.imgSize'))
      }
    }
  },
  mounted () {
    this.initEditor()
    if (this.editData) {
      this.quill.clipboard.dangerouslyPasteHTML(null, this.editData, 'api')
    }
  },
  beforeDestroy () {
    this.quill.off('selection-change')
    this.quill.off('text-change')
  }
}
</script>

<style>

.rich-text-editor .ql-editor{
  overflow: auto !important;
}
.text-too-long{
  color: #F56C6C;
  font-size: 12px;
  line-height: 1;
  padding-top: 4px;
  position: absolute;
  top: 100%;
  left: 0;
}
.rich-text-editor-error  {
  border: 1px solid #F56C6C;
}
.rich-text-editor-error .ql-toolbar.ql-snow{
  border-top: unset !important;
  border-left: unset !important;
  border-right: unset !important;
}
.rich-text-editor-error .ql-container.ql-snow {
  border: unset !important
}

</style>
