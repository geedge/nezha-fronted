'use strict'

const _interopRequireDefault = require('@babel/runtime/helpers/interopRequireDefault')

exports.__esModule = true
exports.default = createCopyCodePreview

const _copyToClipboard = _interopRequireDefault(require('copy-to-clipboard'))

function isCopyButton (el) {
  return el.classList.contains('v-md-copy-code-btn')
}

function findCodeWrapperEl (el) {
  if (el.classList.contains('v-md-pre-wrapper')) {
    return el
  }

  return findCodeWrapperEl(el.parentNode)
}

function getPreviewEl (el) {
  const previewElClass = 'v-md-editor-preview'
  return el.classList.contains(previewElClass) ? el : el.querySelector('.' + previewElClass)
}

function createCopyCodePreview () {
  return {
    install: function install (VMdEditor) {
      if (!VMdEditor.mixins) VMdEditor.mixins = []
      VMdEditor.mixins.push({
        mounted: function mounted () {
          const _this = this

          this.$nextTick(function () {
            const previewEl = getPreviewEl(_this.$el)
            previewEl.addEventListener('click', _this.handleCopyCodeClick)
          })
        },
        beforeDestroy: function beforeDestroy () {
          const previewEl = getPreviewEl(this.$el)
          previewEl.removeEventListener('click', this.handleCopyCodeClick)
        },
        methods: {
          handleCopyCodeClick: function handleCopyCodeClick (_ref) {
            const target = _ref.target

            if (isCopyButton(target)) {
              const codeWrapper = findCodeWrapperEl(target.parentNode)

              if (codeWrapper) {
                const code = codeWrapper.querySelector('code').innerText;
                // Set the MIME type of what you want to copy as. Use text/html to copy as HTML, text/plain to avoid inherited styles showing when pasted into rich text editor.
                (0, _copyToClipboard.default)(code, { format: 'text/plain' })
                this.$emit('copy-code-success', code)
              }
            }
          }
        }
      })
    }
  }
}
